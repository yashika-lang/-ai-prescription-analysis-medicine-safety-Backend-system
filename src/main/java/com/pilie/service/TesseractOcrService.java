package com.pilie.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.color.ColorSpace;
import java.awt.image.BufferedImage;
import java.awt.image.ColorConvertOp;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * Runs real OCR by shelling out to the system-installed `tesseract` CLI binary,
 * rather than going through Tess4J's JNA bindings.
 *
 * Tess4J's JNA layer (via lept4j) eagerly resolves every native function it declares
 * against the system's Leptonica library, and distro-packaged Leptonica (apt, across
 * multiple Ubuntu versions) is missing an internal symbol (returnErrorFloat1) that
 * binding expects - a known, recurring lept4j compatibility gap, not something fixed
 * by choosing a different Tesseract/Leptonica package version. The CLI binary has no
 * such dependency and works identically via Homebrew (local macOS dev) and apt
 * (the Linux/Render deployment image).
 */
@Service
public class TesseractOcrService {

    public String extractText(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded prescription image is empty.");
        }

        BufferedImage image;
        try (InputStream in = file.getInputStream()) {
            image = ImageIO.read(in);
        }
        if (image == null) {
            throw new IllegalArgumentException("Uploaded file is not a readable image.");
        }

        Path inputFile = Files.createTempFile("pillie-ocr-", ".png");
        Path outputBase = Files.createTempFile("pillie-ocr-out-", "");
        Path outputFile = Path.of(outputBase + ".txt");
        try {
            ImageIO.write(toGrayscale(image), "png", inputFile.toFile());

            Process process = new ProcessBuilder("tesseract", inputFile.toString(), outputBase.toString())
                    .redirectErrorStream(true)
                    .start();

            boolean finished = waitFor(process);
            if (!finished || process.exitValue() != 0) {
                throw new IOException("Tesseract OCR process failed (is `tesseract` installed and on PATH?).");
            }

            return Files.readString(outputFile);
        } finally {
            Files.deleteIfExists(inputFile);
            Files.deleteIfExists(outputBase);
            Files.deleteIfExists(outputFile);
        }
    }

    private boolean waitFor(Process process) throws IOException {
        try {
            return process.waitFor(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("OCR was interrupted.", e);
        }
    }

    /**
     * Converting to grayscale before OCR is a standard, low-risk preprocessing step that
     * measurably helps Tesseract on real photographed documents (uneven lighting, colored
     * pen/stamp ink, phone camera noise). It does NOT make Tesseract able to read cursive
     * handwriting - that's a fundamental limitation of Tesseract itself (trained for printed
     * text), not something preprocessing or tuning can fix.
     */
    private BufferedImage toGrayscale(BufferedImage source) {
        BufferedImage grayscale = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        new ColorConvertOp(ColorSpace.getInstance(ColorSpace.CS_GRAY), null).filter(source, grayscale);
        return grayscale;
    }
}
