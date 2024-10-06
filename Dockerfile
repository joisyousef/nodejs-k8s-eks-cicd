# Stage 1: Build Stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application (if applicable)
# RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app /app

# Install production dependencies
RUN npm install --only=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npx", "turbo", "dev"]
