#!/bin/bash

# Script automatizado para configurar sistema de email
# Execute: chmod +x setup_email_automated.sh && ./setup_email_automated.sh

echo "🚀 Configurando Sistema de Email - SeniorityEval"
echo "================================================"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale o npm primeiro."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Instalar Supabase CLI se não estiver instalado
if ! command -v supabase &> /dev/null; then
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
else
    echo "✅ Supabase CLI já instalado: $(supabase --version)"
fi

echo ""
echo "🔧 Próximos passos manuais:"
echo "=========================="
echo ""
echo "1. 📧 Criar conta no Resend:"
echo "   - Vá para https://resend.com"
echo "   - Crie uma conta gratuita"
echo "   - Obtenha sua API Key (formato: re_xxxxxxxxxx)"
echo ""
echo "2. 🔐 Fazer login no Supabase:"
echo "   - Vá para https://supabase.com"
echo "   - Account > Access Tokens > Generate new token"
echo "   - Execute: supabase login"
echo ""
echo "3. 🌐 Linkar projeto:"
echo "   - Execute: supabase link --project-ref SEU_PROJECT_ID"
echo "   - Substitua SEU_PROJECT_ID pelo ID do seu projeto"
echo ""
echo "4. 🔑 Configurar secrets:"
echo "   - Execute: supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx"
echo "   - Execute: supabase secrets set FRONTEND_URL=http://localhost:5173"
echo ""
echo "5. 🚀 Deploy da função:"
echo "   - Execute: supabase functions deploy send_pdi_email"
echo ""
echo "6. 🧪 Testar:"
echo "   - Execute o script setup_email_trigger_simple.sql no Supabase"
echo "   - Teste criando uma avaliação no sistema"
echo ""
echo "📖 Para instruções detalhadas, consulte: GUIA_RESEND_DEPLOY.md"
echo ""
echo "🎯 Script de configuração concluído!"
