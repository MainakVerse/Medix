import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const systemPrompt = `
      You are an expert pharmaceutical assistant. 
      
      STEP 1: ANALYZE THE INPUT "${query}"
      - Is it a MEDICINE Name? OR is it a SYMPTOM?

      STEP 2: GENERATE RESPONSE
      - IF MEDICINE: Provide details for that medicine.
      - IF SYMPTOM: Identify the most common FDA-approved medication for it.

      STEP 3: OUTPUT JSON ONLY
      {
        "is_symptom_search": boolean,
        "searched_term": "${query}",
        "name": "Medicine Name",
        "category": "Drug Family",
        "composition": "Chemical Composition",
        "usage": "Primary indications",
        "directions": "Standard dosage",
        "commercial_names": ["Brand A", "Brand B", "Brand C", "Brand D", "Brand E"],
        "warnings": ["Warning 1", "Warning 2"],
        "alternatives": [
          { "name": "Alt 1", "manufacturer": "Mfg A", "price": "$X" },
          { "name": "Alt 2", "manufacturer": "Mfg B", "price": "$X" },
          { "name": "Alt 3", "manufacturer": "Mfg C", "price": "$X" }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
    });

    const responseText = completion.choices[0].message.content;
    const data = JSON.parse(responseText || "{}");

    return NextResponse.json(data);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}