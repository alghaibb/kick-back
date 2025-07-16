import { getSession } from "@/lib/sessions";
import Navbar from "./Navbar";

export default async function Header() {
  const session = await getSession();

  return <Navbar user={session?.user ?? null} />;
}
