import numpy as np

def weighted_cosine_similarity(vec1, vec2, weights):
    weighted_vec1 = np.multiply(vec1, weights)
    weighted_vec2 = np.multiply(vec2, weights)
    dot_product = np.dot(weighted_vec1, weighted_vec2)
    magnitude1 = np.linalg.norm(weighted_vec1)
    magnitude2 = np.linalg.norm(weighted_vec2)
    return dot_product / (magnitude1 * magnitude2) if magnitude1 > 0 and magnitude2 > 0 else 0
