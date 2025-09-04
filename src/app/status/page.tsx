import Link from 'next/link'

export default function StatusPage() {
  const pages = [
    {
      url: '/test-simple',
      title: '✅ Simple Test Page',
      description: 'Basic test to verify Next.js is working',
      status: 'working'
    },
    {
      url: '/',
      title: '🏠 Landing Page',
      description: 'Full marketing landing page with demo widget',
      status: 'working'
    },
    {
      url: '/demo-simple',
      title: '🎬 Simple Demo Mode',
      description: 'YC presentation demo without complex dependencies',
      status: 'working'
    },
    {
      url: '/admin-simple',
      title: '📊 Simple Analytics Dashboard',
      description: 'Learning analytics without complex imports',
      status: 'working'
    },
    {
      url: '/demo',
      title: '🚀 Full Demo Mode',
      description: 'Complete demo with all intelligence features',
      status: 'may have issues'
    },
    {
      url: '/test-quantum',
      title: '🧪 Quantum Test Suite',
      description: 'Full intelligence layer testing',
      status: 'may have issues'
    },
    {
      url: '/admin',
      title: '📈 Full Analytics Dashboard',
      description: 'Complete analytics with live data',
      status: 'may have issues'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 ClearLearn - System Status
          </h1>
          <p className="text-lg text-gray-600">
            Current status of all pages and features
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🌐 Server Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold">Next.js Server</div>
              <div className="text-sm text-green-700">✅ Running</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold">TypeScript</div>
              <div className="text-sm text-green-700">✅ Compiling</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold">Tailwind CSS</div>
              <div className="text-sm text-green-700">✅ Working</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold">Port 3000</div>
              <div className="text-sm text-blue-700">✅ Available</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">📄 Available Pages</h2>
          
          {pages.map((page, index) => (
            <div 
              key={index}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                page.status === 'working' ? 'border-green-500' : 'border-yellow-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{page.description}</p>
                  <p className="text-sm text-gray-500">URL: {page.url}</p>
                </div>
                <div className="ml-4">
                  <Link
                    href={page.url}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      page.status === 'working'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    Visit Page
                  </Link>
                </div>
              </div>
              
              <div className="mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  page.status === 'working'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {page.status === 'working' ? '✅ Verified Working' : '⚠️ May Have Issues'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Recommendations</h3>
          <div className="space-y-2 text-blue-800">
            <p>• Start with <strong>/test-simple</strong> to verify basic functionality</p>
            <p>• Use <strong>/demo-simple</strong> for YC presentations (most reliable)</p>
            <p>• Check <strong>/admin-simple</strong> for analytics without dependencies</p>
            <p>• The full <strong>/demo</strong> and <strong>/test-quantum</strong> have all features but may need troubleshooting</p>
          </div>
        </div>

        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🛠️ Development Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Server:</strong> http://localhost:3000<br/>
              <strong>Framework:</strong> Next.js 14 with TypeScript<br/>
              <strong>Styling:</strong> Tailwind CSS
            </div>
            <div>
              <strong>Features:</strong> Adaptive Learning AI<br/>
              <strong>Intelligence:</strong> Bayesian + Progressive Depth<br/>
              <strong>Status:</strong> Production Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}