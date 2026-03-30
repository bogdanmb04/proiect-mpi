namespace ForumAPI.DataTransferObject.PostDTO
{
    public class PostDTO
    {
        public long Id { get; set; }
        public string? Title { get; set; }
        public string? Username { get; set; }
        public string? UserIcon { get; set; }
        public string? Body { get; set; }
        public string[]? Images { get; set; }
        public DateTime CreatedAt { get; set; }
        public long LikesNo { get; set; }
        public long CommentsNo { get; set; }
    }
}
