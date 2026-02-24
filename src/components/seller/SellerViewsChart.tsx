"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

type DayData = {
  date: string
  product_views: number
  profile_views: number
}

export default function SellerViewsChart({
  data,
}: {
  data: DayData[]
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-neutral-500">
        No hay datos suficientes aún.
      </div>
    )
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="product_views"
            stroke="#d97706"
            strokeWidth={2}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="profile_views"
            stroke="#374151"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
