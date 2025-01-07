import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="p-4">
      <h1>Dashboard</h1>
      <p>Welcome {session.user.email}</p>
    </div>
  );
}
