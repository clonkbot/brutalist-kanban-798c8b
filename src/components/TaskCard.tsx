import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
}

const priorityConfig = {
  low: {
    bg: "bg-blue-100",
    border: "border-blue-600",
    text: "text-blue-800",
    label: "LOW",
  },
  medium: {
    bg: "bg-yellow-100",
    border: "border-yellow-600",
    text: "text-yellow-800",
    label: "MED",
  },
  high: {
    bg: "bg-red-100",
    border: "border-red-600",
    text: "text-red-800",
    label: "HIGH",
  },
};

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  const deleteTask = useMutation(api.tasks.remove);
  const updateTask = useMutation(api.tasks.update);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");

  const priority = priorityConfig[task.priority];

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    await updateTask({
      id: task._id,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("DELETE THIS TASK?")) {
      await deleteTask({ id: task._id });
    }
  };

  if (isEditing) {
    return (
      <div className="border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full border-2 border-black p-2 font-mono text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description..."
          className="w-full border-2 border-black p-2 font-mono text-xs mb-2 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 border-2 border-black bg-black text-white px-3 py-1 font-mono text-xs uppercase font-bold hover:bg-green-500 transition-colors"
          >
            SAVE
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditTitle(task.title);
              setEditDescription(task.description || "");
            }}
            className="flex-1 border-2 border-black px-3 py-1 font-mono text-xs uppercase font-bold hover:bg-gray-200 transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group border-4 border-black bg-white p-3 cursor-grab active:cursor-grabbing shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 border-2 ${priority.border} ${priority.bg} ${priority.text}`}
        >
          {priority.label}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="font-mono text-xs border border-black px-1.5 py-0.5 hover:bg-yellow-400 transition-colors"
            title="Edit"
          >
            E
          </button>
          <button
            onClick={handleDelete}
            className="font-mono text-xs border border-black px-1.5 py-0.5 hover:bg-red-500 hover:text-white transition-colors"
            title="Delete"
          >
            X
          </button>
        </div>
      </div>

      <h4 className="font-mono text-sm font-bold uppercase leading-tight mb-1">
        {task.title}
      </h4>

      {task.description && (
        <p className="font-mono text-xs text-gray-600 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t-2 border-black">
        <span className="font-mono text-[10px] text-gray-500">
          {new Date(task.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-black"></div>
          <div className="w-2 h-2 bg-black opacity-60"></div>
          <div className="w-2 h-2 bg-black opacity-30"></div>
        </div>
      </div>
    </div>
  );
}
