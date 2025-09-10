export function Features() {
  const features = [
    {
      title: 'Monitoramento em Tempo Real',
      description: 'Acompanhe indicadores de segurança em tempo real com dashboards interativos.',
      icon: '📊',
    },
    {
      title: 'Relatórios Automáticos',
      description: 'Gere relatórios detalhados automaticamente para compliance e auditoria.',
      icon: '📋',
    },
    {
      title: 'Alertas Inteligentes',
      description: 'Receba notificações instantâneas sobre situações de risco ou não conformidades.',
      icon: '🚨',
    },
    {
      title: 'Gestão de Treinamentos',
      description: 'Organize e acompanhe treinamentos de segurança para todos os colaboradores.',
      icon: '🎓',
    },
    {
      title: 'Análise de Riscos',
      description: 'Identifique e avalie riscos potenciais com ferramentas avançadas de análise.',
      icon: '🔍',
    },
    {
      title: 'Mobile First',
      description: 'Acesse todas as funcionalidades através do seu dispositivo móvel.',
      icon: '📱',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recursos Principais
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tudo que você precisa para uma gestão eficiente de segurança no trabalho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

