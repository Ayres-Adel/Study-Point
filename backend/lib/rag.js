import natural from "natural";

export function chunkText(text, maxChunkLength = 1500) {
    if (!text) return [];
    
    const paragraphs = text.split(/\n\s*\n/);
    const chunks = [];
    let currentChunk = "";

    for (const p of paragraphs) {
        if (currentChunk.length + p.length > maxChunkLength && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = "";
        }
        currentChunk += p + "\n\n";
    }
    
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    // If any chunk is still too large, split it further by sentences
    const finalChunks = [];
    for (const chunk of chunks) {
        if (chunk.length > maxChunkLength * 1.5) { // If it's significantly larger
            const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
            let tempChunk = "";
            for (const s of sentences) {
                if (tempChunk.length + s.length > maxChunkLength && tempChunk.length > 0) {
                    finalChunks.push(tempChunk.trim());
                    tempChunk = "";
                }
                tempChunk += s + " ";
            }
            if (tempChunk.trim().length > 0) finalChunks.push(tempChunk.trim());
        } else {
            finalChunks.push(chunk);
        }
    }

    return finalChunks;
}

export function getRelevantContext(text, query, maxChunks = 3) {
    if (!text || !query) return text;

    const chunks = chunkText(text);
    if (chunks.length <= maxChunks) {
        // If the text is already small enough, return it fully
        return text;
    }

    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    // Add each chunk as a document
    chunks.forEach((chunk) => {
        tfidf.addDocument(chunk);
    });

    const scores = [];
    
    // Calculate the score of each chunk against the query
    tfidf.tfidfs(query, function(i, measure) {
        scores.push({
            index: i,
            score: measure,
            content: chunks[i]
        });
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // If the top score is 0, it means no keyword matched. 
    // Just return the beginning of the text to provide some context.
    if (scores[0].score === 0) {
        return chunks.slice(0, maxChunks).join("\n\n...\n\n");
    }

    // Return the top `maxChunks` concatenated
    const topChunks = scores.slice(0, maxChunks).map(s => s.content);
    return topChunks.join("\n\n...\n\n");
}
