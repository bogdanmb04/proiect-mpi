using ForumAPI.DataContext;
using ForumAPI.DataTransferObject.PostDTO;
using ForumAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace ForumAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PostsController : ControllerBase
    {
        private readonly ForumContext _context;

        public PostsController(ForumContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.Postimages)
                .Where(p => p.ParentPostId == null)
                .OrderByDescending(p => p.Date)
                .ToListAsync();

            return Ok(new
            {
                posts = posts.Select(post => new
                {
                    userId = post.UserId,
                    userIcon = post.User.Icon != null ? Convert.ToBase64String(post.User.Icon) : null,
                    username = post.User.Username,
                    postId = post.PostId,
                    title = post.Title,
                    date = post.Date,
                    body = post.Body,
                    categoryId = post.CategoryId,
                    category = post.Category.Name,
                    images = post.Postimages
                        .OrderBy(img => img.ImageId)
                        .Select(img => Convert.ToBase64String(img.Image!)),
                    likeNo = _context.Forumlikes.Count(l => l.PostId == post.PostId),
                    commentNo = _context.Posts.Count(c => c.ParentPostId == post.PostId)
                }).ToList()
            });
        }

        [HttpGet("{category}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPosts(string category)
        {
            var query = await _context.Categories.FirstOrDefaultAsync(c => c.Name == category);
            if (query == null)
                return BadRequest("Category doesn't exist");

            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.Postimages)
                .Where(post => post.Category == query && post.ParentPostId == null)
                .OrderByDescending(post => post.Date)
                .ToListAsync();

            return Ok(new
            {
                posts = posts.Select(post => new
                {
                    userId = post.UserId,
                    userIcon = post.User.Icon != null ? Convert.ToBase64String(post.User.Icon) : null,
                    username = post.User.Username,
                    postId = post.PostId,
                    title = post.Title,
                    date = post.Date,
                    body = post.Body,
                    category = post.Category.Name,
                    images = post.Postimages
                        .Where(img => img.Image != null)
                        .OrderBy(img => img.ImageId)
                        .Select(img => Convert.ToBase64String(img.Image!)),
                    likeNo = _context.Forumlikes.Count(l => l.PostId == post.PostId),
                    commentNo = _context.Posts.Count(c => c.ParentPostId == post.PostId)
                }).ToList()
            });
        }


        [HttpGet("{id:long}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostsFromUser(long id)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.Postimages)
                .Where(p => p.UserId == id && p.ParentPostId == null)
                .OrderByDescending(p => p.Date)
                .ToListAsync();

            return Ok(new
            {
                posts = posts.Select(post => new
                {
                    userId = post.UserId,
                    userIcon = post.User.Icon != null ? Convert.ToBase64String(post.User.Icon) : null,
                    username = post.User.Username,
                    postId = post.PostId,
                    title = post.Title,
                    date = post.Date,
                    body = post.Body,
                    category = post.Category.Name,
                    images = post.Postimages
                        .Where(img => img.Image != null)
                        .OrderBy(img => img.ImageId)
                        .Select(img => Convert.ToBase64String(img.Image!)),
                    likeNo = _context.Forumlikes.Count(l => l.PostId == post.PostId),
                    commentNo = _context.Posts.Count(c => c.ParentPostId == post.PostId)
                }).ToList()
            });

        }

        [HttpGet("post/{id:long}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPost(long id)
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.Postimages)
                .Where(p => p.PostId == id)
                .FirstOrDefaultAsync();

            if (post == null)
            {
                return NotFound("Post not found");
            }

            return Ok(new
            {
                userId = post.UserId,
                userIcon = post.User.Icon != null ? Convert.ToBase64String(post.User.Icon) : null,
                username = post.User.Username,
                postId = post.PostId,
                title = post.Title,
                date = post.Date,
                body = post.Body,
                categoryId = post.CategoryId,
                category = post.Category.Name,
                images = post.Postimages
                    .Where(img => img.Image != null)
                    .OrderBy(img => img.ImageId)
                    .Select(img => Convert.ToBase64String(img.Image!)),
                likeNo = _context.Forumlikes.Count(l => l.PostId == post.PostId),
                commentNo = _context.Posts.Count(c => c.ParentPostId == post.PostId)
            });
        }

        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.Select(c => c.Name).ToArrayAsync();
            return Ok(categories);
        }

        [HttpGet("categories/full")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategoriesFull()
        {
            var categories = await _context.Categories
                .Select(c => new { categoryId = c.CategoryId, name = c.Name })
                .ToListAsync();
            return Ok(categories);
        }

        [HttpPost("category/create")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> MakeCategory([FromBody][Required] CategoryDTO category)
        {
            if (category == null || category.Name == null)
            {
                return BadRequest("No category given");
            }

            string name = category.Name;
            bool exists = await _context.Categories.AnyAsync(c => c.Name == name);
            if (exists)
            {
                return Conflict("Category already exists");
            }

            _context.Categories.Add(new Category() { Name = name });
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPosts), new { category = name }, new { name });
        }

        [HttpGet("comments/{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetPostComments(int id)
        {
            var comments = await _context.Posts
                .Where(p => p.ParentPostId == id)
                .Include(p => p.User)
                .Select(p => new
                {
                    userId = p.User.UserId,
                    username = p.User.Username,
                    userIcon = p.User.Icon,
                    commentText = p.Body
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost("comment")]
        public async Task<IActionResult> Comment([FromBody] CommentDTO comment)
        {
            var postToCommentOn = await _context.Posts.Where(p => p.PostId == comment.PostId).FirstAsync();
            if (postToCommentOn == null)
            {
                return BadRequest("Not a real post");
            }

            Post p = new()
            {
                Body = comment.Text,
                ParentPost = postToCommentOn,
                ParentPostId = postToCommentOn.PostId,
                UserId = comment.UserId,
                CategoryId = postToCommentOn.CategoryId
            };

            _context.Posts.Add(p);
            await _context.SaveChangesAsync();

            return Created();
        }

        [HttpPost]
        public async Task<ActionResult> PostPost([Required][FromBody] MakePostDTO post)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !long.TryParse(userIdClaim, out long userId))
            {
                return Unauthorized("Invalid user token");
            }

            Category? c = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == post.CategoryId);
            if (c == null)
            {
                return BadRequest("Category not found");
            }

            Forumuser? user = await _context.Forumusers.FindAsync(userId);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            List<byte[]> images = [];

            if (post.Images != null)
            {
                foreach (var image in post.Images)
                {
                    byte[] bytes = System.Convert.FromBase64String(image);
                    images.Add(bytes);
                }
            }

            Post p = new()
            {
                User = user,
                Category = c,
                Date = DateTime.Now,
                Title = post.Title!,
                Body = post.Body
            };

            _context.Posts.Add(p);

            if (post.Images != null && post.Images.Length > 0)
            {
                foreach (var image in post.Images)
                {
                    Postimage postImg = new()
                    {
                        Post = p,
                        Image = Convert.FromBase64String(image)
                    };
                    _context.Postimages.Add(postImg);
                }
            }
            await _context.SaveChangesAsync();

            return Ok($"{p.PostId}");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(long id, [FromBody] MakePostDTO dto)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            bool isOwner = post.UserId.ToString() == userIdClaim;
            bool isAdmin = userRole == "ADMIN";

            if (!isOwner && !isAdmin)
            {
                return Forbid();
            }

            post.Title = dto.Title ?? post.Title;
            post.Body = dto.Body ?? post.Body;
            post.CategoryId = dto.CategoryId;

            if (dto.Images != null)
            {
                var existingImages = await _context.Postimages.Where(pi => pi.PostId == id).ToListAsync();
                _context.Postimages.RemoveRange(existingImages);

                foreach (var base64Image in dto.Images)
                {
                    var imageBytes = Convert.FromBase64String(base64Image);
                    _context.Postimages.Add(new Postimage
                    {
                        PostId = id,
                        Image = imageBytes
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Post updated successfully" });
        }

        [HttpPost("{id:long}/like")]
        public async Task<IActionResult> LikePost(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !long.TryParse(userIdClaim, out var userId)) return Unauthorized();

            if (!await _context.Posts.AnyAsync(p => p.PostId == id))
                return NotFound("Post not found.");

            if (await _context.Forumlikes.AnyAsync(l => l.PostId == id && l.UserId == userId))
                return Conflict("Already liked.");

            _context.Forumlikes.Add(new Forumlike { PostId = id, UserId = userId });
            await _context.SaveChangesAsync();
            return Ok(new { liked = true, likeCount = await _context.Forumlikes.CountAsync(l => l.PostId == id) });
        }

        [HttpPost("{id:long}/unlike")]
        public async Task<IActionResult> UnlikePost(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !long.TryParse(userIdClaim, out var userId)) return Unauthorized();

            var like = await _context.Forumlikes.FirstOrDefaultAsync(l => l.PostId == id && l.UserId == userId);
            if (like == null) return NotFound("Like not found.");

            _context.Forumlikes.Remove(like);
            await _context.SaveChangesAsync();
            return Ok(new { liked = false, likeCount = await _context.Forumlikes.CountAsync(l => l.PostId == id) });
        }

        [HttpGet("{id:long}/like/state")]
        public async Task<IActionResult> IsPostLiked(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !long.TryParse(userIdClaim, out var userId)) return Unauthorized();

            var isLiked = await _context.Forumlikes.AnyAsync(l => l.PostId == id && l.UserId == userId);
            return Ok(new { isLiked });
        }
    }
}
