using NpgsqlTypes;

namespace ForumAPI.Models
{
    public enum Role
    {
        [PgName("USER")]
        USER,
        [PgName("ADMIN")]
        ADMIN
    }
}
