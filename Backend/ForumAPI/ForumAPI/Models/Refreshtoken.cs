using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ForumAPI.Models;

[Table("refreshtoken")]
public partial class Refreshtoken
{
    [Key]
    [Column("token_id")]
    public long TokenId { get; set; }

    [Column("user_id")]
    public long? UserId { get; set; }

    [Column("token")]
    [StringLength(200)]
    public string Token { get; set; } = null!;

    [Column("expiry_date", TypeName = "timestamp without time zone")]
    public DateTime ExpiryDate { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Refreshtokens")]
    public virtual Forumuser? User { get; set; }
}
