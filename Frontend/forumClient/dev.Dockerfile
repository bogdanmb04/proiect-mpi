# Dockerfile for development - see reference at https://docs.docker.com/guides/angular/develop/

FROM node:22 AS dev
ENV NODE_ENV=development
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 4200
CMD ["npm", "start", "--", "--host=0.0.0.0"]