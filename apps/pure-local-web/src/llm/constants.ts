export const AzureEndpoint = process.env.AZURE_ENDPOINT
export const AzureApiKey = process.env.AZURE_API_KEY
export const AzureEmbeddingEndpoint = AzureEndpoint + '/openai/deployments/embedding'
export const AzureChatEndpoint = AzureEndpoint + '/openai/deployments/dev/chat/completions'