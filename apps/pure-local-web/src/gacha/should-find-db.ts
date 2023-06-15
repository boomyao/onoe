import { ChatOpenAI } from 'langchain/chat_models/openai'
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

export async function shouldFindDB(input: string) {
    const prompt = new PromptTemplate({
        template: `
        should_find_db is a function to judge the user message whether need to find database, or just a chat message.    
        
        should_find_db("thanks") -> %7B"result": false%7D
      
        should_find_db("{input}") ->      
        `,
        inputVariables: ["input"],
    })

    const model = new ChatOpenAI({ temperature: 0 });

    const chain = new LLMChain({ llm: model, prompt });

    try {
        const text = await chain.run(input)
        const result = JSON.parse(decodeURIComponent(text))
        return result.result as boolean
    } catch (error) {
        console.error(error)
        return false
    }
}