# 배포 가이드

## 목차
1. [아키텍처](#1-아키텍처)
2. [사전 요구사항](#2-사전-요구사항)
3. [빠른 시작](#3-빠른-시작)
4. [서비스별 상세](#4-서비스별-상세)
5. [환경 변수](#5-환경-변수)
6. [네트워크 구조](#6-네트워크-구조)
7. [운영 명령어](#7-운영-명령어)
8. [트러블슈팅](#8-트러블슈팅)

---

## 1. 아키텍처

```
                        :80
                         │
                 ┌───────▼────────┐
                 │    Gateway     │
                 │  (Nginx 프록시) │
                 └───┬───────┬───┘
                     │       │
           /         │       │  /api/*
    ┌────────────┐   │       │   ┌────────────┐
    │  Frontend  │<──┘       └──>│  Backend   │
    │  (Nginx +  │               │(Temurin 21)│
    │  React SPA)│               │  :8080     │
    │  :80       │               └─────┬──────┘
    └────────────┘                     │
                                ┌──────▼──────┐
                                │   MySQL 8.0 │
                                │   :3306     │
                                └─────────────┘
```

### 요청 흐름 (Docker 배포)

| 요청 경로 | Gateway 라우팅 | 최종 도착 |
|-----------|---------------|-----------|
| `http://도메인/` | `proxy_pass http://frontend:80` | React SPA (Nginx) |
| `http://도메인/products` | `proxy_pass http://frontend:80` | React SPA → `index.html` (SPA fallback) |
| `http://도메인/api/v1/products` | `proxy_pass http://backend:8080` | Spring Boot API |
| `http://도메인/login/oauth2/code/*` | `proxy_pass http://backend:8080` | Spring Security OAuth2 콜백 |

### 요청 흐름 (로컬 개발)

| 요청 경로 | 처리 | 최종 도착 |
|-----------|------|-----------|
| `http://localhost:5173/` | Vite dev server | React SPA |
| `http://localhost:5173/api/*` | Vite proxy → `localhost:80` | Spring Boot API |
| `http://localhost:8080/api/*` | 직접 접근 | Spring Boot API |
| `http://localhost:8080/login/oauth2/code/*` | 직접 접근 | Spring Security OAuth2 콜백 |

---

## 2. 사전 요구사항

- Docker 20.10+
- Docker Compose v2+
- 최소 2GB RAM (MySQL + Backend + Frontend + Gateway)

---

## 3. 빠른 시작

```bash
# 1. 프로젝트 루트로 이동
cd /path/to/haveAMood

# 2. 환경 변수 파일 생성
cp deploy/.env.example deploy/.env
# deploy/.env 파일을 열어 실제 값으로 수정

# 3. 빌드 및 실행
docker compose -f deploy/docker-compose.yml up -d --build

# 4. 로그 확인
docker compose -f deploy/docker-compose.yml logs -f

# 5. 접속
# http://localhost (또는 서버 IP)
```

---

## 4. 서비스별 상세

### 4-1. Gateway (Nginx 리버스 프록시)

| 항목 | 값 |
|------|-----|
| Dockerfile | `deploy/gateway/Dockerfile` |
| 베이스 이미지 | `nginx:stable` |
| 포트 | 80 (외부 노출) |
| 역할 | `/` → frontend, `/api/` → backend, `/login/oauth2/code/` → backend |

**설정 파일**: `deploy/gateway/default.conf`

### 4-2. Frontend (React SPA)

| 항목 | 값 |
|------|-----|
| Dockerfile | `frontend/dockerfile` |
| 빌드 스테이지 | `node:20-alpine` (npm ci → npm run build) |
| 런타임 스테이지 | `nginx:stable-alpine` |
| 빌드 결과물 | `dist/` → `/usr/share/nginx/html` |
| 포트 | 80 (내부) |

**멀티스테이지 빌드 과정:**
```
node:20-alpine (빌드)          nginx:stable-alpine (런타임)
┌─────────────────────┐       ┌──────────────────────────┐
│ npm ci               │       │ dist/ 정적 파일만 복사     │
│ npm run build        │──────>│ nginx.conf 설정 복사      │
│ → dist/ 생성         │       │ SPA fallback 설정         │
└─────────────────────┘       │ gzip 압축 활성화           │
  ~500MB                      └──────────────────────────┘
                                ~30MB
```

### 4-3. Backend (Spring Boot)

| 항목 | 값 |
|------|-----|
| Dockerfile | `backend/Dockerfile` |
| 빌드 스테이지 | `eclipse-temurin:21-jdk` (Gradle bootJar) |
| 런타임 스테이지 | `eclipse-temurin:21-jre` |
| JVM 옵션 | G1GC, MaxRAMPercentage=75% |
| 포트 | 8080 (내부) |
| 실행 유저 | `appuser` (UID 10001, 비루트) |

**멀티스테이지 빌드 과정:**
```
temurin:21-jdk (빌드)          temurin:21-jre (런타임)
┌─────────────────────┐       ┌──────────────────────────┐
│ gradlew dependencies │       │ app.jar만 복사            │
│ gradlew bootJar      │──────>│ 비루트 유저 실행           │
│ → build/libs/*.jar   │       │ G1GC + RAM 75%           │
└─────────────────────┘       └──────────────────────────┘
  ~800MB                        ~300MB
```

### 4-4. MySQL 8.0

| 항목 | 값 |
|------|-----|
| 이미지 | `mysql:8.0` (Docker Hub) |
| 문자셋 | utf8mb4 / utf8mb4_unicode_ci |
| 볼륨 | `mysql_data` (데이터 영속화) |
| 헬스체크 | `mysqladmin ping` (10초 간격, 10회 재시도) |

---

## 5. 환경 변수

`deploy/.env` 파일에 설정:

| 변수 | 설명 | 예시 |
|------|------|------|
| `MYSQL_DATABASE` | 데이터베이스 이름 | `Lendy` |
| `MYSQL_USER` | DB 유저 | `lendy` |
| `MYSQL_PASSWORD` | DB 비밀번호 | `your_password` |
| `MYSQL_ROOT_PASSWORD` | DB root 비밀번호 | `your_root_password` |
| `SPRING_PROFILES_ACTIVE` | Spring 프로필 | `prod` |
| `OAUTH_REDIRECT_BASE` | OAuth2 리다이렉트 베이스 URL | `http://localhost` |

**참고**: `SPRING_DATASOURCE_URL`은 docker-compose.yml에서 자동 구성됨 (`mysql:3306` 컨테이너 내부 DNS 사용).

### 환경별 주요 차이

| 항목 | 로컬 개발 (`backend/.env`) | Docker 배포 (`deploy/.env`) |
|------|---------------------------|----------------------------|
| `OAUTH_REDIRECT_BASE` | `http://localhost:8080` | `http://localhost` |
| DB 접속 | `localhost:3306` | `mysql:3306` (컨테이너 DNS) |
| 프론트엔드 접속 | `http://localhost:5173` (Vite) | `http://localhost` (Gateway) |
| API 접속 | `http://localhost:8080/api/*` | `http://localhost/api/*` (Gateway 프록시) |
| OAuth2 콜백 | 백엔드 직접 수신 (`:8080`) | Gateway → 백엔드 프록시 (`:80` → `:8080`) |

---

## 6. 네트워크 구조

```
Docker Network: appnet (bridge)
┌─────────────────────────────────────────────┐
│                                             │
│  gateway ──> frontend:80                    │
│          ──> backend:8080                   │
│                                             │
│  backend ──> mysql:3306                     │
│                                             │
│  외부 노출: gateway:80 만                     │
│                                             │
└─────────────────────────────────────────────┘
```

- 모든 서비스는 `appnet` 브릿지 네트워크에 연결
- **외부 노출 포트는 gateway의 80번 뿐** (보안)
- 컨테이너 간 통신은 서비스 이름으로 DNS 해석 (`mysql`, `backend`, `frontend`)

---

## 7. 운영 명령어

### 빌드 및 실행

```bash
# 전체 빌드 + 실행
docker compose -f deploy/docker-compose.yml up -d --build

# 특정 서비스만 재빌드
docker compose -f deploy/docker-compose.yml up -d --build backend

# 강제 재생성 (캐시 무시)
docker compose -f deploy/docker-compose.yml up -d --build --force-recreate
```

### 모니터링

```bash
# 전체 로그
docker compose -f deploy/docker-compose.yml logs -f

# 특정 서비스 로그
docker compose -f deploy/docker-compose.yml logs -f backend

# 서비스 상태 확인
docker compose -f deploy/docker-compose.yml ps
```

### 중지 및 정리

```bash
# 중지 (데이터 유지)
docker compose -f deploy/docker-compose.yml down

# 중지 + 볼륨 삭제 (DB 데이터 초기화)
docker compose -f deploy/docker-compose.yml down -v

# 미사용 이미지 정리
docker image prune -f
```

### DB 접속

```bash
docker compose -f deploy/docker-compose.yml exec mysql \
  mysql -u root -p${MYSQL_ROOT_PASSWORD} Lendy
```

---

## 8. 트러블슈팅

### backend가 mysql 연결 실패로 재시작됨
- MySQL 헬스체크 통과 전에 backend가 시작될 수 있음
- `depends_on.condition: service_healthy` 설정이 되어있으므로 보통 자동 해결됨
- 지속되면 MySQL 로그 확인: `docker compose logs mysql`

### frontend 빌드 실패
- `npm ci` 실패 시 `package-lock.json`이 최신인지 확인
- 로컬에서 `cd frontend && npm run build` 먼저 테스트

### gateway 502 Bad Gateway
- backend/frontend 컨테이너가 아직 기동 중
- `docker compose ps`로 모든 서비스 running 상태인지 확인

### 포트 80 충돌
- 호스트에서 이미 80번 포트를 사용 중
- `docker-compose.yml`에서 `ports: ["8000:80"]` 등으로 변경

### 이미지 재빌드가 안 되는 경우
```bash
# Docker 빌드 캐시 완전 초기화
docker builder prune -af
docker compose -f deploy/docker-compose.yml up -d --build --no-cache
```
