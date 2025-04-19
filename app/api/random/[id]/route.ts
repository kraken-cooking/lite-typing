import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: testId } = await params;
  const { userId, wpm, accuracy, errors, duration } = await request.json();

  try {
    // First update the timesUsed counter on the test
    await prisma.typingTest.update({
      where: { id: testId },
      data: { timesUsed: { increment: 1 } },
    });

    // Then create the log entry
    const log = await prisma.typingLog.create({
      data: {
        userId,
        wpm,
        accuracy,
        errors,
        duration,
        testId,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Failed to create log:", error);
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}
