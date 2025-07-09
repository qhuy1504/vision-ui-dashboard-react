# --- Build stage ---
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Copy project files
    COPY . .
    
    # Cài dependencies
    RUN npm install
    
    # Build Vite app
    RUN npm run build
    
    # --- Serve stage ---
    FROM nginx:alpine
    
    # Copy built files từ builder vào NGINX folder
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # (Tuỳ chọn) Gỡ cấu hình mặc định và thêm cấu hình custom nếu có
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    