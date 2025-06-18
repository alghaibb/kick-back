import { getSession } from '@/utils/sessions';
import Navbar from './Navbar';

export default async function Header() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className="py-4">
      <div className="mx-auto max-w-7xl px-4">
        <Navbar user={user} />
      </div>
    </header>
  );
}
