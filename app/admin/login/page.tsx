import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(177,74,41,0.12),_transparent_50%),linear-gradient(180deg,_#f8f4ec_0%,_#f2eadf_100%)] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.5rem] border border-black/10 bg-paper shadow-[0_24px_80px_rgba(37,28,24,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-accent px-8 py-10 text-paper sm:px-12 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-paper/70">
              Sweetside
            </p>
            <h1 className="mt-4 font-display text-6xl uppercase leading-none">
              Admin Access
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-paper/80">
              Manage upcoming and past shows, attach PNG posters, and push the
              updated show list into SQLite when you are ready to sync.
            </p>
          </div>
          <div className="px-8 py-10 sm:px-12 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Secure Login
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase text-ink-900">
              One admin account
            </h2>
            <div className="mt-8">
              <AdminLoginForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
