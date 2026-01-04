import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const GET = auth(async (req) => {
  if (!req.auth?.user?.email) return NextResponse.json([], { status: 401 });

  const { rows } = await pool.query(
    "SELECT * FROM prescriptions WHERE user_email = $1 ORDER BY uploaded_at DESC", 
    [req.auth.user.email]
  );
  return NextResponse.json(rows);
}) as any;

export const POST = auth(async (req) => {
  if (!req.auth?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patient_name, image_url, doctor_notes } = await req.json();
  
  await pool.query(
    `INSERT INTO prescriptions (user_email, patient_name, image_url, doctor_notes) 
     VALUES ($1, $2, $3, $4)`,
    [req.auth.user.email, patient_name, image_url, doctor_notes]
  );

  return NextResponse.json({ success: true });
}) as any;