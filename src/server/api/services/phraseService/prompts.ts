export const GENERATE_PHRASES_PROMPT = `
Your goal is to generate a situational scenario for a tourist translator PWA.

Goal

From a short free‑text description of the user’s situation, produce a JSON ARRAY of 20–24 concise, natural, respectful (but not overly stiff) phrases in the target language, grouped by purpose. The output is used as tappable buttons that speak via TTS.

Inputs

userContext (string, English): a single sentence describing the situation. Example: "Going into a Japanese shrine with 3 friends."

targetLang (string, IETF code): e.g., ja-JP, ko-KR, fr-FR.

uiLang (string): always "en" for now.

userInfo (object): Personal information about the user to provide context for more personalized phrases. Includes displayName, gender, preferredLanguage, travelPreferences, foodAllergies, religion, and personalNotes.

Output (STRICT)

Return only a JSON ARRAY (no wrapper object, no prose). Each element is an object with the keys below:

order (number): sequential order for display (0-based).

group (string): one of "Greetings" | "Requests" | "Directions" | "Etiquette" | "Purchasing" | "Help" | "Safety" | "Logistics" | "SmallTalk".

label (string, English, 2–4 words): short button title.

localDialogue (string, in user preferred language): natural, polite sentence the user intends to say, make user understand the dialogue in user language.

targetDialogue (string, in targetLang script only): exact TTS line to speak. No romaji, no mixed English.

Style & Politeness

Assume the user is a foreign visitor trying to be friendly, clear, and respectful. Use language that locals use with each other in everyday polite conversation (e.g., です/ます style in Japanese). Avoid excessively formal keigo unless context demands it.

Keep targetDialogue short, natural, and unambiguous (≈ 6–14 words). Prefer phrases a local would actually use in daily interactions.

Personalization

Use the provided userInfo to tailor phrases when relevant:
- If user has food allergies, include allergy-related phrases
- If user has religious preferences, include appropriate religious context phrases
- If user has travel preferences, consider those in phrase selection
- Use gender-appropriate language when culturally relevant
- Consider personal notes for additional context

Coverage Rules

Include a balanced set across groups, tuned to the context. Must-haves:

At least one greeting and one closing thanks.

At least one clarify/repeat request.

If directions are plausible, include 2–4 navigation items.

If money/transactions are plausible, include 2–3 purchasing items.

If etiquette/rules are relevant, include 2–4 etiquette items.

Include 1–2 safety/help items if relevant.

If the context mentions a group size, include an item to state group count.

Language/Localization Rules

Use the natural form locals would expect (e.g., Japanese: です/ます).

Avoid overly stiff forms (e.g., ご教示いただけますでしょうか is too formal). Prefer simple: 教えてください, 見せてもらえますか, etc.

Use standard, polite, daily language.

Safety & Filtering

No profanity, adult content, or unsafe medical/legal advice.

Avoid culturally insensitive phrasing.

Formatting Rules (Hard)

Output only the JSON ARRAY. No markdown, no comments, no trailing text.

All required keys present and non‑empty.

Array length: 20–24.

Order must be sequential starting from 0.

Example Input

{
  "userContext": "Going into a Japanese shrine with 3 friends",
  "targetLang": "ja-JP",
  "uiLang": "en"
}

Example Output (truncated for brevity; real output must have 20–24 items)

[
  {"order":0,"group":"Greetings","label":"Hello","localDialogue":"Hello.","targetDialogue":"こんにちは。"},
  {"order":1,"group":"Logistics","label":"We are four","localDialogue":"We are four people.","targetDialogue":"4人です。"},
  {"order":2,"group":"Etiquette","label":"How to pray?","localDialogue":"Could you tell me how to pray here?","targetDialogue":"ここでの参拝の仕方を教えてください。"},
  {"order":3,"group":"Directions","label":"Wash hands","localDialogue":"Where is the place to wash hands?","targetDialogue":"手水舎はどこですか。"},
  {"order":4,"group":"Etiquette","label":"Photos allowed?","localDialogue":"Is it okay to take photos here?","targetDialogue":"ここで写真を撮ってもいいですか。"},
  {"order":5,"group":"Help","label":"Please slowly","localDialogue":"Could you say that more slowly?","targetDialogue":"すみません、もう少しゆっくり話してください。"}
]

Note: The real output you produce must include 20–24 items and contain only the JSON array.

User input: {{userInput}}

User info: {{userInfo}}
`

export const GENERATE_PHRASE_FROM_LABEL_PROMPT = `
Your goal is to generate a single natural, polite phrase pair from a user-provided label, using scenario context to inform the appropriate phrasing.

Goal

From a short label describing the user's intended phrase, generate a complete phrase pair including:
- A natural, polite English phrase (localDialogue)
- An accurate translation in the target language (targetDialogue)
- Appropriate grouping based on the phrase's purpose

Inputs

label (string, English): A short description of what the user wants to say. Example: "Ask for more water", "Complain about slow service", "Thank the staff"

scenarioContext (string, English): Context about the current situation/scenario to help generate appropriate phrasing. Example: "Dining at a restaurant in Tokyo", "Checking into a hotel in Seoul"

targetLang (string, IETF code): The target language code, e.g., ja-JP, ko-KR, fr-FR.

uiLang (string): Always "en" for now.

userInfo (object): Personal information about the user to provide context for more personalized phrases. Includes displayName, gender, preferredLanguage, travelPreferences, foodAllergies, religion, and personalNotes.

Output (STRICT)

Return only a JSON OBJECT (no wrapper, no prose) with the following keys:

label (string, English, 2–4 words): Short button title matching or refining the input label.

localDialogue (string, in user preferred language): Natural, polite sentence the user intends to say. Make it sound like something a real person would actually say in the given context.

targetDialogue (string, in targetLang script only): Exact TTS line to speak. No romaji, no mixed English. Use natural local phrasing.

group (string): One of "Greetings" | "Requests" | "Directions" | "Etiquette" | "Purchasing" | "Help" | "Safety" | "Logistics" | "SmallTalk" based on the phrase's purpose.

Style & Politeness

Assume the user is a foreign visitor trying to be friendly, clear, and respectful. Use language that locals use with each other in everyday polite conversation.

Keep both localDialogue and targetDialogue short, natural, and unambiguous (≈ 6–14 words). Prefer phrases a local would actually use in daily interactions.

Use the scenario context to make the phrasing situationally appropriate. For example, restaurant context should use restaurant-appropriate language.

Personalization

Use the provided userInfo to tailor phrases when relevant:
- If user has food allergies, consider allergy-related phrasing
- If user has religious preferences, include appropriate religious context
- Use gender-appropriate language when culturally relevant
- Consider personal notes for additional context

Safety & Filtering

No profanity, adult content, or unsafe medical/legal advice.
Avoid culturally insensitive phrasing.

Formatting Rules (Hard)

Output only the JSON OBJECT. No markdown, no comments, no trailing text.
All required keys present and non‑empty.

Example Input

{
  "label": "Ask for more water",
  "scenarioContext": "Dining at a nice restaurant in Tokyo with friends",
  "targetLang": "ja-JP",
  "uiLang": "en"
}

Example Output

{
  "label": "More water please",
  "localDialogue": "Could we get some more water, please?",
  "targetDialogue": "お水をもう少しいただけますか。",
  "group": "Requests"
}

Scenario context: {{scenarioContext}}
Label input: {{label}}
User info: {{userInfo}}
`
