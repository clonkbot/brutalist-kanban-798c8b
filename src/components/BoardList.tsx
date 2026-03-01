import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface Board {
  _id: Id<"boards">;
  name: string;
  userId: Id<"users">;
  createdAt: number;
}

interface BoardListProps {
  onSelectBoard: (boardId: Id<"boards">) => void;
}

export function BoardList({ onSelectBoard }: BoardListProps) {
  const boards = useQuery(api.boards.list);
  const createBoard = useMutation(api.boards.create);
  const deleteBoard = useMutation(api.boards.remove);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    await createBoard({ name: newBoardName.trim() });
    setNewBoardName("");
    setIsCreating(false);
  };

  const handleDelete = async (id: Id<"boards">, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("DELETE THIS BOARD? ALL TASKS WILL BE LOST.")) {
      await deleteBoard({ id });
    }
  };

  if (boards === undefined) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="font-mono text-lg uppercase animate-pulse">
          LOADING BOARDS<span className="animate-ping">_</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-mono text-2xl md:text-4xl font-bold uppercase">YOUR_BOARDS</h2>
          <p className="font-mono text-xs md:text-sm text-gray-600 mt-1">
            // SELECT A BOARD OR CREATE NEW
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="border-4 border-black bg-yellow-400 px-6 py-3 font-mono text-sm uppercase font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            + NEW BOARD
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-8 border-4 border-black bg-white p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <label className="font-mono text-xs uppercase font-bold block mb-2">
            BOARD_NAME
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="MY_PROJECT"
              className="flex-1 border-4 border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-[#f5f5f0]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none border-4 border-black bg-black text-white px-6 py-3 font-mono text-sm uppercase font-bold hover:bg-green-500 transition-colors"
              >
                CREATE
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewBoardName("");
                }}
                className="flex-1 sm:flex-none border-4 border-black px-6 py-3 font-mono text-sm uppercase font-bold hover:bg-red-500 hover:text-white transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </form>
      )}

      {boards.length === 0 ? (
        <div className="border-4 border-dashed border-black p-8 md:p-12 text-center bg-white">
          <div className="font-mono text-4xl md:text-6xl mb-4">[ ]</div>
          <p className="font-mono text-lg md:text-xl uppercase font-bold">NO BOARDS YET</p>
          <p className="font-mono text-xs md:text-sm text-gray-600 mt-2">
            // CREATE YOUR FIRST BOARD TO GET STARTED
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {boards.map((board: Board, index: number) => (
            <div
              key={board._id}
              onClick={() => onSelectBoard(board._id)}
              className="group border-4 border-black bg-white p-4 md:p-6 cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-gray-500 mb-1">
                    #{String(index + 1).padStart(3, "0")}
                  </div>
                  <h3 className="font-mono text-lg md:text-xl font-bold uppercase truncate group-hover:text-yellow-600 transition-colors">
                    {board.name}
                  </h3>
                  <p className="font-mono text-xs text-gray-500 mt-2">
                    {new Date(board.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(board._id, e)}
                  className="border-2 border-black p-2 font-mono text-xs hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Delete board"
                >
                  X
                </button>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-black flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 border-2 border-black animate-pulse"></div>
                <span className="font-mono text-xs uppercase">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
