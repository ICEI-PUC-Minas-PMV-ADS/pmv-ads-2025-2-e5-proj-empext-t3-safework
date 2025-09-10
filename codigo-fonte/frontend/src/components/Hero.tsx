export function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bem-vindo ao{' '}
            <span className="text-yellow-300">SafeWork</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            A plataforma completa para gestão de segurança no trabalho. 
            Monitore, analise e melhore a segurança da sua empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Começar Gratuitamente
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Ver Demonstração
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

