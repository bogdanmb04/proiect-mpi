namespace ForumAPI.DataTransferObject.PostDTO
{
    public class PostPreview
    {
        public long PostId { get; set; }
        public string? Username { get; set; }
        public string? Title { get; set; }
        public string? Category { get; set; }
        public string? Body { get; set; }
        public string[]? Images { get; set; }
    }
}
