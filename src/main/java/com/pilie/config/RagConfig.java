package com.pilie.config;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import dev.langchain4j.data.segment.TextSegment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Wires the LangChain4j models used by the RAG feature. The chat/embedding model
 * beans are only created when an OpenAI API key is actually configured (via the
 * OPENAI_API_KEY env var) - if it's missing, these beans simply don't exist and
 * MedicineRagService reports that clearly to callers instead of the app failing
 * to start.
 */
@Configuration
public class RagConfig {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.chat.model}")
    private String chatModelName;

    @Value("${openai.embedding.model}")
    private String embeddingModelName;

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        return new InMemoryEmbeddingStore<>();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        return OpenAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName(embeddingModelName)
                .build();
    }

    @Bean
    public ChatModel chatModel() {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        return OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName(chatModelName)
                .build();
    }
}
