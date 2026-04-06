using System.Security.Claims;
using ForumAPI.Controllers;
using ForumAPI.DataContext;
using ForumAPI.DataTransferObject.UserDTO;
using ForumAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace UnitTests;

[TestClass]
public sealed class UserTests
{
    private static ForumContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ForumContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ForumContext(options);
    }

    private static ForumUsersController CreateController(ForumContext context, long? userId = null, string? refreshToken = null)
    {
        var jwtOptions = Options.Create(new JWTSettings
        {
            SecretKey = "this_is_a_test_secret_key_with_enough_length_12345"
        });

        var controller = new ForumUsersController(context, jwtOptions);

        var claims = new List<Claim>();
        if (userId.HasValue)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.Value.ToString()));
        }

        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = principal };
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            httpContext.Request.Headers.Cookie = $"refreshToken={refreshToken}";
        }

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };

        return controller;
    }

    private static Forumuser CreateUser(long userId, string username, string email, string password = "password")
    {
        return new Forumuser
        {
            UserId = userId,
            Username = username,
            Email = email,
            Password = password,
            Description = "",
            Role = Role.USER
        };
    }

    private static T? GetAnonymousProperty<T>(object? source, string propertyName)
    {
        var property = source?.GetType().GetProperty(propertyName);
        if (property == null)
        {
            return default;
        }

        return (T?)property.GetValue(source);
    }

    [TestMethod]
    public async Task NonExistingUserReturnsBadRequest()
    {
        await using var context = CreateContext();
        var controller = CreateController(context);

        var result = await controller.GetForumUserProfile(0);

        Assert.IsInstanceOfType<BadRequestResult>(result);
    }

    [TestMethod]
    public async Task NotFoundWhenProfileUserDoesNotExist()
    {
        await using var context = CreateContext();
        var controller = CreateController(context);

        var result = await controller.GetForumUserProfile(123);

        Assert.IsInstanceOfType<NotFoundResult>(result);
    }

    [TestMethod]
    public async Task ProfileContainsFollowerAndFollowingCounts()
    {
        await using var context = CreateContext();
        context.Forumusers.AddRange(
            CreateUser(1, "target", "target@test.com"),
            CreateUser(2, "follower", "follower@test.com"),
            CreateUser(3, "followee", "followee@test.com"));
        context.Follows.AddRange(
            new Follow { FollowerId = 2, FolloweeId = 1 },
            new Follow { FollowerId = 1, FolloweeId = 3 });
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.GetForumUserProfile(1);

        var okResult = result as OkObjectResult;
        Assert.IsNotNull(okResult);
        Assert.AreEqual(1, GetAnonymousProperty<int>(okResult.Value, "followerCount"));
        Assert.AreEqual(1, GetAnonymousProperty<int>(okResult.Value, "followingCount"));
    }

    [TestMethod]
    public async Task UnauthorizedWhenFollowHasNoClaims()
    {
        await using var context = CreateContext();
        context.Forumusers.Add(CreateUser(2, "bob", "bob@test.com"));
        await context.SaveChangesAsync();

        var controller = CreateController(context);
        var result = await controller.Follow(2);

        Assert.IsInstanceOfType<UnauthorizedResult>(result);
    }

    [TestMethod]
    public async Task CannotFollowYourself()
    {
        await using var context = CreateContext();
        context.Forumusers.Add(CreateUser(1, "alice", "alice@test.com"));
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.Follow(1);

        Assert.IsInstanceOfType<BadRequestObjectResult>(result);
    }

    [TestMethod]
    public async Task FollowReturnsNotFoundWhenTargetUserMissing()
    {
        await using var context = CreateContext();
        context.Forumusers.Add(CreateUser(1, "alice", "alice@test.com"));
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.Follow(999);

        Assert.IsInstanceOfType<NotFoundObjectResult>(result);
    }

    [TestMethod]
    public async Task ConflictWhenAlreadyFollowing()
    {
        await using var context = CreateContext();
        context.Forumusers.AddRange(
            CreateUser(1, "alice", "alice@test.com"),
            CreateUser(2, "bob", "bob@test.com"));
        context.Follows.Add(new Follow { FollowerId = 1, FolloweeId = 2 });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);

        var result = await controller.Follow(2);

        Assert.IsInstanceOfType<ConflictObjectResult>(result);
    }

    [TestMethod]
    public async Task FollowIsOk()
    {
        await using var context = CreateContext();
        context.Forumusers.AddRange(
            CreateUser(10, "alice", "alice@test.com"),
            CreateUser(20, "bob", "bob@test.com"));
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 10);

        var result = await controller.Follow(20);

        Assert.IsInstanceOfType<OkObjectResult>(result);
        Assert.IsTrue(await context.Follows.AnyAsync(f => f.FollowerId == 10 && f.FolloweeId == 20));
    }

    [TestMethod]
    public async Task CannotUnfollowIfNotFollowing()
    {
        await using var context = CreateContext();
        context.Forumusers.AddRange(
            CreateUser(1, "alice", "alice@test.com"),
            CreateUser(2, "bob", "bob@test.com"));
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);

        var result = await controller.Unfollow(2);

        Assert.IsInstanceOfType<NotFoundObjectResult>(result);
    }

    [TestMethod]
    public async Task UnauthorizedWhenUnfollowHasNoClaims()
    {
        await using var context = CreateContext();
        var controller = CreateController(context);

        var result = await controller.Unfollow(2);

        Assert.IsInstanceOfType<UnauthorizedResult>(result);
    }

    [TestMethod]
    public async Task UnfollowRemovesExistingRelationship()
    {
        await using var context = CreateContext();
        context.Forumusers.AddRange(
            CreateUser(1, "alice", "alice@test.com"),
            CreateUser(2, "bob", "bob@test.com"));
        context.Follows.Add(new Follow { FollowerId = 1, FolloweeId = 2 });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 1);
        var result = await controller.Unfollow(2);

        Assert.IsInstanceOfType<OkObjectResult>(result);
        Assert.IsFalse(await context.Follows.AnyAsync(f => f.FollowerId == 1 && f.FolloweeId == 2));
    }

    [TestMethod]
    public async Task IsFollowingIfAlreadyFollows()
    {
        await using var context = CreateContext();
        context.Forumusers.AddRange(
            CreateUser(3, "alice", "alice@test.com"),
            CreateUser(4, "bob", "bob@test.com"));
        context.Follows.Add(new Follow { FollowerId = 3, FolloweeId = 4 });
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 3);

        var result = await controller.IsFollowing(4);

        var okResult = result as OkObjectResult;
        Assert.IsNotNull(okResult);

        var property = okResult.Value?.GetType().GetProperty("isFollowing");
        Assert.IsNotNull(property);
        var value = (bool?)property.GetValue(okResult.Value!);
        Assert.IsTrue(value);
    }

    [TestMethod]
    public async Task IsFollowingUnauthorizedWhenNoClaims()
    {
        await using var context = CreateContext();
        var controller = CreateController(context);

        var result = await controller.IsFollowing(2);

        Assert.IsInstanceOfType<UnauthorizedResult>(result);
    }

    [TestMethod]
    public async Task IsFollowingSelfIsAlwaysFalse()
    {
        await using var context = CreateContext();
        context.Forumusers.Add(CreateUser(3, "alice", "alice@test.com"));
        await context.SaveChangesAsync();

        var controller = CreateController(context, userId: 3);
        var result = await controller.IsFollowing(3);

        var okResult = result as OkObjectResult;
        Assert.IsNotNull(okResult);
        Assert.IsFalse(GetAnonymousProperty<bool>(okResult.Value, "isFollowing"));
    }

    [TestMethod]
    public async Task RefreshTokenRequiresCookie()
    {
        await using var context = CreateContext();
        var controller = CreateController(context);

        var result = await controller.RefreshToken();

        Assert.IsInstanceOfType<BadRequestObjectResult>(result);
    }

    [TestMethod]
    public async Task RefreshTokenRejectsUnknownToken()
    {
        await using var context = CreateContext();
        var controller = CreateController(context, refreshToken: "missing-token");

        var result = await controller.RefreshToken();

        Assert.IsInstanceOfType<UnauthorizedObjectResult>(result);
    }

    [TestMethod]
    public async Task RefreshTokenReturnsOkForValidToken()
    {
        await using var context = CreateContext();
        var user = CreateUser(20, "valid-user", "valid@test.com");
        context.Forumusers.Add(user);
        context.Refreshtokens.Add(new Refreshtoken
        {
            Token = "valid-token",
            UserId = user.UserId,
            ExpiryDate = DateTime.UtcNow.AddMinutes(10)
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, refreshToken: "valid-token");
        var result = await controller.RefreshToken();

        var okResult = result as OkObjectResult;
        Assert.IsNotNull(okResult);
        Assert.AreEqual("valid-user", GetAnonymousProperty<string>(okResult.Value, "Username"));
    }

    [TestMethod]
    public async Task JWT_TokenExpirationTest()
    {
        await using var context = CreateContext();
        var user = CreateUser(100, "alice", "alice@test.com");
        context.Forumusers.Add(user);
        context.Refreshtokens.Add(new Refreshtoken
        {
            Token = "expired-token",
            UserId = user.UserId,
            ExpiryDate = DateTime.UtcNow.AddMinutes(-1)
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, refreshToken: "expired-token");

        var result = await controller.RefreshToken();

        Assert.IsInstanceOfType<UnauthorizedObjectResult>(result);
    }

    [TestMethod]
    public async Task UnauthorizedInvalidPassword()
    {
        await using var context = CreateContext();
        var user = CreateUser(7, "alice", "alice@test.com");
        var hasher = new PasswordHasher<Forumuser>();
        user.Password = hasher.HashPassword(user, "correct-password");
        context.Forumusers.Add(user);
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.Login(new LoginDTO
        {
            Username = "alice",
            Password = "wrong-password"
        });

        Assert.IsInstanceOfType<UnauthorizedObjectResult>(result);
    }

    [TestMethod]
    public async Task LoginReturnsNotFoundForUnknownUsername()
    {
        await using var context = CreateContext();
        var controller = CreateController(context);

        var result = await controller.Login(new LoginDTO
        {
            Username = "unknown",
            Password = "password"
        });

        Assert.IsInstanceOfType<NotFoundObjectResult>(result);
    }
}
