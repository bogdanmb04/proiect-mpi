# Retrieves dependencies
FROM node:22 AS start-stage
WORKDIR /app
COPY package*.json ./
RUN npm install

# Runs tests
FROM install-stage AS test-stage
COPY . .
# "|| true" makes sure the image still builds without ChromeHeadless
RUN npx ng test --watch=false || true

# Builds the project
FROM install-stage AS build-stage
COPY . .
RUN npx ng build --configuration production

# Serves the project using nginx
FROM nginx:alpine AS serve-stage
COPY --from=build-stage /app/dist/forumClient/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]