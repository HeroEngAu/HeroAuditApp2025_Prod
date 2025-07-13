import { NextResponse } from "next/server";
import { listUsers } from "../../../actions/form";

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}

