import { type ChangeEvent, useState } from "react"
import { vectorStore } from "./gas/vector-store"
import { Document } from "langchain/document"

export function Create() {
    const [value, setValue] = useState("")
    const [loading, setLoading] = useState(false)

    function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setValue(event.target.value)
    }

    async function handleCreateClick() {
        setLoading(true)
        await vectorStore.addDocuments([new Document({ pageContent: value })])
        setLoading(false)
    }

    return <>
        <div>
            <textarea value={value} onChange={handleChange}></textarea>
        </div>
        <div>
            <button onClick={handleCreateClick} disabled={loading}>create</button>
        </div>
    </>
}