import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen bg-[#f7f2e8] lg:grid-cols-[minmax(22rem,0.85fr)_minmax(28rem,1.15fr)]">
      <section className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Sweetside
          </p>
          <h1 className="mt-6 max-w-xl text-7xl uppercase leading-[0.88] xl:text-8xl">
            Keep the site in tune.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-white/65">
            Update shows, videos, and photos from one simple workspace.
          </p>
        </div>
        <p className="relative text-sm text-white/40">Sweetside website manager</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Sweetside
            </p>
            <h1 className="mt-3 text-5xl uppercase leading-none text-ink-900">
              Website manager
            </h1>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-[0_24px_80px_rgba(37,28,24,0.10)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Welcome back
            </p>
            <h2 className="mt-3 text-5xl uppercase leading-none text-ink-900">
              Log in
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              Enter your details to manage the website.
            </p>
            <div className="mt-8"><AdminLoginForm /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
