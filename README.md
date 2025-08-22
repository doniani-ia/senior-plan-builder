# Vendas Pro - PDI

Sistema completo de Avaliação de Senioridade e PDI (Plano de Desenvolvimento Individual) para equipes de vendas.

## 🚀 Quick Start

### Desenvolvimento Local

Para trabalhar localmente, clone este repositório e execute:

```sh
# Step 1: Clone the repository
git clone https://github.com/doniani-ia/senior-plan-builder.git

# Step 2: Navigate to the project directory
cd senior-plan-builder

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

### Tecnologias Utilizadas

Este projeto é construído com:

- **Frontend**: React 18, TypeScript, Vite
- **UI/UX**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- **Email**: Resend API
- **Deploy**: Vercel, Netlify ou similar

### Funcionalidades Principais

- ✅ **Autenticação e Autorização**: Sistema completo de login com roles (admin, gestor, colaborador)
- ✅ **Gestão de Questionários**: CRUD completo para questionários e perguntas
- ✅ **Avaliação de Colaboradores**: Formulários dinâmicos com cálculo automático de pontuação
- ✅ **Geração de PDI**: Criação automática de planos de desenvolvimento individual
- ✅ **Sistema de Email**: Envio automático de PDIs via Resend
- ✅ **Dashboard Completo**: Interface moderna para gestores e colaboradores

### Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Custom hooks
├── integrations/  # Integrações (Supabase)
└── lib/          # Utilitários
```

### Deploy

Para fazer deploy:

1. Configure as variáveis de ambiente do Supabase
2. Configure o Resend para emails
3. Deploy em Vercel, Netlify ou similar

### Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request
