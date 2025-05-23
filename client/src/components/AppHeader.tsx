import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function AppHeader() {
  const currentPage = () => {
    const location = useLocation();
    const path = location.pathname.split("/")[1];
    return path;
  };

  const isAuthed = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <header className="flex flex-col items-center justify-center">
      <Link to="/boards" className="flex items-center gap-2">
        <h1 className="text-2xl font-bold italic tracking-tighter text-purple-200 text-shadow-[2px_2px_0px_rgb(173_70_255_/_1)]">
          PCB Wizard 3000&trade;
        </h1>
      </Link>
      {isAuthed() && (
        <>
          <nav className="flex flex-row items-center gap-4">
            <Link
              to="/boards"
              className={`p-2 font-bold ${
                currentPage() === "boards"
                  ? "text-purple-500 border-b-2 border-amber-300 hover:text-purple-400"
                  : "hover:text-purple-400"
              }`}
            >
              My Boards
            </Link>
            <Link
              to="/upload"
              className={`p-2 font-bold ${
                currentPage() === "upload"
                  ? "text-purple-500 border-b-2 border-amber-300 hover:text-purple-400"
                  : "hover:text-purple-400"
              }`}
            >
              Upload
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/auth";
              }}
              className="p-2 font-bold hover:text-purple-400 cursor-pointer"
            >
              Logout
            </button>
          </nav>
        </>
      )}
    </header>
  );
}
