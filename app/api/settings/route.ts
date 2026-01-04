import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Your auth helper

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const GET = auth(async (req) => {
  if (!req.auth || !req.auth.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // FETCH BY EMAIL, NOT ID
    const { rows } = await pool.query(
      "SELECT * FROM user_settings WHERE email = $1", 
      [req.auth.user.email]
    );
    
    // If new user (Auth.ts usually handles creation, but safe fallback):
    if (rows.length === 0) return NextResponse.json({});

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}) as any;

export const POST = auth(async (req) => {
  if (!req.auth || !req.auth.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Destructure everything EXCEPT email (we trust the session email)
    const {
      first_name, last_name, phone, age, blood_type, height, weight,
      allergies, medical_conditions, emergency_contact, language, notifications_enabled
    } = body;

    const query = `
      UPDATE user_settings 
      SET 
        first_name = $1, last_name = $2, phone = $3,
        age = $4, blood_type = $5, height = $6, weight = $7, 
        allergies = $8, medical_conditions = $9, emergency_contact = $10,
        language = $11, notifications_enabled = $12, 
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $13
      RETURNING *
    `;

    const values = [
      first_name, last_name, phone, age, blood_type, height, weight,
      allergies, medical_conditions, emergency_contact, language, notifications_enabled,
      req.auth.user.email // ✅ SCOPE UPDATE TO LOGGED IN USER
    ];

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}) as any;