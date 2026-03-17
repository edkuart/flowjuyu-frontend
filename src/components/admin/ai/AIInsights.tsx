"use client";

import { useEffect, useState } from "react";

type Insights = {
  productsTotal: number;
  productsWithoutImages: number;
  productsWithoutViews: number;
  sellersTotal: number;
  inactiveSellers: number;
  sellersWithoutProducts: number;
  productViews: number;
  purchaseIntentions: number;
  reviews: number;
};

export default function AIInsights() {
  const [data, setData] = useState<Insights | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai/run", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent: "analytics",
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        try {
          const parsed = JSON.parse(res.output);
          setData(parsed);
        } catch {
          console.warn("Cannot parse analytics output");
        }
      });
  }, []);

  if (!data) {
    return (
      <div className="bg-card border rounded-lg p-4">
        Loading marketplace insights...
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">

      <h2 className="font-semibold text-lg">
        Marketplace Insights
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">

        <div>
          <p className="font-medium">Products</p>
          <p>Total: {data.productsTotal}</p>
          <p>No images: {data.productsWithoutImages}</p>
          <p>No views: {data.productsWithoutViews}</p>
        </div>

        <div>
          <p className="font-medium">Sellers</p>
          <p>Total: {data.sellersTotal}</p>
          <p>Inactive: {data.inactiveSellers}</p>
          <p>No products: {data.sellersWithoutProducts}</p>
        </div>

        <div>
          <p className="font-medium">Engagement</p>
          <p>Views: {data.productViews}</p>
          <p>Intentions: {data.purchaseIntentions}</p>
          <p>Reviews: {data.reviews}</p>
        </div>

      </div>
    </div>
  );
}