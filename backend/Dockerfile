FROM node:18-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]