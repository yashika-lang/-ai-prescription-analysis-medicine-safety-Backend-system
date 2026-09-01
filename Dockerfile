# Render's compute runs linux/amd64 - pinned explicitly so this always builds/runs the
# same architecture that will actually be deployed, regardless of the host building it.

# ---- Build stage ----
FROM --platform=linux/amd64 maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# ---- Runtime stage ----
FROM --platform=linux/amd64 eclipse-temurin:17-jre-jammy

# OCR runs by shelling out to the `tesseract` CLI (see TesseractOcrService) rather than
# through Tess4J's JNA bindings, which have a known compatibility gap with distro-packaged
# Leptonica. The CLI binary just needs to be on PATH - apt's tesseract-ocr package provides
# that directly, no native-library wiring needed.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
