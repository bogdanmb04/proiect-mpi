using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ForumAPI.Models;

[Table("follows")]
public partial class Follow
{
    [Key]
    [Column("follow_id")]
    public long FollowId { get; set; }

    [Column("follower_id")]
    public long? FollowerId { get; set; }

    [Column("followee_id")]
    public long? FolloweeId { get; set; }

    [ForeignKey("FolloweeId")]
    [InverseProperty("FollowFollowees")]
    public virtual Forumuser? Followee { get; set; }

    [ForeignKey("FollowerId")]
    [InverseProperty("FollowFollowers")]
    public virtual Forumuser? Follower { get; set; }
}
