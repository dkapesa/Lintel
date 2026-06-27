import Link from "next/link";

export default function Home() {
  return (
    <main className="entry-page">
      <div className="entry-card">
        <span className="eyebrow">LINTEL</span>
        <h1>Merge with confidence.</h1>
        <p>Turn pull request details and a pasted diff into a local merge-readiness report.</p>
        <Link className="primary-button" href="/new">
          Audit a PR <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
