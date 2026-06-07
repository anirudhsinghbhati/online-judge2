FROM node:20-alpine

WORKDIR /app

# Copy dependency configuration files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy source code files
COPY . .

# Expose backend port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
