import json
import os
from sentence_transformers import SentenceTransformer

# Load the free, lightweight pre-trained model
model = SentenceTransformer('all-MiniLM-L6-v2')

# The 12 Gold-Standard Answers
reference_truths = {
    "node_01": "Vector embeddings are high-dimensional continuous representations of discrete tokens, grouping semantically similar words close together in vector space.",
    "node_02": "The Query, Key, and Value vectors are derived by multiplying the input embedding by three distinct learned weight matrices.",
    "node_03": "Dot product similarity calculates the alignment between a Query vector and a Key vector, resulting in a raw score representing how much focus one token should give another.",
    "node_04": "Scaled dot-product attention divides the raw dot products by the square root of the key dimension (sqrt(d_k)) to prevent massive values that would push the softmax function into regions with near-zero gradients.",
    "node_05": "The softmax function normalizes the scaled dot products into a probability distribution, ensuring all attention weights are positive and sum to exactly 1.0.",
    "node_06": "Attention weights are multiplied by the Value matrices to determine the final weighted contribution of each token's actual content to the output.",
    "node_07": "Multi-head attention runs several self-attention mechanisms in parallel using different initialized weight matrices, allowing the model to capture multiple relational contexts simultaneously.",
    "node_08": "The outputs from all attention heads are concatenated together and multiplied by a final learned projection matrix (W_O) to restore the expected hidden dimension size.",
    "node_09": "Look-ahead masking is applied in the decoder by setting upper triangular elements of the attention matrix to negative infinity, preventing the model from attending to future tokens during generation.",
    "node_10": "Padding masking zeroes out the attention scores for meaningless padding tokens added to match sequence lengths within a batch.",
    "node_11": "Positional encoding adds deterministic sine and cosine wave frequencies to the input embeddings to inject relative token sequence order, compensating for the lack of recurrence.",
    "node_12": "The position-wise feed-forward network applies two linear transformations separated by a ReLU activation identically to every position, introducing non-linearity to the attended representations."
}

def generate_truth_vectors():
    print("Generating local vector embeddings using all-MiniLM-L6-v2...")
    
    truth_vectors = {}
    
    for node_id, text in reference_truths.items():
        try:
            # Encode the text to generate the vector
            embedding = model.encode(text)
            # Convert numpy array to list for JSON serialization
            truth_vectors[node_id] = embedding.tolist()
            print(f"[*] Successfully embedded {node_id}")
        except Exception as e:
            print(f"[!] Failed to embed {node_id}: {e}")
            return

    # Save to the specific location required by your architecture
    output_path = os.path.join(os.path.dirname(__file__), '..', 'processed_json', 'truth_vectors.json')
    
    with open(output_path, 'w') as f:
        json.dump(truth_vectors, f)
        
    print(f"\nSuccess. Local truth vectors saved to {output_path}")

if __name__ == "__main__":
    generate_truth_vectors()