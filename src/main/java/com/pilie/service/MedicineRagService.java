package com.pilie.service;

import com.pilie.model.Medicine;
import com.pilie.model.PrescriptionExtraction;
import com.pilie.repository.MedicineRepository;
import com.pilie.repository.PrescriptionExtractionRepository;

import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Real RAG pipeline for medicine/prescription QA:
 *  1. Retrieval - embeds the caller's own extracted prescriptions (PrescriptionExtraction,
 *     written by OcrController) plus the general Medicine catalog, and finds the
 *     passages most similar to the question via vector search.
 *  2. Augmentation - assembles a prompt that includes only the retrieved passages and
 *     instructs the model to answer solely from them.
 *  3. Generation - calls the LLM (OpenAI via LangChain4j) to produce the answer.
 *
 * The embedding index is rebuilt per request, scoped to the requesting user - the
 * catalog is small, so this keeps the store from growing stale or duplicating entries
 * across restarts while still being a genuine embed -> retrieve -> generate pipeline
 * (not a bare LLM call - retrieved sources are returned alongside the answer).
 */
@Service
public class MedicineRagService {

    private static final int MAX_RESULTS = 4;

    @Autowired(required = false)
    private EmbeddingModel embeddingModel;

    @Autowired(required = false)
    private ChatModel chatModel;

    @Autowired
    private PrescriptionExtractionRepository prescriptionExtractionRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    public boolean isConfigured() {
        return embeddingModel != null && chatModel != null;
    }

    public static class RagAnswer {
        public String answer;
        public List<String> sources;
    }

    public RagAnswer ask(String userEmail, String question) {
        if (!isConfigured()) {
            throw new IllegalStateException(
                "RAG is not configured: set the OPENAI_API_KEY environment variable and restart the app.");
        }
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("Question must not be empty.");
        }

        List<TextSegment> segments = buildCorpus(userEmail);
        if (segments.isEmpty()) {
            RagAnswer empty = new RagAnswer();
            empty.answer = "No prescription or medicine data is available yet to answer this question. "
                    + "Upload/analyze a prescription first.";
            empty.sources = List.of();
            return empty;
        }

        EmbeddingStore<TextSegment> scratchStore = new InMemoryEmbeddingStore<>();
        Embedding questionEmbedding;
        try {
            Response<List<Embedding>> embeddedSegments = embeddingModel.embedAll(segments);
            scratchStore.addAll(embeddedSegments.content(), segments);
            questionEmbedding = embeddingModel.embed(question).content();
        } catch (RuntimeException e) {
            throw new RagProviderException("The AI provider rejected the embedding request: " + rootMessage(e), e);
        }

        EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                .queryEmbedding(questionEmbedding)
                .maxResults(MAX_RESULTS)
                .minScore(0.0)
                .build();
        EmbeddingSearchResult<TextSegment> searchResult = scratchStore.search(searchRequest);

        List<EmbeddingMatch<TextSegment>> matches = searchResult.matches();
        String context = matches.stream()
                .map(m -> m.embedded().text())
                .collect(Collectors.joining("\n---\n"));

        String prompt = """
                You are a medicine-safety assistant. Answer the user's question using ONLY
                the prescription/medicine context below. If the answer is not contained in
                the context, say you don't have that information - do not guess or use
                outside knowledge.

                Context:
                %s

                Question: %s

                Answer:
                """.formatted(context, question);

        String generatedAnswer;
        try {
            generatedAnswer = chatModel.chat(prompt);
        } catch (RuntimeException e) {
            throw new RagProviderException("The AI provider rejected the chat request: " + rootMessage(e), e);
        }

        RagAnswer result = new RagAnswer();
        result.answer = generatedAnswer;
        result.sources = matches.stream().map(m -> m.embedded().text()).collect(Collectors.toList());
        return result;
    }

    private static final java.util.regex.Pattern JSON_MESSAGE_FIELD =
            java.util.regex.Pattern.compile("\"message\"\\s*:\\s*\"([^\"]+)\"");

    private static String rootMessage(Throwable e) {
        Throwable cause = e;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        String message = cause.getMessage();
        if (message == null) {
            return cause.getClass().getSimpleName();
        }
        // OpenAI error bodies are JSON like {"error": {"message": "..."}} - surface just the reason.
        var matcher = JSON_MESSAGE_FIELD.matcher(message);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return message.lines().map(String::trim).filter(line -> !line.isEmpty()).findFirst().orElse(message);
    }

    /** Thrown when the configured AI provider itself rejects a request (e.g. no credits, invalid key, rate limit). */
    public static class RagProviderException extends RuntimeException {
        public RagProviderException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    private List<TextSegment> buildCorpus(String userEmail) {
        List<TextSegment> segments = new ArrayList<>();

        if (userEmail != null && !userEmail.isBlank()) {
            List<PrescriptionExtraction> extractions =
                    prescriptionExtractionRepository.findByUserEmailIgnoreCaseOrderByExtractedAtDesc(userEmail);
            for (PrescriptionExtraction e : extractions) {
                String text = ("Prescribed medicine: %s. Ingredients: %s. Quantity: %s. Timing: %s. "
                        + "Duration: %s. Safety note: %s").formatted(
                        e.getMedicineName(), e.getIngredients(), e.getQuantity(),
                        e.getTiming(), e.getDuration(), e.getRiskMessage());
                Metadata metadata = new Metadata().put("type", "prescription").put("medicineName",
                        e.getMedicineName() == null ? "" : e.getMedicineName());
                segments.add(TextSegment.from(text, metadata));
            }
        }

        for (Medicine medicine : medicineRepository.findAll()) {
            String text = "Medicine: %s. Ingredients: %s. Manufacturer: %s. Usage: %s".formatted(
                    medicine.getName(), medicine.getIngredients(), medicine.getManufacturer(),
                    medicine.getUsage());
            Metadata metadata = new Metadata().put("type", "catalog").put("medicineName",
                    medicine.getName() == null ? "" : medicine.getName());
            segments.add(TextSegment.from(text, metadata));
        }

        return segments;
    }
}
