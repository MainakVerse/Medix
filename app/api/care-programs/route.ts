import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const GET = auth(async (req) => {
  if (!req.auth?.user?.email) return NextResponse.json([], { status: 401 });

  const { rows } = await pool.query(
    "SELECT * FROM care_programs WHERE user_email = $1 ORDER BY created_at DESC", 
    [req.auth.user.email]
  );
  return NextResponse.json(rows);
}) as any;

export const POST = auth(async (req) => {
  if (!req.auth?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { source_id, title, data } = await req.json();

  // Prevent duplicate programs for the same detection FOR THIS USER
  const check = await pool.query(
    "SELECT * FROM care_programs WHERE source_id = $1 AND user_email = $2", 
    [source_id, req.auth.user.email]
  );
  
  if (check.rows.length > 0) return NextResponse.json({ error: "Exists" }, { status: 409 });

  const { rows } = await pool.query(
    `INSERT INTO care_programs (user_email, source_id, title, data, progress) 
     VALUES ($1, $2, $3, $4, 0) RETURNING *`,
    [req.auth.user.email, source_id, title, JSON.stringify(data)]
  );

  return NextResponse.json(rows[0]);
}) as any;