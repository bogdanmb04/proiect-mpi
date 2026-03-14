using System;
using System.Collections.Generic;
using ForumAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ForumAPI.DataContext;

public partial class ForumContext : DbContext
{
    public ForumContext()
    {
    }

    public ForumContext(DbContextOptions<ForumContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Follow> Follows { get; set; }

    public virtual DbSet<Forumlike> Forumlikes { get; set; }

    public virtual DbSet<Forumuser> Forumusers { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<Postimage> Postimages { get; set; }

    public virtual DbSet<Refreshtoken> Refreshtokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<Role>("role");

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("category_pkey");
        });

        modelBuilder.Entity<Follow>(entity =>
        {
            entity.HasKey(e => e.FollowId).HasName("follows_pkey");

            entity.HasOne(d => d.Followee).WithMany(p => p.FollowFollowees).HasConstraintName("follows_followee_id_fkey");

            entity.HasOne(d => d.Follower).WithMany(p => p.FollowFollowers).HasConstraintName("follows_follower_id_fkey");
        });

        modelBuilder.Entity<Forumlike>(entity =>
        {
            entity.HasKey(e => e.LikeId).HasName("forumlike_pkey");

            entity.HasOne(d => d.User).WithMany(p => p.Forumlikes).HasConstraintName("forumlike_user_id_fkey");
        });

        modelBuilder.Entity<Forumuser>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("forumuser_pkey");
            entity.Property(e => e.Role)
                .HasColumnName("role")
                .HasColumnType("role");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.PostId).HasName("post_pkey");

            entity.HasOne(d => d.Category).WithMany(p => p.Posts).HasConstraintName("post_category_id_fkey");

            entity.HasOne(d => d.ParentPost).WithMany(p => p.InverseParentPost).HasConstraintName("post_parent_post_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Posts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("post_user_id_fkey");
        });

        modelBuilder.Entity<Postimage>(entity =>
        {
            entity.HasKey(e => e.ImageId).HasName("postimage_pkey");

            entity.HasOne(d => d.Post).WithMany(p => p.Postimages).HasConstraintName("postimage_post_id_fkey");
        });

        modelBuilder.Entity<Refreshtoken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("refreshtoken_pkey");

            entity.HasOne(d => d.User).WithMany(p => p.Refreshtokens).HasConstraintName("refreshtoken_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
