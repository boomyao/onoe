import { VectorStorage } from 'vector-storage'

const AzureEndpoint = 'https://cev-openai.openai.azure.com/openai/deployments/embedding'
const AzureApiKey = 'bbb73270360c4a4ea3c9545c0faf7190'

async function azureEmbedTexts(texts: string[]): Promise<number[][]> {
    const response = await fetch(AzureEndpoint + '/embeddings?api-version=2023-05-15', {
        body: JSON.stringify({
          input: texts,
        }),
        headers: {
          'api-key': AzureApiKey,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseData = (await response.json()) as any;
      return responseData.data.map((data: any) => data.embedding);
}

export const localVectorStorage = new VectorStorage({
    embedTextsFn: azureEmbedTexts,
})
