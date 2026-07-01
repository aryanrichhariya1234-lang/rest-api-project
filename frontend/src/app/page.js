import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Scalable REST API — Auth &amp; RBAC Demo
      </h1>
      <p className="text-gray-600 max-w-xl mx-auto mb-8">
        Test the backend&apos;s JWT authentication, role-based access control, and
        Products CRUD API from this simple frontend.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/register"
          className="bg-gray-900 text-white px-5 py-2.5 rounded-md hover:bg-gray-700"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="border border-gray-300 px-5 py-2.5 rounded-md hover:bg-gray-100"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
