"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma.server";
import { Resend } from "resend";

export async function setReminder(taskId: string, formData: FormData) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  console.log("Props Date", formData.get("date"));
  const user = await currentUser();
  if (!user || !user.emailAddresses[0]) {
    throw new Error("User email not found");
  }

  const date = formData.get("date") as string;
  const time = formData.get("time") as string;

  const reminderTime = new Date(`${date}T${time}:00`);

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    await prisma.reminder.create({
      data: {
        taskId,
        time: reminderTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
    const response = await resend.emails.send({
      from: "Todoist <todoist@rajvir-ahmed.xyz>",
      to: user.emailAddresses[0].emailAddress,
      subject: "Reminder",
      text: `You have a reminder for ${task.title}`,
      html: `You have a reminder for ${task.title}`,
      scheduledAt: reminderTime.toISOString(),
    });
    console.log(response, reminderTime.toISOString());
    console.log("Reminder email sent");
    revalidatePath("/tasks");
    return { success: true, message: "Reminder added successfully" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "There was an error adding the reminder",
    };
  }
}
