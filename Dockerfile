# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

# 의존성 파일을 먼저 복사해 소스 변경 시에도 npm 캐시를 재사용합니다.
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.28-alpine AS runtime

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
