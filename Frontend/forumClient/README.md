# Containers
## Individual container setup (without Docker Compose)


Build frontend production image using Dockerfile:
```bash
docker build -t forum-front-prod .
```
The Karma server might require you to have a CHROME_BIN environment variable set (basically have a Chromium browser installed on your system). This is not required

Start the container
```bash
docker run -d -p [your desired port]:80 forum-front-prod
```
Remove `-d` to have the container attached to your terminal session. You can always reattach with `docker container attach [container name]`

And your container now runs! Go to `http://localhost:[your desired port]` and you should see the app running. Of course, you should also have your backend running to get the full experience, for that checkout the README in Backend/ForumAPI/ForumAPI, or use Docker Compose to automate the process.

To stop the container, run `docker container ps` and check for your container's name - say your container is named [beloved_noyce]. Run:
```bash
docker container stop beloved_noyce
```

To start the development containers you would do the same thing, only difference is that now you should specify the dockerfile to be `dev.Dockerfile`:
```bash
docker build -t forum-front-dev --file dev.Dockerfile .
docker run -d -p [your desired port]:80 forum-front-dev
```

# ForumClient

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
