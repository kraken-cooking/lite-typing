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
  currentWordIndex: number;
};

type TypingTestProps = {
  onComplete?: (stats: {
    wpm: number;
    accuracy: number;
    errors: number;
  }) => void;
};

export const TypingTest = ({ onComplete }: TypingTestProps) => {
  const [state, setState] = useState<TypingState>({
    text: "",
    input: "",
    startTime: null,
    endTime: null,
    errors: 0,
    isComplete: false,
    currentWordIndex: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Add timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>(null);

  // Timer effect
  useEffect(() => {
    if (state.startTime && !state.endTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - state.startTime!) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.startTime, state.endTime]);

  useEffect(() => {
    const fetchRandomTest = async () => {
      try {
        const response = await fetch("/api/typing-tests");
        if (!response.ok) throw new Error("Failed to fetch tests");
        const tests = await response.json();
        if (tests.length > 0) {
          const randomTest = tests[Math.floor(Math.random() * tests.length)];
          setState((prev) => ({ ...prev, text: randomTest.text }));
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    fetchRandomTest();
  }, []);

  const calculateStats = useCallback(() => {
    if (!state.startTime)
      return { wpm: 0, accuracy: 100, rawWpm: 0, penalty: 0 };

    const timeInMinutes =
      ((state.endTime || Date.now()) - state.startTime) / 60000;
    const chars = state.input.length;

    // Calculate raw WPM
    const rawWpm = chars / 5 / timeInMinutes;

    // Calculate error rate (percentage of characters that were errors)
    const errorRate = state.errors / chars;

    // Enhanced penalty: subtract 2 WPM for every 1% of errors
    const penalty = errorRate * 100 * 2;
    const adjustedWpm = Math.max(0, Math.round(rawWpm - penalty));

    const accuracy = Math.round(((chars - state.errors) / chars) * 100);

    return { wpm: adjustedWpm, accuracy, rawWpm, penalty };
  }, [state]);

  const getProgress = useCallback(() => {
    return (state.input.length / state.text.length) * 100;
  }, [state.input.length, state.text.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;

    if (!state.startTime) {
      setState((prev) => ({ ...prev, startTime: Date.now() }));
    }

    if (newInput.length <= state.text.length) {
      const errors = Array.from(newInput).reduce((count, char, index) => {
        return count + (char !== state.text[index] ? 1 : 0);
      }, 0);

      const currentWordIndex = newInput.split(" ").length - 1;
      const isComplete = newInput.length === state.text.length;

      setState((prev) => ({
        ...prev,
        input: newInput,
        errors,
        isComplete,
        endTime: isComplete ? Date.now() : null,
        currentWordIndex,
      }));

      if (isComplete && onComplete) {
        const stats = calculateStats();
        onComplete({ ...stats, errors });
      }
    }
  };

  const handleRestartCurrent = () => {
    setState((prev) => ({
      ...prev,
      input: "",
      startTime: null,
      endTime: null,
      errors: 0,
      isComplete: false,
      currentWordIndex: 0,
    }));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleNextTest = async () => {
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
          currentWordIndex: 0,
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
  const progress = getProgress();

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {/* Stats Bar */}
      <div className="bg-card rounded-lg p-4 shadow-sm border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center relative">
            <span className="text-sm text-muted-foreground">WPM</span>
            <span className="text-2xl font-bold">
              {wpm}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Accuracy</span>
            <span className="text-2xl font-bold">{accuracy}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Errors</span>
            <span className="text-2xl font-bold">{state.errors}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Time</span>
            <span className="text-2xl font-bold">{elapsedTime}s</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={handleRestartCurrent}
          variant="outline"
          className="w-auto"
          aria-label="Restart current test"
        >
          Restart Current
        </Button>
        <Button
          onClick={handleNextTest}
          variant="default"
          className="w-auto"
          aria-label="Next test"
        >
          Next Test
        </Button>
      </div>

      <div className="relative">
        <div
          className="p-6 rounded-lg border bg-card text-card-foreground min-h-[200px] shadow-sm"
          role="textbox"
          aria-label="Typing test text"
        >
          <div className="text-lg font-mono whitespace-pre-wrap leading-relaxed">
            {state.text.split("").map((char, index) => {
              const isTyped = index < state.input.length;
              const isCorrect = isTyped && char === state.input[index];
              const isCurrent = index === state.input.length;

              return (
                <span
                  key={index}
                  className={`
                    ${
                      isTyped
                        ? isCorrect
                          ? "text-green-500"
                          : "text-red-500"
                        : "text-muted-foreground"
                    }
                    ${
                      isCurrent
                        ? "bg-yellow-100 dark:bg-yellow-900 animate-pulse"
                        : ""
                    }
                    transition-all duration-200
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
        <div className="text-center space-y-4 p-6 rounded-lg border bg-card shadow-lg animate-in fade-in-50 duration-300">
          <h2 className="text-2xl font-bold">Test Complete!</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-4 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Final WPM</p>
              <p className="text-2xl font-bold">{wpm}</p>
              {calculateStats().penalty > 0 && (
                <p className="text-sm text-red-500">
                  (-{Math.round(calculateStats().penalty)} penalty)
                </p>
              )}
            </div>
            <div className="p-4 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">{accuracy}%</p>
            </div>
            <div className="p-4 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Total Errors</p>
              <p className="text-2xl font-bold">{state.errors}</p>
            </div>
            <div className="p-4 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-2xl font-bold">{elapsedTime}s</p>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            <Button
              onClick={handleRestartCurrent}
              variant="outline"
              aria-label="Try same test again"
            >
              Try Again
            </Button>
            <Button
              onClick={handleNextTest}
              variant="default"
              aria-label="Try new test"
            >
              New Test
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
