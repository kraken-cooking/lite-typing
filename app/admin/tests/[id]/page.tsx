"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getTestById, updateTest } from "@/lib/typing-tests";

type TypingLog = {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  createdAt: string;
};

type TestDetails = {
  id: string;
  text: string;
  createdAt: string;
  timesUsed: number;
  logs: TypingLog[];
};

export default function TestDetails() {
  const [test, setTest] = useState<TestDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const params = useParams<{ id: string }>();

  useEffect(() => {
    // Fetch test details from JSON file
    const fetchTest = async () => {
      try {
        const data = await getTestById(params.id);
        if (data) {
          setTest(data);
          setEditedText(data.text);
        }
      } catch (error) {
        console.error("Error fetching test:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [params.id, router]);

  const handleUpdateTest = async () => {
    if (!test) return;

    try {
      const updatedTest = await updateTest(test.id, editedText);
      if (updatedTest) {
        setTest(updatedTest);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating test:", error);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!test) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Test not found</h1>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Test Details</h1>
          <p className="text-muted-foreground">
            Created on {format(new Date(test.createdAt), "MMM d, yyyy HH:mm")}
          </p>
        </div>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline">Edit Test</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Typing Test</DialogTitle>
              <DialogDescription>
                Modify the text for this typing test.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[200px]"
              />
              <Button onClick={handleUpdateTest} className="w-full">
                Update Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Test Text</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {test.text}
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Times Used</h3>
          <p className="text-3xl font-bold">{test.timesUsed}</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Average WPM</h3>
          <p className="text-3xl font-bold">
            {test.logs.length > 0
              ? Math.round(
                  test.logs.reduce((sum, log) => sum + log.wpm, 0) /
                    test.logs.length
                )
              : 0}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Typing Logs</h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>WPM</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Errors</TableHead>
              <TableHead>Duration (s)</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {test.logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.userId}</TableCell>
                <TableCell>{log.wpm}</TableCell>
                <TableCell>{log.accuracy}%</TableCell>
                <TableCell>{log.errors}</TableCell>
                <TableCell>{log.duration}</TableCell>
                <TableCell>
                  {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
