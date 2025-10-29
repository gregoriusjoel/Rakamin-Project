import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./HomeClient"), { ssr: false });

export default function Home() {
  return (
    <React.Fragment>
      <Suspense fallback={null}>
        <HomeClient />
      </Suspense>
    </React.Fragment>
  );
}
