import { redirect } from "next/navigation";

export const ensureStatic = "navigation";

export default function ContactPage() {
  redirect("/#contact");
}
