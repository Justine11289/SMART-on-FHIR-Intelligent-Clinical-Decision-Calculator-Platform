# 階段 1: 編譯 TS 為 JS
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 使用專案定義的編譯指令，確保路徑正確
RUN npm run build:ts 

# 階段 2: 運行 Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# 清除 Nginx 預設檔案
RUN rm -rf ./*

# 修正點：使用 *.html 確保 index.html, launch.html, calculator.html 全部被帶入
COPY --from=builder /app/*.html ./
COPY --from=builder /app/test-Patient.json .
COPY --from=builder /app/js ./js
COPY --from=builder /app/css ./css
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]