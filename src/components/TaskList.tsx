"use client";
import React, { useState } from "react";
import { Task, TaskStatus } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, Circle, Clock, MoreVertical } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import TaskEditDialog from "./TaskEditDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import TaskDeleteDialog from "./TaskDeleteDialog";
import ReminderDialog from "./ReminderDialog";
import { toggleTaskStatus } from "@/app/actions/taskActions";
import { useRouter } from "next/navigation";

interface TaskListProps {
  tasks: Task[];
}

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "ONGOING":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <Circle className="h-5 w-5 text-gray-500" />;
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hours`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

export function TaskList({ tasks }: TaskListProps) {
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [reminderTaskId, setReminderTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const router = useRouter();

  async function handleToggleTaskStatus(task: Task) {
    let newStatus: TaskStatus;
    if (task.status === "NOT_STARTED") {
      newStatus = "ONGOING";
    } else if (task.status === "ONGOING") {
      newStatus = "COMPLETED";
    } else {
      newStatus = "NOT_STARTED";
    }

    await toggleTaskStatus(task.id, newStatus);
    router.refresh();
  }

  const filteredTasks = tasks.filter(
    (task) => activeTab === "ALL" || task.status === activeTab
  );

  const renderTasks = (tasksToRender: Task[]) => (
    <div className="space-y-4">
      {tasksToRender.map((task) => (
        <Card
          key={task.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  {getStatusIcon(task.status)}
                  <span className="ml-2">{task.title}</span>
                </CardTitle>
                <CardDescription>
                  Due: {format(new Date(task.deadline), "PPP")}
                </CardDescription>
              </div>
              <Badge
                variant={
                  task.status === "COMPLETED"
                    ? "default"
                    : task.status === "ONGOING"
                    ? "secondary"
                    : "outline"
                }
              >
                {task.status.toLowerCase().replace("_", " ")}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Dialog>
                    <DialogTrigger
                      asChild
                      onClick={() => setEditTaskId(task.id)}
                    >
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                    </DialogTrigger>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      asChild
                      onClick={() => setReminderTaskId(task.id)}
                    >
                      <DropdownMenuItem>Set Reminder</DropdownMenuItem>
                    </DialogTrigger>
                  </Dialog>
                  <DropdownMenuItem
                    onSelect={() => handleToggleTaskStatus(task)}
                  >
                    {task.status === "COMPLETED"
                      ? "Mark Incomplete"
                      : task.status === "ONGOING"
                      ? "Mark Complete"
                      : "Mark Ongoing"}
                  </DropdownMenuItem>
                  <Dialog>
                    <DialogTrigger
                      asChild
                      onClick={() => setDeleteTaskId(task.id)}
                    >
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </Dialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          {task.description && (
            <CardContent>
              <p className="text-sm text-gray-500">{task.description}</p>
            </CardContent>
          )}
          <CardFooter className="text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {formatDuration(task?.duration)}
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <Tabs defaultValue="ALL" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="NOT_STARTED">Not Started</TabsTrigger>
          <TabsTrigger value="ONGOING">Ongoing</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="ALL">{renderTasks(filteredTasks)}</TabsContent>
        <TabsContent value="NOT_STARTED">
          {renderTasks(filteredTasks)}
        </TabsContent>
        <TabsContent value="ONGOING">{renderTasks(filteredTasks)}</TabsContent>
        <TabsContent value="COMPLETED">
          {renderTasks(filteredTasks)}
        </TabsContent>
      </Tabs>

      {editTaskId && (
        <TaskEditDialog
          task={tasks.find((t) => t.id === editTaskId)!}
          open={!!editTaskId}
          onOpenChange={(open) => {
            if (!open) setEditTaskId(null);
          }}
        />
      )}
      {deleteTaskId && (
        <TaskDeleteDialog
          taskId={deleteTaskId}
          open={!!deleteTaskId}
          onOpenChange={(open) => {
            if (!open) setDeleteTaskId(null);
          }}
        />
      )}
      {reminderTaskId && (
        <ReminderDialog
          task={tasks.find((t) => t.id === reminderTaskId)!}
          open={!!reminderTaskId}
          onOpenChange={(open) => {
            if (!open) setReminderTaskId(null);
          }}
        />
      )}
    </>
  );
}
