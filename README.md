# KTB Lina Week11 Frontend

Community 프로젝트의 React + Vite 프론트엔드 저장소입니다. 운영 환경에서는
Nginx가 React 정적 파일을 제공하고 `/api`와 `/images` 요청을 Spring Boot
백엔드로 전달합니다.

## 연관 저장소

- Frontend: `100-hours-a-week/KTB_Lina_Week11_FE`
- Backend: `100-hours-a-week/KTB_Lina_Week11_BE`

## 로컬 실행

```bash
npm ci
npm run dev
```

Vite 개발 서버는 `/api`와 `/images` 요청을 기본적으로
`http://localhost:8080`으로 전달합니다.

검증:

```bash
npm run lint
npm run build
```

## Docker 이미지 빌드

```bash
docker build -t community-frontend:local .
```

백엔드 저장소의 `compose.yaml`을 사용하면 BE와 FE 이미지를 함께 빌드하고
실행할 수 있습니다. 두 저장소의 로컬 폴더 이름은 각각 `backend`,
`frontend`로 배치합니다.

```text
source/
├── backend/
└── frontend/
```

Docker용 Nginx 설정은 `nginx/default.conf`, EC2 직접 설치용 Nginx 설정은
`deploy/direct/nginx/community.conf`에 있습니다.

실제 `.env`와 `.env.*` 파일은 Git에 포함하지 않으며 `.env.example`만
공유합니다.
