# Backend Dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# 安装依赖
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 复制应用代码
COPY . .

# 生成 Prisma Client
RUN bun run db:generate

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
