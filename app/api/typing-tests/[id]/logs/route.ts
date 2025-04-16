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
  
  return NextResponse.json(test.logs);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const logData = await request.json();
  const data = await readDataFile();
  
  const testIndex = data.tests.findIndex(test => test.id === params.id);
  if (testIndex === -1) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }
  
  const newLog: TypingLog = {
    ...logData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  data.tests[testIndex].logs.push(newLog);
  data.tests[testIndex].timesUsed += 1;
  
  await writeDataFile(data);
  return NextResponse.json(newLog);
} 