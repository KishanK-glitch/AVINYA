import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer

def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm_a = np.linalg.norm(vec1)
    norm_b = np.linalg.norm(vec2)
    return dot_product / (norm_a * norm_b)

def run_threshold_test():
    print("Loading truth vectors and model for Threshold Calibration (Target: 0.72)...")
    
    # Load the same free model you used to embed the truths
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Load your baseline truth vectors
    truths_path = os.path.join(os.path.dirname(__file__), '..', 'processed_json', 'truth_vectors.json')
    try:
        with open(truths_path, 'r') as f:
            truth_vectors = json.load(f)
    except FileNotFoundError:
        print("[!] Error: truth_vectors.json not found. Run 02_embed_truths.py first.")
        return

    # Target node for the live demo (Agent A intentionally challenges this node)
    target_node = "node_04" 
    truth_vec = np.array(truth_vectors[target_node])

    print(f"\n--- Testing Node: {target_node} (Scaled Dot-Product Attention) ---")
    print("Evaluating test answers against the gold standard...")
    
    # We are testing three distinct scenarios
    test_cases = {
        "1. Perfect Answer (Must Pass)": "Scaled dot-product attention divides the dot products of queries and keys by the square root of the key dimension. This prevents massive values that would push the softmax function into regions with near-zero gradients.",
        "2. Incomplete Answer (Should Fail)": "It divides the dot product by the square root of the dimension.",
        "3. Irrelevant Answer (Must Fail)": "It uses multiple heads to look at different parts of the sentence at the same time."
    }

    threshold = 0.72

    for label, text in test_cases.items():
        # Embed the test answer
        test_vec = model.encode(text)
        
        # Calculate the score
        score = cosine_similarity(truth_vec, test_vec)
        
        # Determine the UI state based on your 0.72 rule
        status = "PASS (Node turns GREEN)" if score >= threshold else "FAIL (Node turns RED -> Trigger Agent C)"
        
        print(f"\n{label}")
        print(f"Input: '{text}'")
        print(f"Score: {score:.4f} -> {status}")

if __name__ == "__main__":
    run_threshold_test()