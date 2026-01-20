# MEDCALCEHR Docker 部署指南

## 🐳 快速開始

### 方法1：使用 Docker Compose（推薦）

```bash
# 1. 進入專案目錄
cd MEDCALCEHR

# 2. 啟動容器
docker-compose up -d

# 3. 查看日誌
docker-compose logs -f

# 4. 訪問應用
# 瀏覽器打開：http://localhost:8080
```

### 方法2：使用 Docker 命令

```bash
# 1. 構建鏡像
docker build -t medcalcehr:latest .

# 2. 運行容器
docker run -d \
  --name medcalcehr-app \
  -p 8080:80 \
  --restart unless-stopped \
  medcalcehr:latest

# 3. 訪問應用
# 瀏覽器打開：http://localhost:8080
```

## 📋 常用命令

### Docker Compose

```bash
# 啟動服務
docker-compose up -d

# 停止服務
docker-compose down

# 重啟服務
docker-compose restart

# 查看日誌
docker-compose logs -f

# 查看容器狀態
docker-compose ps

# 重新構建並啟動
docker-compose up -d --build
```

### Docker 命令

```bash
# 查看運行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop medcalcehr-app

# 啟動容器
docker start medcalcehr-app

# 刪除容器
docker rm medcalcehr-app

# 查看日誌
docker logs -f medcalcehr-app

# 進入容器
docker exec -it medcalcehr-app sh

# 查看容器資源使用
docker stats medcalcehr-app
```

## 🔧 自定義配置

### 修改端口

編輯 `docker-compose.yml`：

```yaml
ports:
    - '3000:80' # 改為 3000 端口
```

或使用 Docker 命令：

```bash
docker run -d -p 3000:80 medcalcehr:latest
```

### 修改 Nginx 配置

1. 編輯 `nginx.conf` 文件
2. 重新構建鏡像：

```bash
docker-compose up -d --build
```

## 🏥 SMART on FHIR 集成

### 本地測試

1. 啟動容器：

    ```bash
    docker-compose up -d
    ```

2. 訪問 SMART Health IT Launcher：
    - URL: https://launch.smarthealthit.org/
    - App Launch URL: `http://localhost:8080/launch.html`
    - 選擇測試患者並啟動

### 生產環境

如果部署到生產環境（例如有域名的服務器）：

1. 更新 `nginx.conf` 中的 `server_name`：

    ```nginx
    server_name your-domain.com;
    ```

2. 配置 SSL/TLS（建議使用 Let's Encrypt）

3. 在 SMART Launcher 中使用：
    ```
    https://your-domain.com/launch.html
    ```

## 📊 健康檢查

容器包含內置健康檢查：

```bash
# 檢查容器健康狀態
docker inspect --format='{{.State.Health.Status}}' medcalcehr-app

# 查看健康檢查日誌
docker inspect --format='{{json .State.Health}}' medcalcehr-app | jq
```

## 🔍 故障排除

### 查看容器日誌

```bash
docker-compose logs -f medcalcehr
```

### 檢查 Nginx 配置

```bash
docker exec medcalcehr-app nginx -t
```

### 重新加載 Nginx 配置（不重啟容器）

```bash
docker exec medcalcehr-app nginx -s reload
```

### 清理未使用的資源

```bash
# 清理未使用的容器、網絡、鏡像
docker system prune -a

# 僅清理未使用的容器
docker container prune
```

## 🚀 部署到雲端

### Docker Hub

```bash
# 1. 登錄 Docker Hub
docker login

# 2. 標記鏡像
docker tag medcalcehr:latest your-username/medcalcehr:latest

# 3. 推送鏡像
docker push your-username/medcalcehr:latest

# 4. 在其他服務器上拉取並運行
docker pull your-username/medcalcehr:latest
docker run -d -p 8080:80 your-username/medcalcehr:latest
```

### 雲端平台

- **Azure Container Instances**: 使用 `az container create`
- **AWS ECS**: 上傳鏡像到 ECR 並創建服務
- **Google Cloud Run**: 推送到 GCR 並部署
- **Heroku**: 使用 Heroku Container Registry

## 🔐 安全建議

1. **使用 HTTPS**：在生產環境中始終使用 SSL/TLS
2. **更新基礎鏡像**：定期更新 nginx:alpine 鏡像
3. **限制權限**：容器以非 root 用戶運行（nginx 默認）
4. **網絡隔離**：使用 Docker 網絡隔離服務
5. **資源限制**：設置 CPU 和內存限制

示例（添加資源限制）：

```yaml
# docker-compose.yml
services:
    medcalcehr:
        # ... 其他配置
        deploy:
            resources:
                limits:
                    cpus: '0.5'
                    memory: 512M
                reservations:
                    cpus: '0.25'
                    memory: 256M
```

## 📈 監控

### 查看資源使用

```bash
docker stats medcalcehr-app
```

### 整合 Prometheus（可選）

1. 添加 nginx-prometheus-exporter
2. 配置 Prometheus 抓取指標
3. 使用 Grafana 可視化

## 🆘 支持

如有問題，請：

1. 查看容器日誌：`docker-compose logs -f`
2. 檢查容器狀態：`docker-compose ps`
3. 訪問 [GitHub Issues](https://github.com/Lusnaker0730/MEDCALCEHR/issues)

## 📝 更新應用

```bash
# 1. 拉取最新代碼
git pull

# 2. 重新構建並啟動
docker-compose up -d --build

# 3. 清理舊鏡像（可選）
docker image prune -f
```

---

## 🎉 完成！

應用現在運行在：**http://localhost:8080**

享受使用 MEDCALCEHR！🏥
