"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma.server";
import { TaskStatus } from "@/types/task";

export async function getTasks() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const tasks = await prisma.task.findMany({
    where: { userId },
    include: { Reminder: true },
    orderBy: { deadline: "asc" },
  });

  return tasks;
}

export async function createTask(formData: FormData) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const durationValue = parseInt(formData.get("durationValue") as string);
  const durationUnit = formData.get("durationUnit") as string;
  const deadline = new Date(formData.get("deadline") as string);

  let duration = durationValue;
  if (durationUnit === "hours") {
    duration *= 60;
  } else if (durationUnit === "days") {
    duration *= 1440;
  }

  await prisma.task.create({
    data: {
      title,
      description,
      duration,
      deadline,
      userId,
    },
  });

  revalidatePath("/tasks");
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await prisma.task.update({
    where: { id: taskId, userId },
    data: { status },
  });

  revalidatePath("/tasks");
  return { success: true };
}

export async function toggleTaskStatus(taskId: string, newStatus: TaskStatus) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    await prisma.task.update({
      where: { id: taskId, userId },
      data: { status: newStatus },
    });

    revalidatePath("/tasks");
    return { success: true, message: "Task status updated successfully" };
  } catch (error) {
    console.error("Error updating task status:", error);
    return {
      success: false,
      message: "There was an error updating the task status",
    };
  }
}
