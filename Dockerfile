FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the application
# RUN npm run build

FROM node:20 AS production

WORKDIR /app

COPY --from=build /app /app

RUN npm install --only=production

RUN apt-get update && apt-get install -y curl && curl -I https://registry.npmjs.org

EXPOSE 3000

CMD ["npx", "turbo", "dev"]
