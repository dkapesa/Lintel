import { Suspense } from "react";
import styles from "../../r4f5-governance.module.css";
import ReviewPoliciesClient from "./review-policies-client";

function PoliciesLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.document}>
        <header className={styles.pageHeader}>
          <span className={styles.eyebrow}>Governance inspection</span>
          <h1>Review policies</h1>
          <p>Loading the bounded bundled policy definitions. Counts, selection and applicability remain withheld until the route state resolves.</p>
        </header>
        <div className={styles.boundaryBanner} role="status">
          <div>
            <strong>Loading policy records</strong>
            <p>No prior selected-policy detail is retained as current.</p>
          </div>
          <span className={styles.neutralBadge}>Checking</span>
        </div>
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={<PoliciesLoading />}>
      <ReviewPoliciesClient />
    </Suspense>
  );
}
