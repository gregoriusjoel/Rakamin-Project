"use client";

import React from "react";
import AppRouter from "../api/AppRouter";
import { useSearchParams } from "next/navigation";

export default function HomeClient() {
  const params = useSearchParams();
  const initial = params?.get("initial") as
    | "login"
    | "register"
    | "dashboard"
    | null;

  return <AppRouter initialPage={initial ?? undefined} />;
}
