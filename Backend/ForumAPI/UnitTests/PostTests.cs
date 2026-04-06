using System.Security.Claims;
using ForumAPI.Controllers;
using ForumAPI.DataContext;
using ForumAPI.DataTransferObject.PostDTO;
using ForumAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace UnitTests;

[TestClass]
public sealed class PostsControllerTests
{
    private static ForumContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ForumContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ForumContext(options);
    }

    private static PostsController CreateController(ForumContext context, long? userId = null, string? role = null)
    {
        var controller = new PostsController(context);

        var claims = new List<Claim>();
        if (userId.HasValue)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.Value.ToString()));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        return controller;
    }

    [TestMethod]
    public async Task CategoryCreationConflict()
    {
        await using var context = CreateContext();
        context.Categories.Add(new Category { Name = "General" });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1, role: "ADMIN");

        var result = await controller.MakeCategory(new CategoryDTO { Name = "General" });

        Assert.IsInstanceOfType<ConflictObjectResult>(result);
    }

    [TestMethod]
    public async Task CannotLikeWithoutAnyClaims()
    {
        await using var context = CreateContext();
        context.Posts.Add(new Post { PostId = 1, UserId = 10, Title = "Title", Body = "Body" });
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.LikePost(1);

        Assert.IsInstanceOfType<UnauthorizedResult>(result);
    }

    [TestMethod]
    public async Task LikePostValidRequest()
    {
        await using var context = CreateContext();
        context.Posts.Add(new Post { PostId = 1, UserId = 10, Title = "Title", Body = "Body" });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 42, role: "USER");

        var result = await controller.LikePost(1);

        Assert.IsInstanceOfType<OkObjectResult>(result);
        var likeCount = await context.Forumlikes.CountAsync(l => l.PostId == 1 && l.UserId == 42);
        Assert.AreEqual(1, likeCount);
    }

    [TestMethod]
    public async Task LikePostAlreadyLikedShouldConflict()
    {
        await using var context = CreateContext();
        context.Posts.Add(new Post { PostId = 1, UserId = 10, Title = "Title", Body = "Body" });
        context.Forumlikes.Add(new Forumlike { PostId = 1, UserId = 42 });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 42, role: "USER");

        var result = await controller.LikePost(1);

        Assert.IsInstanceOfType<ConflictObjectResult>(result);
    }

    [TestMethod]
    public async Task LikePostMissingPostShouldReturnNotFound()
    {
        await using var context = CreateContext();
        var controller = CreateController(context, userId: 42, role: "USER");

        var result = await controller.LikePost(999);

        Assert.IsInstanceOfType<NotFoundObjectResult>(result);
    }

    [TestMethod]
    public async Task CannotUpdatePostUnlessAdminOrPoster()
    {
        await using var context = CreateContext();
        context.Posts.Add(new Post
        {
            PostId = 1,
            UserId = 100,
            Title = "Original",
            Body = "Original body",
            CategoryId = 1
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 200, role: "USER");
        var dto = new MakePostDTO
        {
            UserId = 200,
            CategoryId = 1,
            Title = "Updated",
            Body = "Updated body"
        };

        var result = await controller.UpdatePost(1, dto);

        Assert.IsInstanceOfType<ForbidResult>(result);
    }

    [TestMethod]
    public async Task UpdatePostShouldSucceedForOwner()
    {
        await using var context = CreateContext();
        context.Posts.Add(new Post
        {
            PostId = 1,
            UserId = 100,
            Title = "Original",
            Body = "Original body",
            CategoryId = 1
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 100, role: "USER");
        var dto = new MakePostDTO
        {
            UserId = 100,
            CategoryId = 2,
            Title = "Updated",
            Body = "Updated body"
        };

        var result = await controller.UpdatePost(1, dto);

        Assert.IsInstanceOfType<OkObjectResult>(result);
        var post = await context.Posts.FirstAsync(p => p.PostId == 1);
        Assert.AreEqual("Updated", post.Title);
        Assert.AreEqual("Updated body", post.Body);
        Assert.AreEqual(2L, post.CategoryId);
    }

    [TestMethod]
    public async Task UpdatePostShouldSucceedForAdmin()
    {
        await using var context = CreateContext();
        context.Posts.Add(new Post
        {
            PostId = 1,
            UserId = 100,
            Title = "Original",
            Body = "Original body",
            CategoryId = 1
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 999, role: "ADMIN");
        var dto = new MakePostDTO
        {
            UserId = 999,
            CategoryId = 3,
            Title = "Admin update",
            Body = "Admin body"
        };

        var result = await controller.UpdatePost(1, dto);

        Assert.IsInstanceOfType<OkObjectResult>(result);
        var post = await context.Posts.FirstAsync(p => p.PostId == 1);
        Assert.AreEqual("Admin update", post.Title);
        Assert.AreEqual("Admin body", post.Body);
        Assert.AreEqual(3L, post.CategoryId);
    }

    [TestMethod]
    public async Task UnlikePostShouldRemoveLikeWhenExists()
    {
        await using var context = CreateContext();
        context.Posts.Add(new Post { PostId = 1, UserId = 10, Title = "Title", Body = "Body" });
        context.Forumlikes.Add(new Forumlike { PostId = 1, UserId = 42 });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 42, role: "USER");

        var result = await controller.UnlikePost(1);

        Assert.IsInstanceOfType<OkObjectResult>(result);
        var likeCount = await context.Forumlikes.CountAsync(l => l.PostId == 1 && l.UserId == 42, TestContext.CancellationToken);
        Assert.AreEqual(0, likeCount);
    }

    public TestContext TestContext { get; set; }
}
