// Types from Prisma schema
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

// API functions - All data operations now go through PostgreSQL via API routes
export async function getAllTests(): Promise<TypingTest[]> {
  const response = await fetch("/api/typing-tests");
  if (!response.ok) {
    throw new Error("Failed to fetch tests");
  }
  return response.json();
}

export async function getTestById(id: string): Promise<TypingTest | null> {
  const response = await fetch(`/api/typing-tests/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch test");
  }
  return response.json();
}

export async function addTest(text: string): Promise<TypingTest> {
  const response = await fetch("/api/typing-tests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error("Failed to add test");
  }
  return response.json();
}

export async function updateTest(
  id: string,
  text: string
): Promise<TypingTest | null> {
  const response = await fetch(`/api/typing-tests/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to update test");
  }
  return response.json();
}

export async function deleteTest(id: string): Promise<boolean> {
  const response = await fetch(`/api/typing-tests/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    if (response.status === 404) {
      return false;
    }
    throw new Error("Failed to delete test");
  }
  return true;
}

export async function addLog(
  testId: string,
  log: Omit<TypingLog, "id" | "createdAt">
): Promise<TypingLog | null> {
  const response = await fetch(`/api/typing-tests/${testId}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(log),
  });
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to add log");
  }
  return response.json();
}
