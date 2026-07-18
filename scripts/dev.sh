#!/usr/bin/env bash
# 本地开发一键启动：自动准备本地 MySQL（Docker 容器），再启动 Next.js 开发服务器。
# 数据库建表和案例种子数据由应用启动时（instrumentation.ts）自动完成，这里不需要手动建库。
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=".env.local"
CONTAINER_NAME="case-site-mysql-dev"

if [ ! -f "$ENV_FILE" ]; then
  cp .env.example "$ENV_FILE"
  echo "已从 .env.example 生成 $ENV_FILE，请补充 OSS 等真实配置。"
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

MYSQL_URL="${MYSQL_URL:-mysql://root:devpassword@127.0.0.1:3306/case_site}"
read -r MYSQL_HOST MYSQL_PORT MYSQL_PASSWORD MYSQL_DATABASE < <(node -e '
  const u = new URL(process.argv[1]);
  console.log(u.hostname, u.port || 3306, decodeURIComponent(u.password), u.pathname.replace(/^\//, ""));
' "$MYSQL_URL")

if [ "$MYSQL_HOST" = "127.0.0.1" ] || [ "$MYSQL_HOST" = "localhost" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "未检测到 docker，且 MYSQL_HOST 指向本机，请自行确保 MySQL 已在 ${MYSQL_HOST}:${MYSQL_PORT} 运行。"
  else
    if [ -z "$(docker ps -q -f "name=^${CONTAINER_NAME}\$")" ]; then
      if [ -n "$(docker ps -aq -f "name=^${CONTAINER_NAME}\$")" ]; then
        echo "启动已有的本地 MySQL 容器 ${CONTAINER_NAME} ..."
        docker start "$CONTAINER_NAME" >/dev/null
      else
        echo "创建本地 MySQL 开发容器 ${CONTAINER_NAME}（端口 ${MYSQL_PORT}）..."
        docker run -d --name "$CONTAINER_NAME" \
          -e MYSQL_ROOT_PASSWORD="$MYSQL_PASSWORD" \
          -e MYSQL_DATABASE="$MYSQL_DATABASE" \
          -p "${MYSQL_PORT}:3306" \
          mysql:8 >/dev/null
      fi
      echo "等待 MySQL 就绪..."
      # 官方 MySQL 镜像首次初始化会启动一个临时服务再重启为正式服务，
      # 单次 ping 成功后立即连接可能撞上这个重启窗口，因此要求连续 3 次 ping 成功才算真正就绪。
      ready_count=0
      until [ "$ready_count" -ge 3 ]; do
        if docker exec "$CONTAINER_NAME" mysqladmin ping -uroot -p"$MYSQL_PASSWORD" --silent >/dev/null 2>&1; then
          ready_count=$((ready_count + 1))
        else
          ready_count=0
        fi
        sleep 1
      done
    fi
    echo "本地 MySQL 已就绪：${MYSQL_HOST}:${MYSQL_PORT}"
  fi
fi

echo "启动 Next.js 开发服务器..."
exec npm run dev
