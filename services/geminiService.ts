import { GoogleGenAI } from "@google/genai";
import { LessonData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askAiTutor = async (
  question: string,
  contextText: string,
  contextTitle: string
): Promise<string> => {
  try {
    const prompt = `
      Context (Dutch Text):
      Title: "${contextTitle}"
      Body: "${contextText}"

      User Question: "${question}"

      System Instruction:
      You are a friendly and patient Dutch language tutor for NT2 students.
      CRITICAL: You must adhere to the **ERK (Europees Referentiekader)** standards in your explanation.
      
      Guidelines based on ERK levels:
      - If the text is simple (A1/A2), keep explanations very simple.
      - If the text is intermediate (B1), you can use slightly more advanced vocabulary but remain clear.
      
      Task:
      1. Answer the question simply and clearly.
      2. If the user asks for a translation, provide it.
      3. If the user asks about grammar, explain it using the simplest possible Dutch or English.
      4. Keep the response concise (under 80 words).
      5. Be encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Sorry, ik begreep dat niet helemaal. Probeer het nog eens.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is een fout opgetreden bij het verbinden met de AI-docent. Controleer je internetverbinding.";
  }
};

export const generateBridgeLesson = async (
  difficulty: number,
  themes: string[],
  targetLevel: 'A1' | 'A2' | 'B1'
): Promise<LessonData | null> => {
  try {
    const uniqueThemes = [...new Set(themes)].slice(0, 3).join(", "); // Pick max 3 themes to combine
    
    // Config based on target level
    const levelConfig = {
      A1: {
        words: '120-150',
        questions: 4,
        grammar: "Short main clauses. Present tense. Conjunctions: 'en', 'want'.",
        vocab: "Concrete, high-frequency."
      },
      A2: {
        words: '150-200',
        questions: 6,
        grammar: "Compound sentences. Present & Past tense. Conjunctions: 'omdat', 'maar', 'toen'.",
        vocab: "Varied, describing experiences."
      },
      B1: {
        words: '200-250',
        questions: 6,
        grammar: "Complex sentences. Relative clauses. Abstract concepts. Argumentation.",
        vocab: "Abstract, professional, opinions."
      }
    };

    const config = levelConfig[targetLevel];
    
    const systemInstruction = `
      You are an expert NT2 (Dutch as Second Language) curriculum developer.
      You must create a lesson that STRICTLY follows the **ERK (Europees Referentiekader)** guidelines for **${targetLevel}**.

      Target Audience: ${targetLevel} level students moving to difficulty ${difficulty + 1}.
      Task: Create a text that combines these themes: ${uniqueThemes}.
      
      STRICT LINGUISTIC CONSTRAINTS (${targetLevel}):
      1. **Voegwoorden (Conjunctions)**: 
         - A1: 'en', 'want'. 
         - A2: 'en', 'want', 'maar', 'omdat', 'dus'.
         - B1: 'terwijl', 'hoewel', 'tenzij', 'zodra', 'daarom'.
      2. **Zinsbouw (Sentence Structure)**:
         - A1: Short main clauses.
         - A2: Simple subordinate clauses allowed.
         - B1: Complex sentences, inversions, relative clauses allowed.
      3. **Inhoud (Content)**:
         ${targetLevel === 'B1' ? '- Can contain abstract topics, opinions, work situations.' : '- Focus on concrete, daily life situations.'}

      Output Requirements:
      1. Text length: ${config.words} words.
      2. Narrative: Ensure the story connects the themes logically.
      3. Structure: 
         - "id": unique string
         - "meta": { "theme": "Gecombineerd: ${uniqueThemes}", "level_erk": "${targetLevel}", "difficulty": ${difficulty}, "language": "nl-NL" }
         - "context_questions": Array of 3 Dutch questions (LCPP) to activate prior knowledge.
         - "text_content": { "title": "...", "body": "..." }
         - "questions": Array of ${config.questions} multiple choice questions.
           - "options": Array of 4 strings.
           - "correct_option_index": number (0-3).
           - "feedback": { "correct": "...", "incorrect": "Lees de tekst nog eens." }
           - Note: For A2 and B1, include 2 insight/inference questions.
      
      Return ONLY the raw JSON string. No markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate the lesson JSON now.",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");

    // Clean up potential markdown code blocks if the model ignores instruction
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const lessonData: LessonData = JSON.parse(jsonString);
    // Ensure ID is unique-ish
    lessonData.id = `generated_${Date.now()}`;
    lessonData.isGenerated = true; // Flag for UI styling
    
    return lessonData;
  } catch (error) {
    console.error("Bridge Lesson Generation Error:", error);
    return null;
  }
};