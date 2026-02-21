"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SellerPage() {
  const router = useRouter();
  const { ready, user } = useAuth();

  useEffect(() => {
    if (!ready) return;

    if (user?.rol === "seller") {
      router.replace("/seller/my-business");
    }
  }, [ready, user, router]);

  return null;
}