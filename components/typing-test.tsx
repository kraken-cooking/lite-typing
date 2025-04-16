"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

type TypingState = {
  text: string;
  input: string;
  startTime: number | null;
  endTime: number | null;
  errors: number;
  isComplete: boolean;
};

type TypingTestProps = {
  onComplete?: (stats: { wpm: number; accuracy: number; errors: number }) => void;
};

export const TypingTest = ({ onComplete }: TypingTestProps) => {
  const [state, setState] = useState<TypingState>({
    text: "",
    input: "",
    startTime: null,
    endTime: null,
    errors: 0,
    isComplete: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRandomTest = async () => {
      try {
        const response = await fetch("/api/typing-tests");
        if (!response.ok) throw new Error("Failed to fetch tests");
        const tests = await response.json();
        if (tests.length > 0) {
          const randomTest = tests[Math.floor(Math.random() * tests.length)];
          setState(prev => ({ ...prev, text: randomTest.text }));
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    fetchRandomTest();
  }, []);

  const calculateStats = useCallback(() => {
    if (!state.startTime) return { wpm: 0, accuracy: 100 };

    const timeInMinutes = ((state.endTime || Date.now()) - state.startTime) / 60000;
    const chars = state.input.length;
    
    // Calculate raw WPM
    const rawWpm = (chars / 5) / timeInMinutes;
    
    // Calculate error rate (percentage of characters that were errors)
    const errorRate = state.errors / chars;
    
    // Apply penalty: subtract 1 WPM for every 2% of errors
    const penalty = (errorRate * 100) / 2;
    const adjustedWpm = Math.max(0, Math.round(rawWpm - penalty));
    
    const accuracy = Math.round(((chars - state.errors) / chars) * 100);

    return { wpm: adjustedWpm, accuracy };
  }, [state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    
    if (!state.startTime) {
      setState(prev => ({ ...prev, startTime: Date.now() }));
    }

    if (newInput.length <= state.text.length) {
      const errors = Array.from(newInput).reduce((count, char, index) => {
        return count + (char !== state.text[index] ? 1 : 0);
      }, 0);

      const isComplete = newInput.length === state.text.length;
      setState(prev => ({
        ...prev,
        input: newInput,
        errors,
        isComplete,
        endTime: isComplete ? Date.now() : null,
      }));

      if (isComplete && onComplete) {
        const stats = calculateStats();
        onComplete({ ...stats, errors });
      }
    }
  };

  const handleRestart = async () => {
    try {
      const response = await fetch("/api/typing-tests");
      if (!response.ok) throw new Error("Failed to fetch tests");
      const tests = await response.json();
      if (tests.length > 0) {
        const randomTest = tests[Math.floor(Math.random() * tests.length)];
        setState({
          text: randomTest.text,
          input: "",
          startTime: null,
          endTime: null,
          errors: 0,
          isComplete: false,
        });
      }
    } catch (error) {
      console.error("Error fetching new test:", error);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent backspace from going beyond the start
    if (e.key === "Backspace" && state.input.length === 0) {
      e.preventDefault();
    }
    // Prevent typing beyond the end
    if (state.isComplete) {
      e.preventDefault();
    }
  };

  const { wpm, accuracy } = calculateStats();

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <span className="text-lg font-medium">WPM: {wpm}</span>
          <span className="text-lg font-medium">Accuracy: {accuracy}%</span>
          <span className="text-lg font-medium">Errors: {state.errors}</span>
        </div>
        <Button 
          onClick={handleRestart} 
          variant="outline"
          className="w-full sm:w-auto"
          aria-label="Restart typing test"
        >
          Restart
        </Button>
      </div>

      <div className="relative">
        <div 
          className="p-4 rounded-lg border bg-card text-card-foreground min-h-[200px]"
          role="textbox"
          aria-label="Typing test text"
        >
          <div className="text-lg font-mono whitespace-pre-wrap leading-relaxed">
            {state.text.split("").map((char, index) => {
              const isTyped = index < state.input.length;
              const isCorrect = isTyped && char === state.input[index];
              
              return (
                <span
                  key={index}
                  className={`
                    ${isTyped ? (isCorrect ? "text-green-500" : "text-red-500") : "text-muted-foreground"}
                    ${index === state.input.length ? "bg-yellow-100 dark:bg-yellow-900" : ""}
                    transition-colors duration-100
                  `}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={state.input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full opacity-0 cursor-default"
          autoFocus
          disabled={state.isComplete}
          aria-label="Type here"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      {state.isComplete && (
        <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
          <h2 className="text-2xl font-bold">Test Complete!</h2>
          <div className="space-y-2">
            <p className="text-lg">Final WPM: {wpm}</p>
            <p className="text-lg">Accuracy: {accuracy}%</p>
            <p className="text-lg">Total Errors: {state.errors}</p>
          </div>
          <Button 
            onClick={handleRestart} 
            className="mt-4"
            aria-label="Try again"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}; 