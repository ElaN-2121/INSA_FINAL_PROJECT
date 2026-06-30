export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to access this portal.</p>
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Return to Login
        </a>
      </div>
    </div>
  );
}
