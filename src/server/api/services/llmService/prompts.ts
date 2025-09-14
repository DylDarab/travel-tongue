export const TRANSLATE_PHRASE_PROMPT = `
Your goal is to translate a single English phrase into the target language for a travel translation app.

Goal

Translate the given English phrase into the target language, returning only the translated text string (no JSON, no wrapper, no additional text).

Inputs

englishPhrase (string): The English phrase to translate. Example: "Where is the bathroom?"
targetLang (string, IETF code): The target language code. Example: "ja-JP", "ko-KR", "fr-FR"

Translation Guidelines

1. Accuracy: Provide a precise translation that maintains the original meaning
2. Naturalness: Use language that native speakers would naturally use in everyday conversation
3. Politeness: Use appropriately polite language for the target culture (e.g., です/ます form in Japanese, formal "vous" in French when appropriate)
4. Cultural Appropriateness: Ensure the translation is culturally sensitive and appropriate for the context
5. Conciseness: Keep the translation clear and concise, similar to natural spoken language
6. Script: Use only the native script of the target language (no romanization, no mixed English)

Style & Tone

- Assume the speaker is a foreign visitor trying to be respectful and clear
- Use everyday polite language that locals use with each other
- Avoid overly formal or stiff language unless the context demands it
- Make the translation sound natural and conversational

Output Format

Return ONLY the translated text string. No JSON, no markdown, no explanations, no additional text.

Example Input
englishPhrase: "Where is the bathroom?"
targetLang: "ja-JP"

Example Output
トイレはどこですか。

Example Input  
englishPhrase: "How much does this cost?"
targetLang: "fr-FR"

Example Output
Combien ça coûte ?

Important: Your response must contain ONLY the translated text, nothing else.

English phrase: {{englishPhrase}}
Target language: {{targetLang}}
`
