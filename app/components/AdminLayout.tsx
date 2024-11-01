import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link, useLocation } from "@remix-run/react";

interface AdminLayoutProps {
  survey: {
    id: string;
    title: string;
  };
  sidebar: ReactNode;
  content: ReactNode;
}

export function AdminLayout({ survey, sidebar, content }: AdminLayoutProps) {
  const location = useLocation();
  const isStatsPage = location.pathname.endsWith('/stats');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">{survey.title}</h1>
            <div className="flex space-x-4">
              <Link
                to={`/survey/${survey.id}/stats`}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isStatsPage 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Statistics
              </Link>
              <Link
                to={`/survey/${survey.id}/manage`}
                className={`px-4 py-2 rounded-md transition-colors ${
                  !isStatsPage 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Edit Survey
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white shadow-lg min-h-[calc(100vh-64px)] p-6"
        >
          {sidebar}
        </motion.div>
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 p-8"
        >
          {content}
        </motion.main>
      </div>
    </div>
  );
} 