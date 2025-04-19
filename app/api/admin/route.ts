import { NextResponse } from "next/server";

import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === "admin" && password === "admin123@@") {
      const cookieStore = await cookies();
      cookieStore.set("admin-auth", password);

      return NextResponse.json({
        message: "Login successful",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
