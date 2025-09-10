# SafeWork Frontend

Este é o frontend do projeto SafeWork, uma aplicação para gestão de segurança no trabalho.

## Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **ESLint** - Linter para JavaScript/TypeScript

## Estrutura do Projeto

```
src/
├── app/                 # App Router do Next.js
│   ├── globals.css     # Estilos globais com Tailwind
│   ├── layout.tsx      # Layout raiz da aplicação
│   └── page.tsx        # Página inicial
├── components/         # Componentes reutilizáveis
│   ├── Header.tsx      # Cabeçalho da aplicação
│   ├── Hero.tsx        # Seção hero da página inicial
│   └── Features.tsx    # Seção de recursos
└── lib/               # Utilitários e configurações
```

## Como Executar

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter ESLint

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# URL da API do backend SafeWork
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Tailwind CSS

O Tailwind CSS está configurado com:
- Arquivo de configuração: `tailwind.config.js`
- PostCSS: `postcss.config.js`
- Estilos globais: `src/app/globals.css`

### TypeScript

- Configuração: `tsconfig.json`
- Path mapping configurado para `@/*` apontar para `src/*`

### ESLint

- Configuração: `.eslintrc.json`
- Usa as regras do Next.js Core Web Vitals

## Desenvolvimento

Para adicionar novos componentes:

1. Crie o arquivo em `src/components/`
2. Use TypeScript para tipagem
3. Aplique classes do Tailwind CSS para estilização
4. Exporte o componente como default ou named export

## Deploy

O projeto está configurado para deploy em plataformas como Vercel, Netlify ou qualquer servidor Node.js.

Para build de produção:
```bash
npm run build
npm run start
```

