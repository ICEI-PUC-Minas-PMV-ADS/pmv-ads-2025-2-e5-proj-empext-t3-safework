import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Página não encontrada
        </h2>
        
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe.
        </p>

        <div className="space-y-3">
          <Link 
            href="/dashboard/home"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </Link>
          
          <Link 
            href="/"
            className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    </div>
  )
}
