"use client";

import { useState } from "react";

export default function AIAgentRunner() {
  const [loading, setLoading] = useState(false);

  const runAgent = async (agent: string) => {
    setLoading(true);

    await fetch("/api/admin/ai/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent }),
      credentials: "include",
    });

    setLoading(false);
  };

  return (
    <div className="bg-card border rounded-lg p-4">

      <h2 className="font-semibold mb-4">
        Run AI Agent
      </h2>

      <div className="flex gap-3 flex-wrap">

        <button
          onClick={() => runAgent("analytics")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Run Analytics
        </button>

        <button
          onClick={() => runAgent("growth")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Run Growth
        </button>

        <button
          onClick={() => runAgent("cycle")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Run Daily Cycle
        </button>

      </div>
    </div>
  );
}