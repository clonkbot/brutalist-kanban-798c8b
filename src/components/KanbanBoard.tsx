import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { AddTaskModal } from "./AddTaskModal";

interface Column {
  _id: Id<"columns">;
  boardId: Id<"boards">;
  name: string;
  order: number;
  userId: Id<"users">;
}

interface Task {
  _id: Id<"tasks">;
  columnId: Id<"columns">;
  boardId: Id<"boards">;
  title: string;
  description?: string;
  order: number;
  priority: "low" | "medium" | "high";
  userId: Id<"users">;
  createdAt: number;
}

interface KanbanBoardProps {
  boardId: Id<"boards">;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const board = useQuery(api.boards.get, { id: boardId });
  const columns = useQuery(api.columns.listByBoard, { boardId });
  const tasks = useQuery(api.tasks.listByBoard, { boardId });
  const createColumn = useMutation(api.columns.create);
  const deleteColumn = useMutation(api.columns.remove);
  const moveTask = useMutation(api.tasks.moveToColumn);

  const [addingToColumn, setAddingToColumn] = useState<Id<"columns"> | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<Id<"tasks"> | null>(null);

  if (board === undefined || columns === undefined || tasks === undefined) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="font-mono text-lg uppercase animate-pulse">
          LOADING BOARD<span className="animate-ping">_</span>
        </div>
      </div>
    );
  }

  if (board === null) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="border-4 border-red-600 bg-red-100 p-8 font-mono text-center">
          <p className="text-xl uppercase font-bold">ERROR: BOARD NOT FOUND</p>
        </div>
      </div>
    );
  }

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    await createColumn({ boardId, name: newColumnName.trim().toUpperCase() });
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  const handleDeleteColumn = async (columnId: Id<"columns">) => {
    if (confirm("DELETE THIS COLUMN? ALL TASKS WILL BE LOST.")) {
      await deleteColumn({ id: columnId });
    }
  };

  const handleDragStart = (taskId: Id<"tasks">) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId: Id<"columns">) => {
    if (draggedTaskId) {
      await moveTask({ id: draggedTaskId, columnId });
      setDraggedTaskId(null);
    }
  };

  const getTasksForColumn = (columnId: Id<"columns">) => {
    return tasks.filter((t: Task) => t.columnId === columnId);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b-4 border-black bg-white px-4 py-3 md:px-6 md:py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-mono text-xl md:text-3xl font-bold uppercase truncate">
              {board.name}
            </h2>
            <p className="font-mono text-xs text-gray-600">
              // {columns.length} COLUMNS · {tasks.length} TASKS
            </p>
          </div>
          <button
            onClick={() => setIsAddingColumn(true)}
            className="border-2 md:border-4 border-black bg-yellow-400 px-3 py-1.5 md:px-4 md:py-2 font-mono text-xs uppercase font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex-shrink-0"
          >
            + COLUMN
          </button>
        </div>
      </div>

      {isAddingColumn && (
        <div className="border-b-4 border-black bg-[#f5f5f0] px-4 py-4 md:px-6">
          <form onSubmit={handleAddColumn} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="COLUMN NAME"
              className="flex-1 border-4 border-black p-2 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-white uppercase"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none border-4 border-black bg-black text-white px-4 py-2 font-mono text-xs uppercase font-bold hover:bg-green-500 transition-colors"
              >
                ADD
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnName("");
                }}
                className="flex-1 sm:flex-none border-4 border-black px-4 py-2 font-mono text-xs uppercase font-bold hover:bg-red-500 hover:text-white transition-colors"
              >
                X
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6">
        <div className="flex gap-4 md:gap-6 h-full min-w-max">
          {columns.map((column: Column, index: number) => {
            const columnTasks = getTasksForColumn(column._id);
            return (
              <div
                key={column._id}
                className="w-72 md:w-80 flex-shrink-0 flex flex-col bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column._id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="border-b-4 border-black p-3 md:p-4 flex items-center justify-between bg-black text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs opacity-60">
                      [{String(index + 1).padStart(2, "0")}]
                    </span>
                    <h3 className="font-mono text-sm md:text-base font-bold uppercase truncate">
                      {column.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="font-mono text-xs bg-yellow-400 text-black px-2 py-0.5">
                      {columnTasks.length}
                    </span>
                    <button
                      onClick={() => handleDeleteColumn(column._id)}
                      className="font-mono text-xs hover:text-red-400 transition-colors p-1"
                      title="Delete column"
                    >
                      X
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-[#f5f5f0]">
                  {columnTasks.map((task: Task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDragStart={() => handleDragStart(task._id)}
                    />
                  ))}

                  <button
                    onClick={() => setAddingToColumn(column._id)}
                    className="w-full border-4 border-dashed border-black p-3 font-mono text-xs uppercase hover:bg-black hover:text-white hover:border-solid transition-all"
                  >
                    + ADD TASK
                  </button>
                </div>
              </div>
            );
          })}

          {columns.length === 0 && (
            <div className="flex items-center justify-center w-full">
              <div className="border-4 border-dashed border-black p-8 md:p-12 text-center bg-white max-w-md">
                <div className="font-mono text-4xl md:text-6xl mb-4">||</div>
                <p className="font-mono text-lg md:text-xl uppercase font-bold">NO COLUMNS</p>
                <p className="font-mono text-xs md:text-sm text-gray-600 mt-2">
                  // ADD YOUR FIRST COLUMN TO START
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {addingToColumn && (
        <AddTaskModal
          boardId={boardId}
          columnId={addingToColumn}
          onClose={() => setAddingToColumn(null)}
        />
      )}
    </div>
  );
}
