import { Suspense } from "react";
import { connection } from "next/server";
import Dashboard from "../dashboard";

async function DashboardContent() {
  await connection();
  return <Dashboard />;
}

export default function Page() {
  return (
    <Suspense fallback={<main className="page-loading">Menyiapkan dashboard...</main>}>
      <DashboardContent />
    </Suspense>
  );
}
