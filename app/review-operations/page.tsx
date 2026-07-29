import { Suspense } from "react";
import ReviewOperationsClient from "./review-operations-client";

export default function ReviewOperationsPage() {
  return (
    <Suspense fallback={null}>
      <ReviewOperationsClient />
    </Suspense>
  );
}
