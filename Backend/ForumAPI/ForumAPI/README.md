# Forum API
## Setup
Provide a connection string in either `appsettings.json` or `appsettings.Development.json`, depending on if you start the API in production or development mode:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "ForumContext": "Host=localhost;Database=forum;Username={{ USERNAME }};Password={{ PASSWORD }};Pooling=True;"
  }
}
```

# Containers
## Individual container setup (without Docker Compose)

Build frontend production image using Dockerfile:
```bash
docker build -t forum-back-prod .
```

Start the container
```bash
docker run -d -p [your desired port]:80 forum-back-prod
```
Remove `-d` to have the container attached to your terminal session. You can always reattach with `docker container attach [container name]`

To run properly, the container needs to attach to a PostgreSQL database. For easier usage, use Docker Compose with the configurations attached in the root of the repository.

To stop the container, run `docker container ps` and check for your container's name - say your container is named [beloved_noyce]. Run:
```bash
docker container stop beloved_noyce
```

To start the development containers you would do the same thing, only difference is that now you should specify the dockerfile to be `dev.Dockerfile`:
```bash
docker build -t forum-back-dev --file dev.Dockerfile .
docker run -d -p [your desired port]:80 forum-back-dev
```

*Production*


Build the image
```bash
$ docker build -t forumapi .
```

Start the container
```bash
$ docker run -p 5000:8080 forumapi
```
This will map port 8080 of the container to accept requests from port 5000. Make sure you have .NET 10 SDK installed. In case you get this error:
```bash
permission denied while trying to connect to the docker API at unix:///var/run/docker.sock
```
An easy solution is to run each Docker command in sudo mode, however it might not be ideal. Make sure your Docker process is properly started.