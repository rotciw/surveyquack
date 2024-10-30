import { Link } from "@remix-run/react";
import { Logo } from "./Logo";

interface HeaderProps {
  user?: { id: string };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
            {user && (
              <nav className="ml-10 flex space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Create Survey
                </Link>
              </nav>
            )}
          </div>
          <div>
            {user ? (
              <form action="/logout" method="post">
                <button
                  type="submit"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 