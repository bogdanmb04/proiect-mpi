using System.ComponentModel.DataAnnotations;

namespace ForumAPI.DataTransferObject.PostDTO
{
    public class MakePostDTO
    {
        [Required]
        public long UserId { get; set; }
        [Required]
        public int CategoryId { get; set; }
        [Required]
        public string? Title { get; set; }
        [Required]
        public string? Body { get; set; }
        public string[]? Images { get; set; }
    }
}
