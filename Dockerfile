# Stage 1: Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the application (if applicable)
# RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app /app

RUN npm install --only=production

EXPOSE 3000

CMD ["npx", "turbo", "dev"]
