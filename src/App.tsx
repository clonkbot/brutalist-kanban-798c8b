import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { BoardList } from "./components/BoardList";
import { KanbanBoard } from "./components/KanbanBoard";
import { Id } from "../convex/_generated/dataModel";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-4 border-black bg-black text-white p-4">
            <h1 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-tight">
              KANBAN_
            </h1>
            <p className="font-mono text-xs mt-1 opacity-70">
              {flow === "signIn" ? "// ACCESS TERMINAL" : "// NEW USER REGISTRATION"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="font-mono text-xs uppercase font-bold block mb-2">
                EMAIL_ADDRESS
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full border-4 border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-[#f5f5f0]"
                placeholder="user@domain.com"
              />
            </div>

            <div>
              <label className="font-mono text-xs uppercase font-bold block mb-2">
                PASSWORD
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full border-4 border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-[#f5f5f0]"
                placeholder="••••••••"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="border-4 border-red-600 bg-red-100 p-3 font-mono text-xs text-red-800">
                ERROR: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border-4 border-black bg-black text-white p-4 font-mono text-sm uppercase font-bold hover:bg-yellow-400 hover:text-black transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {loading ? "PROCESSING..." : flow === "signIn" ? ">> LOGIN" : ">> REGISTER"}
            </button>

            <div className="border-t-4 border-black pt-4">
              <button
                type="button"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="w-full font-mono text-xs uppercase hover:underline underline-offset-4"
              >
                {flow === "signIn" ? "// CREATE NEW ACCOUNT" : "// EXISTING USER LOGIN"}
              </button>
            </div>
          </form>
        </div>

        <button
          onClick={() => signIn("anonymous")}
          className="w-full mt-4 border-4 border-dashed border-black bg-transparent p-4 font-mono text-xs uppercase hover:bg-black hover:text-white transition-colors"
        >
          [ CONTINUE AS GUEST ]
        </button>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { signOut } = useAuthActions();
  const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setSelectedBoardId(null)}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-black flex items-center justify-center">
              <span className="text-white font-mono text-lg md:text-xl font-bold">K</span>
            </div>
            <h1 className="font-mono text-lg md:text-2xl font-bold uppercase tracking-tight hidden sm:block">
              KANBAN_BOARD
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {selectedBoardId && (
              <button
                onClick={() => setSelectedBoardId(null)}
                className="border-2 md:border-4 border-black px-3 py-1.5 md:px-4 md:py-2 font-mono text-xs uppercase font-bold hover:bg-black hover:text-white transition-colors"
              >
                &lt; BOARDS
              </button>
            )}
            <button
              onClick={() => signOut()}
              className="border-2 md:border-4 border-black bg-black text-white px-3 py-1.5 md:px-4 md:py-2 font-mono text-xs uppercase font-bold hover:bg-red-600 hover:border-red-600 transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {selectedBoardId ? (
          <KanbanBoard boardId={selectedBoardId} />
        ) : (
          <BoardList onSelectBoard={setSelectedBoardId} />
        )}
      </main>

      <footer className="border-t-4 border-black bg-white py-3 px-4">
        <p className="text-center font-mono text-xs text-gray-500">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="animate-pulse font-mono text-xl uppercase">
            LOADING<span className="animate-ping">_</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <AuthenticatedApp />;
}
