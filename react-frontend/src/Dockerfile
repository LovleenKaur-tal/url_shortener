# Dockerfile for React
FROM node:14-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the app for production
RUN npm run build

# Expose port 3000 (default port for React)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
