import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface AddTaskModalProps {
  boardId: Id<"boards">;
  columnId: Id<"columns">;
  onClose: () => void;
}

export function AddTaskModal({ boardId, columnId, onClose }: AddTaskModalProps) {
  const createTask = useMutation(api.tasks.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await createTask({
      boardId,
      columnId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className="w-full max-w-md border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b-4 border-black bg-black text-white p-4 flex items-center justify-between">
          <h3 className="font-mono text-lg md:text-xl font-bold uppercase">
            NEW_TASK
          </h3>
          <button
            onClick={onClose}
            className="font-mono text-lg hover:text-red-400 transition-colors"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="font-mono text-xs uppercase font-bold block mb-2">
              TITLE *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="TASK TITLE"
              className="w-full border-4 border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-[#f5f5f0]"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="font-mono text-xs uppercase font-bold block mb-2">
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full border-4 border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-[#f5f5f0] resize-none h-24"
            />
          </div>

          <div>
            <label className="font-mono text-xs uppercase font-bold block mb-2">
              PRIORITY
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`border-4 border-black p-3 font-mono text-xs uppercase font-bold transition-all ${
                    priority === p
                      ? p === "low"
                        ? "bg-blue-500 text-white"
                        : p === "medium"
                        ? "bg-yellow-400 text-black"
                        : "bg-red-500 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {p === "low" ? "LOW" : p === "medium" ? "MED" : "HIGH"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t-4 border-black">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 border-4 border-black bg-black text-white p-3 font-mono text-sm uppercase font-bold hover:bg-green-500 transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {isSubmitting ? "CREATING..." : ">> CREATE TASK"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-4 border-black p-3 font-mono text-sm uppercase font-bold hover:bg-red-500 hover:text-white transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
