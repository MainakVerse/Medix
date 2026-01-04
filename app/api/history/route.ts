import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const GET = auth(async (req) => {
  if (!req.auth?.user?.email) return NextResponse.json([], { status: 401 });

  const email = req.auth.user.email;

  try {
    // 1. Get recent Detections
    // (Assuming you have a detections table, if not we skip)
    // const detections = await pool.query("SELECT id, diagnosis_name, created_at FROM detections WHERE user_email = $1 ORDER BY created_at DESC LIMIT 3", [email]);

    // 2. Get recent Prescriptions (Digital)
    const digitalRx = await pool.query(
        "SELECT id, patient_name, diagnosis, created_at FROM saved_prescriptions WHERE user_email = $1 ORDER BY created_at DESC LIMIT 3", 
        [email]
    );

    // 3. Get recent Uploads
    const uploads = await pool.query(
        "SELECT id, patient_name, uploaded_at as created_at FROM prescriptions WHERE user_email = $1 ORDER BY uploaded_at DESC LIMIT 3", 
        [email]
    );

    return NextResponse.json({
        // detections: detections.rows,
        digitalRx: digitalRx.rows,
        uploads: uploads.rows
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}) as any;