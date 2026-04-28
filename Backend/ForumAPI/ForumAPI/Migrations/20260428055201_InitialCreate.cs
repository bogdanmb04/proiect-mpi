using System;
using ForumAPI.Models;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ForumAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:role", "ADMIN,USER")
                .Annotation("Npgsql:Enum:role.role", "USER,ADMIN");

            migrationBuilder.CreateTable(
                name: "category",
                columns: table => new
                {
                    category_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("category_pkey", x => x.category_id);
                });

            migrationBuilder.CreateTable(
                name: "forumuser",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    username = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    password = table.Column<string>(type: "character varying", nullable: false),
                    email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    icon = table.Column<byte[]>(type: "bytea", nullable: true),
                    role = table.Column<Role>(type: "role", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("forumuser_pkey", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "follows",
                columns: table => new
                {
                    follow_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    follower_id = table.Column<long>(type: "bigint", nullable: true),
                    followee_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("follows_pkey", x => x.follow_id);
                    table.ForeignKey(
                        name: "follows_followee_id_fkey",
                        column: x => x.followee_id,
                        principalTable: "forumuser",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "follows_follower_id_fkey",
                        column: x => x.follower_id,
                        principalTable: "forumuser",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "forumlike",
                columns: table => new
                {
                    like_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    post_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("forumlike_pkey", x => x.like_id);
                    table.ForeignKey(
                        name: "forumlike_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "forumuser",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "post",
                columns: table => new
                {
                    post_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    category_id = table.Column<long>(type: "bigint", nullable: true),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    body = table.Column<string>(type: "text", nullable: true),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    parent_post_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("post_pkey", x => x.post_id);
                    table.ForeignKey(
                        name: "post_category_id_fkey",
                        column: x => x.category_id,
                        principalTable: "category",
                        principalColumn: "category_id");
                    table.ForeignKey(
                        name: "post_parent_post_id_fkey",
                        column: x => x.parent_post_id,
                        principalTable: "post",
                        principalColumn: "post_id");
                    table.ForeignKey(
                        name: "post_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "forumuser",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "refreshtoken",
                columns: table => new
                {
                    token_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    token = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    expiry_date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("refreshtoken_pkey", x => x.token_id);
                    table.ForeignKey(
                        name: "refreshtoken_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "forumuser",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "postimage",
                columns: table => new
                {
                    image_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<long>(type: "bigint", nullable: true),
                    image = table.Column<byte[]>(type: "bytea", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("postimage_pkey", x => x.image_id);
                    table.ForeignKey(
                        name: "postimage_post_id_fkey",
                        column: x => x.post_id,
                        principalTable: "post",
                        principalColumn: "post_id");
                });

            migrationBuilder.CreateIndex(
                name: "name_uniq",
                table: "category",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_follows_followee_id",
                table: "follows",
                column: "followee_id");

            migrationBuilder.CreateIndex(
                name: "IX_follows_follower_id",
                table: "follows",
                column: "follower_id");

            migrationBuilder.CreateIndex(
                name: "IX_forumlike_user_id",
                table: "forumlike",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "email_uniq",
                table: "forumuser",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "username_uniq",
                table: "forumuser",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_post_category_id",
                table: "post",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_parent_post_id",
                table: "post",
                column: "parent_post_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_user_id",
                table: "post",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_postimage_post_id",
                table: "postimage",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_refreshtoken_user_id",
                table: "refreshtoken",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "follows");

            migrationBuilder.DropTable(
                name: "forumlike");

            migrationBuilder.DropTable(
                name: "postimage");

            migrationBuilder.DropTable(
                name: "refreshtoken");

            migrationBuilder.DropTable(
                name: "post");

            migrationBuilder.DropTable(
                name: "category");

            migrationBuilder.DropTable(
                name: "forumuser");
        }
    }
}
