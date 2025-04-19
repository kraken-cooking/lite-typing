import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data/typing-tests.json');

type TypingTest = {
  id: string;
  text: string;
  createdAt: string;
  timesUsed: number;
  logs: TypingLog[];
};

type TypingLog = {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  createdAt: string;
};

type DataFile = {
  tests: TypingTest[];
};

async function readDataFile(): Promise<DataFile> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log(error)
    return { tests: [] };
  }
}

async function writeDataFile(data: DataFile) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await readDataFile();
  return NextResponse.json(data.tests);
}

export async function POST(request: Request) {
  const { text } = await request.json();
  const data = await readDataFile();
  
  const newTest: TypingTest = {
    id: Date.now().toString(),
    text,
    createdAt: new Date().toISOString(),
    timesUsed: 0,
    logs: [],
  };
  
  data.tests.push(newTest);
  await writeDataFile(data);
  
  return NextResponse.json(newTest);
}

export async function PUT(request: Request) {
  const { id, text } = await request.json();
  const data = await readDataFile();
  
  const index = data.tests.findIndex(test => test.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }
  
  data.tests[index] = {
    ...data.tests[index],
    text,
  };
  
  await writeDataFile(data);
  return NextResponse.json(data.tests[index]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const data = await readDataFile();
  
  const initialLength = data.tests.length;
  data.tests = data.tests.filter(test => test.id !== id);
  
  if (data.tests.length === initialLength) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }
  
  await writeDataFile(data);
  return NextResponse.json({ success: true });
} 