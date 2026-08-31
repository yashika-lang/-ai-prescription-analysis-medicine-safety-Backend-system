package com.pilie.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.ColorConvertOp;
import java.awt.color.ColorSpace;
import java.io.IOException;
import java.io.InputStream;

/**
 * Wraps Tess4J (JNA binding to the system-installed libtesseract) to run real OCR
 * over an uploaded prescription image and return the raw recognized text.
 */
@Service
public class TesseractOcrService {

    private final Tesseract tesseract;

    public TesseractOcrService(@Value("${tesseract.datapath}") String datapath,
                                @Value("${tesseract.native.libpath}") String nativeLibPath) {
        if (nativeLibPath != null && !nativeLibPath.isBlank()) {
            // JNA doesn't search Homebrew's lib dir by default; point it there so it can
            // dlopen the system-installed libtesseract/libleptonica.
            System.setProperty("jna.library.path", nativeLibPath);
        }
        this.tesseract = new Tesseract();
        this.tesseract.setDatapath(datapath);
        this.tesseract.setLanguage("eng");
    }

    public String extractText(MultipartFile file) throws IOException, TesseractException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded prescription image is empty.");
        }
        try (InputStream in = file.getInputStream()) {
            BufferedImage image = ImageIO.read(in);
            if (image == null) {
                throw new IllegalArgumentException("Uploaded file is not a readable image.");
            }
            return tesseract.doOCR(toGrayscale(image));
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
