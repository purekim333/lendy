# ---------- Build stage ----------
FROM gradle:8.14.3-jdk21 AS build
WORKDIR /app

COPY build.gradle* settings.gradle* gradlew ./
COPY gradle ./gradle

# (선택) 의존성 캐시를 최대한 살리려면 이 줄 유지
RUN gradle dependencies --no-daemon || true

COPY src ./src
RUN gradle clean bootJar --no-daemon -x test

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd --no-create-home --uid 10001 appuser
USER appuser

COPY --from=build /app/build/libs/*.jar /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"

EXPOSE 8080
ENTRYPOINT ["bash", "-lc", "java $JAVA_OPTS -jar /app/app.jar"]
    