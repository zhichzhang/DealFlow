# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose a port if needed
EXPOSE 3000

# Start the app
CMD ["ts-node", "src/index.ts"]
