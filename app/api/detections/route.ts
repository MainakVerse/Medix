import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET: Fetch history
export async function GET() {
  try {
    const { rows } = await pool.query("SELECT * FROM detections ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

// POST: Save new detection and cleanup old ones
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { diagnosis_name, confidence, result_data } = body;

    // 1. Insert new record
    const insertQuery = `
      INSERT INTO detections (diagnosis_name, confidence, result_data) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const { rows } = await pool.query(insertQuery, [diagnosis_name, confidence, JSON.stringify(result_data)]);
    const newRecord = rows[0];

    // 2. Enforce Limit: Keep only latest 10, delete the rest
    // This subquery finds the IDs of the top 10 newest items. 
    // The DELETE removes anything NOT in that list.
    const cleanupQuery = `
      DELETE FROM detections 
      WHERE id NOT IN (
        SELECT id FROM detections 
        ORDER BY created_at DESC 
        LIMIT 10
      )
    `;
    await pool.query(cleanupQuery);

    return NextResponse.json(newRecord);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to save detection" }, { status: 500 });
  }
}