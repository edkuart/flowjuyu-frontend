"use client";

import { useEffect, useState } from "react";

export default function AIReportsList() {
  const [reports, setReports] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/ai/reports", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []));
  }, []);

  return (
    <div className="bg-card border rounded-lg p-4">

      <h2 className="font-semibold mb-4">
        AI Reports
      </h2>

      <ul className="space-y-2">

        {reports.map((r) => (
          <li key={r} className="text-sm">
            {r}
          </li>
        ))}

      </ul>
    </div>
  );
}