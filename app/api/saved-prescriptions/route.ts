import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { auth } from "@/auth"; 

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const GET = auth(async (req) => {
  if (!req.auth?.user?.email) return NextResponse.json([], { status: 401 });

  try {
    // ✅ Filter by user_email
    const { rows } = await pool.query(
      "SELECT * FROM saved_prescriptions WHERE user_email = $1 ORDER BY created_at DESC", 
      [req.auth.user.email]
    );
    return NextResponse.json(rows);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}) as any;

export const POST = auth(async (req) => {
  if (!req.auth?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { patient_name, age, diagnosis, symptoms, medicines, doctor_notes } = body;

    // ✅ Insert with user_email
    await pool.query(
      `INSERT INTO saved_prescriptions 
      (user_email, patient_name, age, diagnosis, symptoms, medicines, doctor_notes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.auth.user.email, patient_name, age, diagnosis, symptoms, JSON.stringify(medicines), doctor_notes]
    );

    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}) as any;