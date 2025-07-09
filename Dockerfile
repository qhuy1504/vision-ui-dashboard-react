# --- Build stage ---
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Copy package files và cài dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy source code vào
    COPY . .
    
    # Build app
    RUN npm run build
    
    # --- Serve stage ---
    FROM nginx:alpine
    
    # Copy build folder từ builder stage
    COPY --from=builder /app/build /usr/share/nginx/html
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    