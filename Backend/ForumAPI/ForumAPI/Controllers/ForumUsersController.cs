using ForumAPI.DataContext;
using ForumAPI.DataTransferObject.UserDTO;
using ForumAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ForumAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ForumUsersController(ForumContext context, IOptions<JWTSettings> jwtSettings) : ControllerBase
    {
        private readonly ForumContext _context = context;
        private readonly PasswordHasher<Forumuser> _passwordHasher = new();
        private readonly JWTSettings _jwtSettings = jwtSettings.Value;

        [HttpGet("profile/{id:long}")]
        [AllowAnonymous]
        [EndpointDescription("Get a user's profile information by their ID. Returns username, description, icon, follower count, and following count.")]
        public async Task<IActionResult> GetForumUserProfile(long id)
        {
            if (id <= 0) return BadRequest();

            var forumUser = await _context.Forumusers.FirstOrDefaultAsync(user => user.UserId == id);
            if (forumUser == null) return NotFound();

            var followerCount = await _context.Follows.CountAsync(f => f.FolloweeId == id);
            var followingCount = await _context.Follows.CountAsync(f => f.FollowerId == id);

            return Ok(new
            {
                username = forumUser.Username,
                description = forumUser.Description,
                icon = forumUser.Icon != null ? Convert.ToBase64String(forumUser.Icon) : null,
                followerCount,
                followingCount
            });
        }

        [HttpPost("profile/edit")]
        public async Task<IActionResult> EditForumUserProfile([FromBody] UserEditDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !long.TryParse(userIdClaim, out long userId))
            {
                return Unauthorized();
            }

            var forumUser = await _context.Forumusers
                .Where(user => user.UserId == userId)
                .FirstOrDefaultAsync();

            if (forumUser == null)
            {
                return NotFound();
            }

            if (_context.Forumusers.Where(u => u.Username == dto.Username).FirstOrDefault() != null)
                return BadRequest("Username already taken!");

            forumUser.Username = dto.Username!;
            forumUser.Description = dto.Description!;
            forumUser.Icon = Convert.FromBase64String(dto.Icon!);

            _context.Forumusers.Update(forumUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully!" });
        }

        [HttpGet("profile/{id:long}/followers")]
        [AllowAnonymous]
        public async Task<ActionResult> GetForumUserFollowers(long id)
        {
            var userFollowers = await _context.Forumusers
                .Where(user => user.UserId == id)
                .SelectMany(user => user.FollowFollowers)
                .ToListAsync();

            if (userFollowers.Count == 0)
            {
                return Ok(null);
            }

            List<Forumuser> followers = [];

            foreach (var follow in userFollowers)
            {
                var follower = await _context.Forumusers
                    .Where(u => u.UserId == follow.FollowerId)
                    .FirstOrDefaultAsync();
                if (follower != null)
                {
                    followers.Add(follower);
                }
            }

            return Ok(new
            {
                followers = followers.Select(follower => new UserPreviewDTO
                {
                    UserId = follower.UserId,
                    Username = follower.Username,
                    Description = follower.Description,
                    Icon = follower.Icon != null ? Convert.ToBase64String(follower.Icon) : null
                }).ToList()
            });
        }

        [HttpGet("profile/{id:long}/following")]
        [AllowAnonymous]
        public async Task<ActionResult> GetForumUserFollowing(long id)
        {
            var userFollowing = await _context.Forumusers
                .Where(user => user.UserId == id)
                .SelectMany(user => user.FollowFollowees)
                .ToListAsync();

            if (userFollowing.Count == 0)
            {
                return Ok(null);
            }

            List<Forumuser> followees = [];

            foreach (var follow in userFollowing)
            {
                var followee = await _context.Forumusers
                    .Where(u => u.UserId == follow.FolloweeId)
                    .FirstOrDefaultAsync();
                if (followee != null)
                {
                    followees.Add(followee);
                }
            }

            return Ok(new
            {
                following = followees.Select(followee => new UserPreviewDTO
                {
                    UserId = followee.UserId,
                    Username = followee.Username,
                    Description = followee.Description,
                    Icon = followee.Icon != null ? Convert.ToBase64String(followee.Icon) : null
                }).ToList()
            });
        }

        //[HttpGet("profile/{id:long}/likes")]
        //[AllowAnonymous]
        //public async Task<ActionResult> GetForumUserLikes(long id)
        //{
        //    var userLikes = await _context.Forumusers
        //        .Where(user => user.UserId == id)
        //        .SelectMany(user => user.Forumlikes)
        //        .ToListAsync();

        //    if (userLikes.Count == 0)
        //    {
        //        return Ok(null);
        //    }

        //    List<Post> likedPosts = [];

        //    foreach (var like in userLikes)
        //    {
        //        var post = await _context.Posts
        //            .Where(p => p.PostId == like.PostId)
        //            .FirstOrDefaultAsync();
        //        if (post != null)
        //        {
        //            likedPosts.Add(post);
        //        }
        //    }

        //    if (likedPosts.Count == 0)
        //    {
        //        return Ok(null);
        //    }

        //    List<PostDTO> likedPostsDTO = [.. likedPosts.Select(post => new PostDTO
        //    {
        //        Id = post.PostId,
        //        Title = post.Title,
        //        Body = post.Body,
        //        CreatedAt = post.Date ?? DateTime.MinValue,
        //        Username = _context.Forumusers.Where(u => u.UserId == post.UserId).Select(u => u.Username).FirstOrDefault(),
        //        UserIcon = _context.Forumusers.Where(u => u.UserId == post.UserId).Select(u => u.Icon != null ? Convert.ToBase64String(u.Icon) : null).FirstOrDefault(),
        //        LikesNo = _context.Forumlikes.Count(l => l.PostId == post.PostId),
        //        CommentsNo = _context.Posts.Count(p => p.ParentPostId == post.PostId),
        //    })];

        //    return Ok(likedPostsDTO);
        //}

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            if (await _context.Forumusers.AnyAsync(u => u.Username == dto.Username))
                return Conflict("Username already taken!");

            if (await _context.Forumusers.AnyAsync(u => u.Email == dto.Email))
                return Conflict("Email already in use!");

            var user = new Forumuser
            {
                Username = dto.Username,
                Email = dto.Email,
                Description = "",
                Icon = System.IO.File.ReadAllBytes(@"Resources/default_icon.png"),
                Password = dto.Password,
                Role = Role.USER
            };

            user.Password = _passwordHasher.HashPassword(user, dto.Password);

            _context.Forumusers.Add(user);
            await _context.SaveChangesAsync();

            Refreshtoken refreshToken = GenerateRefreshToken();
            refreshToken.UserId = user.UserId;
            _context.Refreshtokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            var accessToken = GenerateAccessToken(user.UserId, user.Role);

            Response.Cookies.Append("accessToken", accessToken, GetAccessCookieOptions());
            Response.Cookies.Append("refreshToken", refreshToken.Token, GetRefreshCookieOptions());

            return Ok(new
            {
                message = "Successfully created account!",
                username = user.Username,
                userId = user.UserId
            });
        }

        private static Refreshtoken GenerateRefreshToken()
        {
            Refreshtoken refreshToken = new();

            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                refreshToken.Token = Convert.ToBase64String(randomNumber);
            }
            refreshToken.ExpiryDate = DateTime.SpecifyKind(DateTime.UtcNow.AddMonths(6), DateTimeKind.Unspecified);

            return refreshToken;
        }

        [HttpPost("refreshtoken")]
        [AllowAnonymous]
        public async Task<ActionResult> RefreshToken()
        {
            var refreshTokenFromCookie = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshTokenFromCookie))
            {
                return BadRequest("Refresh token is required");
            }

            var storedRefreshToken = await _context.Refreshtokens
                .Include(rt => rt.User)
                .Where(rt => rt.Token == refreshTokenFromCookie)
                .OrderByDescending(rt => rt.ExpiryDate)
                .FirstOrDefaultAsync();

            if (storedRefreshToken == null)
            {
                return Unauthorized("Invalid refresh token");
            }

            if (storedRefreshToken.ExpiryDate <= DateTime.UtcNow)
            {
                Response.Cookies.Delete("accessToken");
                Response.Cookies.Delete("refreshToken");
                return Unauthorized("Refresh token expired");
            }

            if (storedRefreshToken.User == null)
            {
                return Unauthorized("User not found");
            }

            var newAccessToken = GenerateAccessToken(storedRefreshToken.User.UserId, storedRefreshToken.User.Role);

            Response.Cookies.Append("accessToken", newAccessToken, GetAccessCookieOptions());

            return Ok(new
            {
                storedRefreshToken.User.Username,
                storedRefreshToken.User.UserId,
                Icon = storedRefreshToken.User.Icon != null ? Convert.ToBase64String(storedRefreshToken.User.Icon) : null,
                Role = storedRefreshToken.User.Role.ToString()
            });
        }

        private string GenerateAccessToken(long userId, Role role)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                    new Claim(ClaimTypes.Name, userId.ToString()),
                    new Claim("role", role.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(15),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult> Login([FromBody] LoginDTO loginInformation)
        {
            var user = await _context.Forumusers
                .Where(u => u.Username.Equals(loginInformation.Username))
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("Incorrect username");
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.Password, loginInformation.Password);
            if (verificationResult != PasswordVerificationResult.Success)
            {
                return Unauthorized("Incorrect password");
            }

            Refreshtoken refreshToken = GenerateRefreshToken();
            refreshToken.UserId = user.UserId;
            _context.Refreshtokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            var accessToken = GenerateAccessToken(user.UserId, user.Role);

            Response.Cookies.Append("accessToken", accessToken, GetAccessCookieOptions());
            Response.Cookies.Append("refreshToken", refreshToken.Token, GetRefreshCookieOptions());

            return Ok(new
            {
                user.Username,
                user.UserId,
                Icon = user.Icon != null ? Convert.ToBase64String(user.Icon) : null,
                Role = user.Role.ToString()
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim != null && long.TryParse(userIdClaim, out long userId))
            {
                var tokens = _context.Refreshtokens.Where(rt => rt.UserId == userId);
                _context.Refreshtokens.RemoveRange(tokens);
                await _context.SaveChangesAsync();
            }

            Response.Cookies.Append("accessToken", "", GetLogoutCookieOptions());
            Response.Cookies.Append("refreshToken", "", GetLogoutCookieOptions());

            return Ok(new { message = "Successfully logged out" });
        }

        private static CookieOptions GetAccessCookieOptions()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            return new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(15),
                Path = "/"
            };
        }

        private static CookieOptions GetRefreshCookieOptions()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            return new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMonths(6),
                Path = "/api/ForumUsers"
            };
        }

        private static CookieOptions GetLogoutCookieOptions()
        {
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            return new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(-1),
                Path = "/"
            };
        }

        [HttpPost("follow/{id:long}")]
        [Authorize]
        public async Task<IActionResult> Follow(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !long.TryParse(userIdClaim, out var currentUserId)) return Unauthorized();
            if (id == currentUserId) return BadRequest("Cannot follow yourself.");

            if (!await _context.Forumusers.AnyAsync(u => u.UserId == id)) return NotFound("User not found.");
            if (await _context.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.FolloweeId == id))
                return Conflict("Already following.");

            _context.Follows.Add(new Follow { FollowerId = currentUserId, FolloweeId = id });
            await _context.SaveChangesAsync();
            return Ok(new { message = "Followed successfully" });
        }

        [HttpPost("unfollow/{id:long}")]
        [Authorize]
        public async Task<IActionResult> Unfollow(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !long.TryParse(userIdClaim, out var currentUserId)) return Unauthorized();

            var follow = await _context.Follows.FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FolloweeId == id);
            if (follow == null) return NotFound("Not following.");

            _context.Follows.Remove(follow);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Unfollowed successfully" });
        }

        [HttpGet("follow/state/{id:long}")]
        [Authorize]
        public async Task<IActionResult> IsFollowing(long id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !long.TryParse(userIdClaim, out var currentUserId)) return Unauthorized();
            if (id == currentUserId) return Ok(new { isFollowing = false });

            var isFollowing = await _context.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.FolloweeId == id);
            return Ok(new { isFollowing });
        }
    }
}
