"use client";

import { useState, useEffect } from "react";
import { TypingTest } from "@/components/typing-test";
import { addLog } from "@/lib/typing-tests";
import { toast } from "sonner";

export default function Home() {
  const [testId, setTestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomTest = async () => {
      try {
        const response = await fetch("/api/random");
        if (!response.ok) throw new Error("Failed to fetch tests");
        const test = await response.json();
        setTestId(test.id);
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast.error("Failed to load typing test. Please try again.");
      }
    };

    fetchRandomTest();
  }, []);

  const handleTestComplete = async (stats: {
    wpm: number;
    accuracy: number;
    errors: number;
  }) => {
    if (!testId) return;

    try {
      await addLog(testId, {
        userId: "anonymous", // You might want to implement user authentication later
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errors: stats.errors,
        duration: 60, // Assuming 1 minute test duration
      });

      toast.success("Your test results have been saved!");
    } catch (error) {
      console.error("Error saving test results:", error);
      toast.error("Failed to save test results. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Lite Typing Test Logo"
            className="w-24 h-24 mb-4"
            width={96}
            height={96}
          />
          <h1 className="text-4xl font-bold text-center">Lite Typing Test</h1>
        </div>
        <TypingTest onComplete={handleTestComplete} />
      </div>
    </main>
  );
}
