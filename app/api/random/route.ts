import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get total count of tests
    const count = await prisma.typingTest.count();
    if (count === 0) {
      return NextResponse.json(
        { error: "No typing tests available" },
        { status: 404 }
      );
    }

    // Skip a random number of records to get a random test
    const randomSkip = Math.floor(Math.random() * count);
    const [test] = await prisma.$transaction([
      prisma.typingTest.findFirst({
        skip: randomSkip,
      }),
    ]);

    if (!test) {
      return NextResponse.json(
        { error: "Failed to get random test" },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("Failed to fetch random test:", error);
    return NextResponse.json(
      { error: "Failed to fetch random test" },
      { status: 500 }
    );
  }
}
