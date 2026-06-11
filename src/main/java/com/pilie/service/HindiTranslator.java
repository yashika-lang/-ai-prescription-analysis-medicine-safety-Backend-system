package com.pilie.service;

import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

@Service
public class HindiTranslator {

    public String translateToHindi(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "अनुवाद उपलब्ध नहीं है";
        }
        try {
            URL url = new URL("https://libretranslate.de/translate");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setDoOutput(true);

            String jsonInputString = new JSONObject()
                    .put("q", text)
                    .put("source", "en")
                    .put("target", "hi")
                    .put("format", "text")
                    .toString();

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int status = conn.getResponseCode();
            try (Scanner scanner = new Scanner(conn.getInputStream(), StandardCharsets.UTF_8)) {
                StringBuilder response = new StringBuilder();
                while (scanner.hasNext()) {
                    response.append(scanner.nextLine());
                }
                JSONObject jsonResponse = new JSONObject(response.toString());
                return jsonResponse.getString("translatedText");
            }

        } catch (Exception e) {
            System.err.println("Translation failed: " + e.getMessage());
            return "अनुवाद उपलब्ध नहीं है";
        }
    }
}
