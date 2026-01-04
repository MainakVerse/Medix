import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { symptoms, history } = await req.json();

    const systemPrompt = `
      You are an advanced AI medical assistant. Your goal is to identify a disease based on user symptoms and provide a comprehensive treatment plan.
      
      RULES:
      1. Analyze the user's input.
      2. IF the symptoms are vague (e.g., just "headache"), output a JSON with status "incomplete" and a list of "followup_questions" to narrow it down.
      3. IF you have enough information to form a solid hypothesis, output a JSON with status "complete" and the full diagnosis details.

      REQUIRED FIELDS FOR COMPLETE DIAGNOSIS:
      - Disease Name & Confidence Score
      - Biological System (e.g., Respiratory, Cardiovascular)
      - Root Causes (What caused this?)
      - Medical Suggestions (Immediate medical advice, e.g., "Consult a cardiologist if chest pain persists")
      - Guidelines (Strict Dos and Don'ts)
      - Food Instructions (Dietary inclusions and exclusions)
      - Prescribed Medicines (Chemical composition + 3 Brand names)
      - Care Program (Timeline for recovery)

      OUTPUT FORMAT (JSON ONLY):
      {
        "status": "incomplete" | "complete",
        "followup_questions": ["Question 1?", "Question 2?"] (only if incomplete),
        "diagnosis": {
           "name": "Disease Name",
           "system": "Biological System",
           "confidence": 85,
           "causes": ["Cause 1", "Cause 2"],
           "medical_suggestions": [
             "Suggestion 1",
             "Suggestion 2"
           ],
           "guidelines": {
             "dos": ["Do this 1", "Do this 2"],
             "donts": ["Avoid this 1", "Avoid this 2"]
           },
           "food_instructions": {
             "allowed": ["Food item 1", "Food item 2"],
             "avoid": ["Food item 3", "Food item 4"]
           },
           "remedies": ["Home Remedy 1", "Home Remedy 2"],
           "medicines": [
             {
               "composition": "Chemical Name (e.g., Paracetamol 500mg)",
               "brands": ["Brand A", "Brand B", "Brand C"],
               "dosage_instruction": "1 tablet every 6 hours after food"
             }
           ],
           "care_plan": {
             "type": "Acute" | "Chronic",
             "timeline": [
               { "period": "Day 1-3", "action": "Step 1..." },
               { "period": "Month 1 Review", "action": "Step 2..." }
             ]
           }
        } (only if complete)
      }
    `;

    // Convert Frontend History (Gemini format) to OpenAI format
    // Gemini uses 'model', OpenAI uses 'assistant'
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.content,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" }, // Guarantees valid JSON
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: symptoms },
      ],
      temperature: 0.2, // Low temperature for consistent medical results
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
        throw new Error("No content received from OpenAI");
    }

    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze symptoms" },
      { status: 500 }
    );
  }
}