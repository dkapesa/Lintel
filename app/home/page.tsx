import { Suspense } from "react";
import OperationalHomeClient from "./home-client";

export default function OperationalHomePage() {
  return (
    <Suspense fallback={null}>
      <OperationalHomeClient />
    </Suspense>
  );
}
