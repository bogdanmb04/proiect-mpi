FROM node:22 AS start-stage
WORKDIR /usr/src/app
COPY . .
RUN npm install

# FROM node:22 AS test-stage
# WORKDIR /usr/src/app
# COPY --from=start-stage /usr/src/app .
# RUN npx ng test --watch=false

FROM node:22 AS build-stage
WORKDIR /usr/src/app
# COPY --from=test-stage /usr/src/app .
COPY --from=start-stage /usr/src/app .
RUN npx ng build


FROM node:22 AS serve-stage
WORKDIR /usr/src/app
COPY --from=build-stage /usr/src/app .
# FROM nginx:alpine
# COPY --from=serve-stage /usr/src/app/dist /usr/share/nginx/html
RUN npm install -g serve
CMD ["serve", "dist/forumClient/browser"]