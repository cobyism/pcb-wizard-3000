import React, { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | undefined>();
  const navigate = useNavigate();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const files = fileRef.current?.files;
    if (!files || files.length < 1) return setErr("No file");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string);
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "/api/boards",
          { json },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        navigate(`/boards/${res.data.id}`);
      } catch (e: any) {
        setErr(e.message || "Invalid JSON");
      }
    };
    reader.readAsText(files[0]);
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Upload a new board</h2>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-bold mb-2">
            Select your board JSON file to upload
          </label>
          <input
            type="file"
            accept=".json"
            ref={fileRef}
            required
            className="border border-gray-600 rounded-md p-2 mb-4 file:mr-2 file:py-1 file:px-3 file:border-[1px] file:text-xs file:font-medium file:bg-stone-50 file:text-stone-700 file:rounded-md"
          />
        </div>
        <button
          type="submit"
          className="text-white cursor-pointer uppercase focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 bg-purple-600 hover:bg-purple-700 focus:ring-purple-900"
        >
          Upload
        </button>
      </form>
      <div className="text-sm text-slate-300 mb-2">
        <p className="mb-2">
          The JSON file should contain the following structure:
        </p>
        <pre className="bg-slate-900 p-4 rounded-md text-xs">
          {`{
  "name": "Valid Basic Board",
  "components": [
    { "name": "R1", "pins": ["1", "2"] },
    { "name": "C1", "pins": ["A", "B", "IN", "OUT"] }
  ],
  "nets": [
    { "name": "GND", "pins": ["R1.1", "C1.A"] },
    { "name": "VCC", "pins": ["R1.2"] }
  ]
}
`}
        </pre>
      </div>
      {err && <div className="text-red-500">{err}</div>}
    </div>
  );
}
