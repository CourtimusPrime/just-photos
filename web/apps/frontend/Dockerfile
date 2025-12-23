# Build step
FROM oven/bun AS build
WORKDIR /app
COPY package*.json ../bun.lockb ../tsconfig.base.json ./
RUN bun install
COPY . .
RUN bun run build

# Serve step
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf