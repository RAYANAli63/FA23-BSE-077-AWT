import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
        Welcome to <span className="text-blue-500">AdFlow Pro</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        The ultimate full-stack sponsored listing marketplace. Connect with clients, manage ads efficiently, and grow your platform.
      </p>
      <div className="flex gap-4">
        <Link href="/explore" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Explore Ads
        </Link>
        <Link href="/login" className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
          Get Started
        </Link>
      </div>
    </div>
  );
}
