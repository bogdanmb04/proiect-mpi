using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ForumAPI.Models;

[Table("postimage")]
public partial class Postimage
{
    [Key]
    [Column("image_id")]
    public long ImageId { get; set; }

    [Column("post_id")]
    public long? PostId { get; set; }

    [Column("image")]
    public byte[]? Image { get; set; }

    [ForeignKey("PostId")]
    [InverseProperty("Postimages")]
    public virtual Post? Post { get; set; }
}
