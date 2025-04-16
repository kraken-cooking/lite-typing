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
    return { tests: [] };
  }
}

async function writeDataFile(data: DataFile) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await readDataFile();
  const test = data.tests.find(test => test.id === params.id);
  
  if (!test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }
  
  return NextResponse.json(test);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { text } = await request.json();
  const data = await readDataFile();
  
  const index = data.tests.findIndex(test => test.id === params.id);
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await readDataFile();
  const initialLength = data.tests.length;
  
  data.tests = data.tests.filter(test => test.id !== params.id);
  
  if (data.tests.length === initialLength) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }
  
  await writeDataFile(data);
  return NextResponse.json({ success: true });
} 