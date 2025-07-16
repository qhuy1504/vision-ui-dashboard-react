# --- Build stage ---
    FROM node:20-bullseye AS builder

    WORKDIR /app
    
    # Copy package.json và cài dependencies
    COPY package*.json ./
    RUN npm install --legacy-peer-deps
    
    # Copy toàn bộ source code vào
    COPY . .
    
    # Build ứng dụng (React scripts sẽ build ra /app/build)
    RUN npm run build
    
    # --- Serve stage ---
    FROM nginx:alpine
    
    # Copy các file build từ builder vào thư mục public của NGINX
    COPY --from=builder /app/build /usr/share/nginx/html
    
    # EXPOSE port
    EXPOSE 80
    
    # Khởi động nginx
    CMD ["nginx", "-g", "daemon off;"]
    
    # No additional instructions needed here