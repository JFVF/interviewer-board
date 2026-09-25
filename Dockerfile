# Single-image build: the React bundle is served by Spring Boot from classpath:/static, so the
# frontend and /api share one origin and one process on port 8081.
#
# Multi-arch without emulation: both build stages run on the build machine's own platform (the jar
# and the static bundle are platform-independent), and the final stage has no RUN steps.
#   docker buildx build --platform linux/amd64,linux/arm64 -t <namespace>/interview-board:<tag> --push .

FROM --platform=$BUILDPLATFORM node:24-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Relative API base: the page and the API are served from the same origin.
RUN VITE_API_URL=/api npm run build

FROM --platform=$BUILDPLATFORM eclipse-temurin:17-jdk AS backend
WORKDIR /backend
COPY backend/mvnw backend/pom.xml ./
COPY backend/.mvn .mvn
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline
COPY backend/src src
COPY --from=frontend /frontend/dist src/main/resources/static
# Tests run outside the image build (./mvnw test, npm test).
RUN ./mvnw -q package -DskipTests && cp target/*.jar /app.jar && mkdir /data

FROM eclipse-temurin:17-jre
LABEL org.opencontainers.image.title="Interview Board" \
      org.opencontainers.image.description="Coordinates interviewers and candidates during a hiring loop."
WORKDIR /app
COPY --from=backend /app.jar app.jar
# Empty data directory owned by the non-root runtime user; the SQLite file is created on first start.
COPY --from=backend --chown=10001:0 /data /data
ENV SQLITE_PATH=/data/interviewboard.db
USER 10001
EXPOSE 8081
# Keeps the database out of the container layer even when no volume is passed.
VOLUME /data
ENTRYPOINT ["java", "-jar", "app.jar"]
