import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";

export default function BoardsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/boards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error loading boards</div>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">My Boards</h2>
      <Link
        to="/upload"
        className="text-white bg-purple-700 uppercase hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
      >
        Upload new board
      </Link>
      <ul className="flex flex-col gap-2">
        {data.map((board: any) => (
          <li key={board.id}>
            <Link
              to={`/boards/${board.id}`}
              className="flex flex-col p-4 border border-gray-600 rounded-md hover:bg-gray-700"
            >
              <h3 className="text-lg font-bold">{board.name}</h3>
              <span className="text-sm text-gray-500">
                {new Date(board.createdAt).toLocaleString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
