function dotProduct(vecA: number[], vecB: number[]): number {
    if(vecA.length !== vecB.length) {
        throw "Vectors are not the same dimensions.";
    }

    let product = 0;

    for(let i = 0; i < vecA.length; i++) {
        product += vecA[i] * vecB[i];
    }

    return product;
}

function magnitude(vec: number[]): number {
    let sum = 0;

    for(let i = 0; i < vec.length; i++) {
        sum += vec[i] * vec[i];
    }

    return Math.sqrt(sum);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}