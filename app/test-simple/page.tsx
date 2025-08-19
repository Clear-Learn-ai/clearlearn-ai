export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">✅ Test Page Working</h1>
        <p className="text-gray-600 mb-4">
          This is a simple test page to verify the Next.js app is working correctly.
        </p>
        <div className="text-sm text-gray-500">
          Server is running at: http://localhost:3000
        </div>
      </div>
    </div>
  )
}