export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
        <p className="text-gray-600">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}
