using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ForumAPI.Models;

[Table("forumuser")]
[Index("Email", Name = "email_uniq", IsUnique = true)]
[Index("Username", Name = "username_uniq", IsUnique = true)]
public partial class Forumuser
{
    [Key]
    [Column("user_id")]
    public long UserId { get; set; }

    [Column("username")]
    [StringLength(15)]
    public string Username { get; set; } = null!;

    [Column("password", TypeName = "character varying")]
    public string Password { get; set; } = null!;

    [Column("email")]
    [StringLength(50)]
    public string Email { get; set; } = null!;

    [Column("description")]
    [StringLength(120)]
    public string Description { get; set; } = null!;

    [Column("icon")]
    public byte[]? Icon { get; set; }

    [Column("role")]
    public Role Role { get; set; }

    [InverseProperty("Followee")]
    public virtual ICollection<Follow> FollowFollowees { get; set; } = new List<Follow>();

    [InverseProperty("Follower")]
    public virtual ICollection<Follow> FollowFollowers { get; set; } = new List<Follow>();

    [InverseProperty("User")]
    public virtual ICollection<Forumlike> Forumlikes { get; set; } = new List<Forumlike>();

    [InverseProperty("User")]
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    [InverseProperty("User")]
    public virtual ICollection<Refreshtoken> Refreshtokens { get; set; } = new List<Refreshtoken>();
}
