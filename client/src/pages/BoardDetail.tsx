import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BoardGraph from "../components/BoardGraph";
import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem("token");

  const { data, isLoading, error } = useQuery({
    queryKey: ["board", id],
    queryFn: async () => {
      const res = await axios.get(`/api/boards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error loading board</div>;
  if (!data) return <div>Not found</div>;

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h5 className="text-sm text-gray-500">Board name</h5>
        <h2 className="text-2xl font-bold">{data.json.name}</h2>
      </section>
      <section>
        <h5 className="text-sm text-gray-500">Validation results</h5>
        {data.validation.length === 0 ? (
          <>
            <div className="text-green-400">No issues found 🎉</div>
          </>
        ) : (
          <ul>
            {data.validation.map((err: string, i: number) => (
              <li key={i} className="text-red-400 list-disc ml-4 list-inside">
                {err}
              </li>
            ))}
          </ul>
        )}
      </section>
      {data.validation.length === 0 && (
        <section>
          <h5 className="text-sm text-gray-500">Visualization</h5>
          <Canvas
            flat
            camera={{ position: [0, 0, 100], far: 8000 }}
            style={{ height: "500px", width: "100%" }}
            className="w-full border-1 border-gray-600 rounded-md"
          >
            <TrackballControls />
            <ambientLight />
            <color attach="background" args={["#111"]} />
            <directionalLight position={[0, 0, 5]} />
            <BoardGraph board={data.json} />
          </Canvas>
        </section>
      )}

      <section>
        <h5 className="text-sm text-gray-500">Raw Board Data</h5>
        <pre className="overflow-x-auto bg-gray-900 text-white p-4 rounded-md">
          {JSON.stringify(data.json, null, 2)}
        </pre>
      </section>
    </div>
  );
}
