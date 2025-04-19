-- CreateTable
CREATE TABLE "TypingTest" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TypingTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypingLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wpm" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "errors" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testId" TEXT NOT NULL,

    CONSTRAINT "TypingLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TypingLog" ADD CONSTRAINT "TypingLog_testId_fkey" FOREIGN KEY ("testId") REFERENCES "TypingTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
