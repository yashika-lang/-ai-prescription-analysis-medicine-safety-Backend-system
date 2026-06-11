package com.pilie.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class WikiUsageFetcher {

    public String fetchUsageFromWikipedia(String medicineName) {
        try {
            String apiUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/" + medicineName.replace(" ", "%20");
            HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
            conn.setRequestMethod("GET");

            if (conn.getResponseCode() != 200) {
                return "Usage information not available.";
            }

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder response = new StringBuilder();
            String inputLine;

            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            JSONObject json = new JSONObject(response.toString());
            return json.optString("extract", "Usage information not available.");
        } catch (Exception e) {
            return "Usage fetch failed.";
        }
    }
    public String fetchHindiUsageFromWikipedia(String medicineName) {
        try {
            String apiUrl = "https://hi.wikipedia.org/api/rest_v1/page/summary/" + medicineName.replace(" ", "%20");
            HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
            conn.setRequestMethod("GET");

            if (conn.getResponseCode() != 200) {
                return "हिंदी में जानकारी उपलब्ध नहीं है।";
            }

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder response = new StringBuilder();
            String inputLine;

            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            JSONObject json = new JSONObject(response.toString());
            return json.optString("extract", "हिंदी में जानकारी उपलब्ध नहीं है।");
        } catch (Exception e) {
            return "हिंदी जानकारी लाने में विफल।";
        }
    }
}