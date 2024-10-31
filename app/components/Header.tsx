import { Link, useLocation } from "@remix-run/react";
import { Form } from "@remix-run/react";

interface HeaderProps {
  user?: {
    avatar_url?: string;
    name?: string;
    email?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkStyles = (path: string) => {
    return isActive(path)
      ? "bg-orange-50 text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium";
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl text-orange-500 font-bold">🦆</span>
              <span className="ml-2 text-gray-900 font-semibold">DuckSurveys</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex space-x-2">
              <Link
                to="/dashboard"
                className={getLinkStyles('/dashboard')}
              >
                Dashboard
              </Link>
              <Link
                to="/create"
                className={getLinkStyles('/create')}
              >
                Create Survey
              </Link>
            </nav>
          </div>

          {/* Right side - User menu */}
          {user ? (
            <div className="flex items-center">
              <div className="relative ml-3">
              <div className="flex items-center">
                {user?.avatar_url ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar_url}
                    alt="User avatar"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-medium">
                      {user?.email?.[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden md:block ml-2 text-sm text-gray-700">
                  {user?.email}
                </span>
                <Form action="/auth/logout" method="post" className="ml-4">
                  <button
                    type="submit"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign out
                  </button>
                </Form>
              </div>
              </div>
            </div>
          ) : (
            <Form action="/auth/google" method="post">
              <button
                type="submit"
            className="text-gray-600 hover:text-gray-900"
          >
            Sign In with Google
          </button>
            </Form>
          )}
        </div>
      </div>
    </header>
  );
} 