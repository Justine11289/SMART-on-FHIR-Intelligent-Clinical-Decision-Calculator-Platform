# 🐳 MEDCALCEHR Docker 快速開始指南

## ✅ 已創建的文件

```
MEDCALCEHR/
├── Dockerfile              # Docker 鏡像定義
├── docker-compose.yml      # Docker Compose 配置
├── nginx.conf             # Nginx Web 服務器配置
├── .dockerignore          # Docker 忽略文件
├── start-docker.ps1       # Windows 啟動腳本
├── start-docker.sh        # Linux/Mac 啟動腳本
└── README_DOCKER.md       # 完整 Docker 文檔
```

## 🚀 三種啟動方式

### 方式 1：使用啟動腳本（最簡單）

**Windows:**

```powershell
cd MEDCALCEHR
.\start-docker.ps1
```

**Linux/Mac:**

```bash
cd MEDCALCEHR
chmod +x start-docker.sh
./start-docker.sh
```

### 方式 2：使用 Docker Compose（推薦）

```bash
cd MEDCALCEHR
docker-compose up -d
```

查看狀態：

```bash
docker-compose ps
docker-compose logs -f
```

停止服務：

```bash
docker-compose down
```

### 方式 3：使用純 Docker 命令

```bash
cd MEDCALCEHR

# 構建鏡像
docker build -t medcalcehr:latest .

# 運行容器
docker run -d \
  --name medcalcehr-app \
  -p 8080:80 \
  --restart unless-stopped \
  medcalcehr:latest

# 查看日誌
docker logs -f medcalcehr-app

# 停止容器
docker stop medcalcehr-app
docker rm medcalcehr-app
```

## 📱 訪問應用

啟動成功後，在瀏覽器中打開：

- **主頁**: http://localhost:8080
- **Launch 頁**: http://localhost:8080/launch.html

## 🏥 整合 SMART on FHIR

1. 確保容器已啟動
2. 訪問 [SMART Health IT Launcher](https://launch.smarthealthit.org/)
3. 設置：
    - **App Launch URL**: `http://localhost:8080/launch.html`
    - 選擇一個測試患者
4. 點擊 Launch

## 🔍 常見問題

### 1. 端口 8080 已被佔用？

**方法 A：修改 docker-compose.yml**

```yaml
ports:
    - '3000:80' # 改為 3000 端口
```

**方法 B：使用 docker 命令**

```bash
docker run -d -p 3000:80 --name medcalcehr-app medcalcehr:latest
```

### 2. 如何查看日誌？

```bash
# Docker Compose
docker-compose logs -f

# Docker 命令
docker logs -f medcalcehr-app
```

### 3. 如何更新應用？

```bash
# 拉取最新代碼
git pull

# 重新構建並啟動
docker-compose up -d --build

# 或
docker-compose down
docker-compose up -d --build
```

### 4. 如何完全清理？

```bash
# 停止並刪除容器
docker-compose down

# 刪除鏡像
docker rmi medcalcehr:latest

# 清理未使用的資源
docker system prune -a
```

## 🎯 功能特點

### ✅ 已解決的問題

1. **✅ X-Frame-Options 錯誤**
    - 現在通過 Nginx HTTP 頭正確設置

2. **✅ CSP 錯誤**
    - Content Security Policy 已正確配置
    - 允許 cdn.jsdelivr.net 用於 source maps

3. **✅ 緩存問題**
    - HTML 文件不緩存（實時更新）
    - 靜態資源（JS/CSS/圖片）緩存 1 年

4. **✅ 安全頭**
    - X-Frame-Options: SAMEORIGIN
    - X-Content-Type-Options: nosniff
    - Referrer-Policy
    - Permissions-Policy

### 🚀 性能優化

- **Gzip 壓縮**: 自動壓縮文本文件
- **靜態資源緩存**: JS/CSS/圖片緩存優化
- **健康檢查**: 自動監控服務狀態
- **自動重啟**: 容器崩潰自動重啟

## 📊 監控與維護

### 查看容器狀態

```bash
docker ps
docker-compose ps
```

### 查看資源使用

```bash
docker stats medcalcehr-app
```

### 健康檢查

```bash
docker inspect --format='{{.State.Health.Status}}' medcalcehr-app
```

### 進入容器

```bash
docker exec -it medcalcehr-app sh
```

## 🌐 生產環境部署

### 雲端平台

1. **Docker Hub**

    ```bash
    docker tag medcalcehr:latest username/medcalcehr:latest
    docker push username/medcalcehr:latest
    ```

2. **Azure Container Instances**

    ```bash
    az container create \
      --resource-group myResourceGroup \
      --name medcalcehr \
      --image username/medcalcehr:latest \
      --dns-name-label medcalcehr \
      --ports 80
    ```

3. **AWS ECS / Google Cloud Run / Heroku**
   詳見 [README_DOCKER.md](README_DOCKER.md)

### SSL/TLS 配置

如果需要 HTTPS，可以：

1. 使用 Nginx Proxy Manager
2. 使用 Traefik
3. 使用雲端負載均衡器（推薦）

## 📚 更多資源

- 📖 [完整 Docker 文檔](README_DOCKER.md)
- 📖 [主 README](README.md)
- 🏥 [SMART on FHIR 文檔](https://docs.smarthealthit.org/)
- 🐳 [Docker 文檔](https://docs.docker.com/)

## 🆘 需要幫助？

如果遇到問題：

1. 檢查 Docker 是否運行：`docker ps`
2. 查看日誌：`docker-compose logs -f`
3. 查看容器狀態：`docker inspect medcalcehr-app`
4. 重新構建：`docker-compose up -d --build`

還有問題？請訪問 [GitHub Issues](https://github.com/Lusnaker0730/MEDCALCEHR/issues)

---

## 🎉 完成！

現在您的 MEDCALCEHR 應用已經在 Docker 容器中運行了！

訪問：**http://localhost:8080** 🏥
