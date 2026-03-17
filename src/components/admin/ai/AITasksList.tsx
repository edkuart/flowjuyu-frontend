"use client";

import { useEffect, useState } from "react";

export default function AITasksList() {
  const [tasks, setTasks] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/ai/tasks", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks || []));
  }, []);

  return (
    <div className="bg-card border rounded-lg p-4">

      <h2 className="font-semibold mb-4">
        AI Tasks
      </h2>

      <ul className="space-y-2">

        {tasks.map((t) => (
          <li key={t} className="text-sm">
            {t}
          </li>
        ))}

      </ul>
    </div>
  );
}