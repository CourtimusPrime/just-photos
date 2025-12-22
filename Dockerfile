# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the applications
RUN bun run build

# Expose ports for backend (3000) and frontend (5173)
EXPOSE 3000 5173

# Start the development server (runs both apps in parallel)
CMD ["bun", "run", "dev"]