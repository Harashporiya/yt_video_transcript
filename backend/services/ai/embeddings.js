import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

// Runs all-MiniLM-L6-v2 locally (CPU) instead of the paid Hugging Face Inference API.
// Same model, 384 dims, mean pooling + normalization, so existing Pinecone vectors stay compatible.
// The model (~23MB) is downloaded on first use and cached in node_modules/@huggingface/transformers/.cache.
export const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
  pretrainedOptions: { dtype: "fp32" },
});
