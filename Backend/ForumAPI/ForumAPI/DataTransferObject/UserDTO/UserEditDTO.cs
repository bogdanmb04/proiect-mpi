using System.ComponentModel.DataAnnotations;

namespace ForumAPI.DataTransferObject.UserDTO
{
    public class UserEditDTO
    {
        [Required]
        public long Id { get; set; }
        [Required]
        public string? Username { get; set; }
        [Required]
        public string? Description { get; set; }
        [Required]
        public string? Icon { get; set; }
    }
}
