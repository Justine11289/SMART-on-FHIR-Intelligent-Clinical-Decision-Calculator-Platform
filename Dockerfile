# 階段 1: 編譯 TS 為 JS
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc

# 階段 2: 運行 Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/index.html .
COPY --from=builder /app/calculator.html .
COPY --from=builder /app/test-Patient.json .
COPY --from=builder /app/js ./js
COPY --from=builder /app/css ./css
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]