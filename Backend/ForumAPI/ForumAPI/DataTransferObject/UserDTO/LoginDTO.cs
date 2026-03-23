using System.ComponentModel.DataAnnotations;

namespace ForumAPI.DataTransferObject.UserDTO
{
    public class LoginDTO
    {
        [Required]
        public string? Username { get; set; }

        [Required]
        public string? Password { get; set; }
    }
}
