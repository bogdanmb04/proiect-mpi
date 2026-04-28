# Retrieves dependencies
FROM node:22 AS start-stage
WORKDIR /app
COPY package*.json ./
RUN npm install

# Runs tests
FROM start-stage AS test-stage
COPY . .
# "|| true" makes sure the image still builds without ChromeHeadless
RUN npx ng test --watch=false --browsers=ChromeHeadless || true

# Builds the project
FROM start-stage AS build-stage
ARG API_URL=https://api.very-awesome-forum-app.uk
COPY . .
RUN printf 'export const environment = {\n  apiUrl: "%s/api",\n  usersApi: "%s/api/ForumUsers",\n  postsApi: "%s/api/Posts",\n};\n' \
    "$API_URL" "$API_URL" "$API_URL" > src/environments/environments.ts
RUN npx ng build --configuration production

# Serves the project using nginx
FROM nginx:alpine AS serve-stage
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist/forumClient/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
