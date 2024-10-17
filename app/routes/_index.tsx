import React from "react";
import { Form, Link, MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Professional Surveys
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Design, distribute, and analyze surveys with ease
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Link
            to="/create"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4"
          >
          Create New Survey
        </Link>
        <Form action="/auth/google" method="post">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Login with Google
          </button>
        </Form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or explore features
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="text-center">
                <i className="fas fa-chart-bar text-2xl text-indigo-500"></i>
                <p className="mt-2 text-sm text-gray-500">Advanced Analytics</p>
              </div>
              <div className="text-center">
                <i className="fas fa-mobile-alt text-2xl text-indigo-500"></i>
                <p className="mt-2 text-sm text-gray-500">Mobile Friendly</p>
              </div>
              <div className="text-center">
                <i className="fas fa-lock text-2xl text-indigo-500"></i>
                <p className="mt-2 text-sm text-gray-500">Secure & Private</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}