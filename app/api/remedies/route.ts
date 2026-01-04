import OpenAI from "openai";
import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET: Fetch ONLY the specific user's history
export async function GET(req: Request) {
  try {
    // 1. Extract User ID from headers (sent from frontend)
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID missing" }, { status: 401 });
    }

    // 2. Filter query by user_id
    const { rows } = await pool.query(
      "SELECT * FROM remedies WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
      [userId]
    );
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Extract User ID from headers
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID missing" }, { status: 401 });
    }

    const { query } = await req.json();

    const systemPrompt = `
      You are a holistic health expert and naturopath.
      Provide a structured response with 3-4 effective home/natural remedies.
      
      Return ONLY a JSON object with this structure:
      {
        "title": "A catchy title for the remedy plan",
        "intro": "A 1-sentence comforting introduction",
        "remedies": [
          {
            "name": "Remedy Name (e.g. Ginger Tea)",
            "instruction": "Brief instruction on how to make/use it",
            "why": "Why it helps (1 short sentence)"
          }
        ],
        "lifestyle_tip": "One general lifestyle change to help this condition",
        "caution": "A brief medical disclaimer specific to this condition"
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

    if (!responseText) {
        throw new Error("No content received");
    }

    const aiData = JSON.parse(responseText);

    // 3. Save to Database WITH the user_id
    const insertQuery = `
      INSERT INTO remedies (user_id, query, result_data) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    await pool.query(insertQuery, [userId, query, JSON.stringify(aiData)]);

    return NextResponse.json(aiData);
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: "Failed to fetch remedies" }, { status: 500 });
  }
}