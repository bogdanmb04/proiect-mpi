using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ForumAPI.Models;

[Table("category")]
[Index("Name", Name = "name_uniq", IsUnique = true)]
public partial class Category
{
    [Key]
    [Column("category_id")]
    public long CategoryId { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [InverseProperty("Category")]
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}
