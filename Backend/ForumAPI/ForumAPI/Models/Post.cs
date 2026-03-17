using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ForumAPI.Models;

[Table("post")]
public partial class Post
{
    [Key]
    [Column("post_id")]
    public long PostId { get; set; }

    [Column("category_id")]
    public long? CategoryId { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("title")]
    [StringLength(50)]
    public string? Title { get; set; }

    [Column("body")]
    public string? Body { get; set; }

    [Column("date")]
    public DateTime? Date { get; set; }

    [Column("parent_post_id")]
    public long? ParentPostId { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("Posts")]
    public virtual Category? Category { get; set; }

    [InverseProperty("ParentPost")]
    public virtual ICollection<Post> InverseParentPost { get; set; } = new List<Post>();

    [ForeignKey("ParentPostId")]
    [InverseProperty("InverseParentPost")]
    public virtual Post? ParentPost { get; set; }

    [InverseProperty("Post")]
    public virtual ICollection<Postimage> Postimages { get; set; } = new List<Postimage>();

    [ForeignKey("UserId")]
    [InverseProperty("Posts")]
    public virtual Forumuser User { get; set; } = null!;
}
