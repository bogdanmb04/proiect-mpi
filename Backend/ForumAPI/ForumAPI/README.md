**For Docker**

*Production*

Provide a connection string in `appsettings.json`

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
    "ForumContext": "Host=localhost;Database=forum;Username={{ USERNAME }};Password={{ PASSWORD }};TrustServerCertificate=True;Pooling=True;"
  }
}
```

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