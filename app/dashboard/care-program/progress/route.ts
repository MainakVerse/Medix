import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: Request) {
  try {
    const { program_id, task_name, is_completed, total_tasks_count, date_str } = await req.json();
    
    // Use the date passed from frontend to ensure consistency (Timezones!)
    // Fallback to server date if missing
    const todayStr = date_str || new Date().toISOString().split('T')[0];

    // 1. Fetch current program
    const { rows } = await pool.query("SELECT * FROM care_programs WHERE id = $1", [program_id]);
    if (rows.length === 0) return NextResponse.json({ error: "Program not found" }, { status: 404 });

    const program = rows[0];
    let data = program.data || {};

    // 2. Initialize logs structure if missing
    if (!data.logs) data.logs = {};
    if (!data.logs[todayStr]) data.logs[todayStr] = { completed: [] };

    // 3. Toggle Logic
    let currentCompleted = data.logs[todayStr].completed || [];
    
    if (is_completed) {
        // Add if not exists
        if (!currentCompleted.includes(task_name)) {
            currentCompleted.push(task_name);
        }
    } else {
        // Remove if exists
        currentCompleted = currentCompleted.filter((t: string) => t !== task_name);
    }
    
    // Write back to data object
    data.logs[todayStr].completed = currentCompleted;

    // 4. Recalculate Progress
    // Logic: Assume 5 Days Duration. Each Day = 20%.
    // Daily Score = (Completed Tasks / Total Tasks) * 20
    
    let totalScore = 0;
    const days = Object.keys(data.logs);
    
    days.forEach(day => {
        const log = data.logs[day];
        const taskCount = log.completed.length;
        if (taskCount > 0) {
            // Calculate ratio for that day
            const dailyRatio = taskCount / total_tasks_count;
            // Cap daily contribution at 20 (representing 1 day out of 5)
            const dailyScore = dailyRatio * 20; 
            totalScore += dailyScore;
        }
    });

    // Cap total at 100%
    const newProgress = Math.min(Math.round(totalScore), 100);

    // 5. Update Database
    // We explicitly cast the data to jsonb to ensure Postgres handles it correctly
    await pool.query(
        "UPDATE care_programs SET data = $1::jsonb, progress = $2 WHERE id = $3",
        [JSON.stringify(data), newProgress, program_id]
    );

    return NextResponse.json({ success: true, newProgress });
  } catch (error) {
    console.error("Progress Update Error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}