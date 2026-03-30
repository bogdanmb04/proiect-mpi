using System.ComponentModel.DataAnnotations;

namespace ForumAPI.DataTransferObject.PostDTO
{
    public class CommentDTO
    {
        [Required]
        public long PostId { get; set; }
        [Required]
        public long UserId { get; set; }
        [Required]
        public string? Text { get; set; }
    }
}
