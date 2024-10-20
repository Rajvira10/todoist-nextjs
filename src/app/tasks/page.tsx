import React, { Suspense } from "react";
import { getTasks } from "../actions/taskActions";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { TaskGrid } from "@/components/TaskGrid";
import { ViewToggle } from "@/components/ViewToggle";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const tasks = await getTasks();
  const view = searchParams.view === "grid" ? "grid" : "list";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex items-center space-x-4">
          <ViewToggle initialView={view} />
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
              <TaskForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Suspense fallback={<div>Loading tasks...</div>}>
        {view === "list" ? (
          <TaskList tasks={tasks} />
        ) : (
          <TaskGrid tasks={tasks} />
        )}
      </Suspense>
    </div>
  );
}
