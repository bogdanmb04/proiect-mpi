# Forum Application

The following project contains both the frontend and backend application used for creating a forum web app.

| member                 | role               |
|------------------------|--------------------|
| Bunduc Silviu-Cristian | DevOps, QA         |
| Bociu Bogdan-Marian    | Backend Developer  |
| Neagu Roxana           | Frontend Developer |

## Technologies
- C# + ASP.NET
- Angular w/ TS
- Postgresql

## Features
The app has the following features implemented:

### Regular users can:
- register and login to their accounts
- edit their username, profile description and their profile picture
- follows / unfollow other users within the application
- create posts within a category, containing text and images within it
- comment on a post
- edit their own posts

### Admins can additionally:
- edit any user's posts

## Containers
Check out the README's of each module of the project (Frontend/forumClient and Backend/ForumAPI/ForumAPI). Before running them, make sure you fill in the required environment variables in a `.env` file in the root directory.

```bash
$ cat .env.example > .env
nano .env
```

You should be ready to go. Start all containers using Docker Compose:
```bash
$ docker compose up --build
```

Migrations are known to mess up the workflow of the app, specifically due to the `ROLE` enum, which is a Postgres-specific object that might not map well with Entity Framework. To avoid this you can just attach a bash session to the database container and restore the database using the `forum.sql` dump located in the backend module.
```bash
$ docker exec -it proiect-mpi-database-1 psql -U [your user here] -d forum -f Backend/ForumAPI/ForumAPI/forum.sql
```

To run migrations, you can either use the `dotnet ef` tool, or provide this line of code in Program.cs:

```cs
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ForumContext>();
    db.Database.EnsureCreated();
}
```

Use `psql` inside the container to also create forum categories and assign as admin existing users.

And that's pretty much it! Enjoy your self-hosted FOSS forum!
