import { getSession } from '@/utils/sessions';
import Navbar from './Navbar';

export default async function Header() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Navbar user={user} />
      </div>
    </header>
  );
}
