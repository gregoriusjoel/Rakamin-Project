import React, { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Home() {
  return (
    <React.Fragment>
      <Suspense fallback={null}>
        <HomeClient />
      </Suspense>
    </React.Fragment>
  );
}
