// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth" // Adjust path to where you saved auth.ts
export const { GET, POST } = handlers