# ---------- Build stage ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# 1) Gradle 캐시 최적화를 위해 의존성 정의 파일만 먼저 복사
COPY backend/gradlew backend/build.gradle* backend/settings.gradle* ./
COPY backend/gradle ./gradle
# Gradle wrapper 권한 부여
RUN chmod +x ./gradlew

# 2) 의존성만 받아 캐시 레이어 생성 (테스트 실행 안 함)
#   - Spring Boot 3.x/2.x 모두 OK
RUN ./gradlew dependencies --no-daemon || true

# 3) 실제 소스 복사 후 빌드 (테스트는 Jenkins에서 이미 실행하므로 보통 제외)
COPY backend/ ./
RUN ./gradlew clean bootJar --no-daemon -x test

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# 보안상 비루트 유저 생성
RUN useradd --no-create-home --uid 10001 appuser
USER appuser

# 빌드 산출물 복사
COPY --from=build /app/build/libs/*.jar /app/app.jar

# 프로파일/메모리 옵션 등 환경변수 (필요시 조정)
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"

EXPOSE 8080
ENTRYPOINT ["bash","-lc","java $JAVA_OPTS -jar /app/app.jar"]
