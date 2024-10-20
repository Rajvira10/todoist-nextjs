"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma.server";

export async function editTask(taskId: string, formData: FormData) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const durationValue = parseInt(formData.get("duration") as string);
  const durationUnit = formData.get("durationUnit") as string;
  const deadline = new Date(formData.get("deadline") as string);

  let duration = durationValue;
  if (durationUnit === "hours") {
    duration *= 60;
  } else if (durationUnit === "days") {
    duration *= 1440;
  }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        duration,
        deadline,
      },
    });
    revalidatePath("/tasks");
    return { success: true, message: "Task updated successfully" };
  } catch {
    return { success: false, message: "There was an error updating the task" };
  }
}
