using System.ComponentModel.DataAnnotations;

namespace ForumAPI.DataTransferObject.UserDTO
{
    public class UserPreviewDTO
    {
        [Required]
        public long UserId { get; set; }
        [Required]
        public string? Username { get; set; }
        [Required]
        public string? Description { get; set; }
        [Required]
        public string? Icon { get; set; }
    }
}
