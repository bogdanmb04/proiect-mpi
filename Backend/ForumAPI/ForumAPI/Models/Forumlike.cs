using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ForumAPI.Models;

[Table("forumlike")]
public partial class Forumlike
{
    [Key]
    [Column("like_id")]
    public long LikeId { get; set; }

    [Column("user_id")]
    public long? UserId { get; set; }

    [Column("post_id")]
    public long? PostId { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Forumlikes")]
    public virtual Forumuser? User { get; set; }
}
