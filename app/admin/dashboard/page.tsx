"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { getAllTests, addTest, deleteTest } from "@/lib/typing-tests";
import { adminLogoutAction } from "@/app/actions/admin-logout";

type TypingTest = {
  id: string;
  text: string;
  createdAt: string;
  timesUsed: number;
};

export default function AdminDashboard() {
  const [tests, setTests] = useState<TypingTest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTest, setNewTest] = useState({ text: "" });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch tests from JSON file
    const fetchTests = async () => {
      try {
        const data = await getAllTests();
        setTests(data);
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [router]);

  const handleLogout = () => {
    adminLogoutAction();
    router.push("/admin");
  };

  const handleAddTest = async () => {
    try {
      const newTestObj = await addTest(newTest.text);
      setTests([...tests, newTestObj]);
      setIsAdding(false);
      setNewTest({ text: "" });
    } catch (error) {
      console.error("Error adding test:", error);
    }
  };

  const handleDeleteTest = async (id: string) => {
    try {
      const success = await deleteTest(id);
      if (success) {
        setTests(tests.filter((test) => test.id !== id));
      }
    } catch (error) {
      console.error("Error deleting test:", error);
    }
  };

  const filteredTests = tests.filter((test) =>
    test.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Typing Tests Management</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button>Add New Test</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Typing Test</DialogTitle>
                <DialogDescription>
                  Enter the text for the new typing test.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={newTest.text}
                  onChange={(e) => setNewTest({ text: e.target.value })}
                  placeholder="Enter typing test text..."
                  className="min-h-[200px]"
                />
                <Button onClick={handleAddTest} className="w-full">
                  Add Test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Text Preview</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Times Used</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="max-w-md truncate">{test.text}</TableCell>
                <TableCell>
                  {format(new Date(test.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>{test.timesUsed}</TableCell>
                <TableCell>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/tests/${test.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
