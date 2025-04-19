import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tests = await prisma.typingTest.findMany({
      include: {
        logs: true,
      },
    });
    return NextResponse.json(tests);
  } catch (error) {
    console.error("Failed to fetch tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const test = await prisma.typingTest.create({
      data: {
        text,
        timesUsed: 0,
      },
    });
    return NextResponse.json(test);
  } catch (error) {
    console.error("Failed to create test:", error);
    return NextResponse.json(
      { error: "Failed to create test" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { id, text } = await request.json();

  try {
    const updatedTest = await prisma.typingTest.update({
      where: { id },
      data: { text },
    });
    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error("Failed to create log:", error);
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  try {
    await prisma.typingTest.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create log:", error);
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
}
