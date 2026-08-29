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

# Tesseract OCR (Tess4J needs the native libtesseract/libleptonica + tessdata on the image).
# TESSDATA_PREFIX is the standard env var Tesseract itself looks for; we also resolve the
# real installed path at build time and export it explicitly rather than guessing a version-
# specific path, since the tessdata directory name changes between tesseract package versions.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/* \
    && dpkg -L tesseract-ocr-eng | grep 'tessdata$' | head -1 > /tessdata-path.txt

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "export TESSERACT_DATAPATH=$(cat /tessdata-path.txt) && exec java -jar app.jar"]
