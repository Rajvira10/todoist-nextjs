"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma.server";

export async function deleteTask(taskId: string) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await prisma.reminder.deleteMany({
    where: { taskId },
  });

  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath("/tasks");
  redirect("/tasks");
}
