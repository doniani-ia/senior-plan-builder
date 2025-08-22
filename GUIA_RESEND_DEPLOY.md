# 📧 Guia Completo: Resend + Deploy Edge Function

## 🎯 **Passo 1: Criar conta no Resend**

### 1.1 Acesse o Resend
- Vá para [resend.com](https://resend.com)
- Clique em "Get Started" ou "Sign Up"

### 1.2 Criar conta
- Use seu email
- Crie uma senha
- Confirme sua conta

### 1.3 Verificar domínio (OPCIONAL)
- No dashboard, vá em "Domains"
- Você pode usar o domínio de teste do Resend: `onboarding@resend.dev`
- Ou verificar seu próprio domínio se quiser

---

## 🔑 **Passo 2: Obter API Key**

### 2.1 Acessar API Keys
- No dashboard do Resend, clique em "API Keys" no menu lateral

### 2.2 Criar nova API Key
- Clique em "Create API Key"
- Dê um nome como "Vendas Pro - PDI"
- Clique em "Create"

### 2.3 Copiar a chave
- A chave aparecerá no formato: `re_xxxxxxxxxx`
- **IMPORTANTE**: Copie e guarde essa chave! Ela só aparece uma vez.

---

## ⚙️ **Passo 3: Instalar Supabase CLI**

### 3.1 Verificar se já tem Node.js
```bash
node --version
npm --version
```

### 3.2 Instalar Supabase CLI
```bash
npm install -g supabase
```

### 3.3 Verificar instalação
```bash
supabase --version
```

---

## 🔐 **Passo 4: Fazer Login no Supabase**

### 4.1 Acessar token de acesso
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Vá para "Account" > "Access Tokens"
- Clique em "Generate new token"
- Copie o token

### 4.2 Fazer login via CLI
```bash
supabase login
```
- Cole o token quando solicitado

---

## 🌐 **Passo 5: Configurar Projeto**

### 5.1 Inicializar projeto (se necessário)
```bash
# No diretório do projeto
supabase init
```

### 5.2 Linkar com projeto existente
```bash
supabase link --project-ref SEU_PROJECT_ID
```
- Substitua `SEU_PROJECT_ID` pelo ID do seu projeto no Supabase
- O ID aparece na URL do dashboard: `https://supabase.com/dashboard/project/SEU_PROJECT_ID`

---

## 🔧 **Passo 6: Configurar Secrets**

### 6.1 Configurar RESEND_API_KEY
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
```
- Substitua `re_xxxxxxxxxx` pela sua chave do Resend

### 6.2 Configurar FRONTEND_URL
```bash
supabase secrets set FRONTEND_URL=http://localhost:5173
```

### 6.3 Verificar secrets configurados
```bash
supabase secrets list
```

---

## 🚀 **Passo 7: Deploy da Edge Function**

### 7.1 Verificar estrutura
```bash
ls supabase/functions/
```
- Deve mostrar: `send_pdi_email`

### 7.2 Fazer deploy
```bash
supabase functions deploy send_pdi_email
```

### 7.3 Verificar status
```bash
supabase functions list
```

---

## 🧪 **Passo 8: Testar**

### 8.1 Executar trigger no Supabase
- Vá para o SQL Editor do Supabase
- Execute o arquivo `setup_email_trigger_simple.sql`

### 8.2 Testar no sistema
- Faça login como gestor
- Vá para "Avaliar Colaborador"
- Preencha uma avaliação
- Salve e verifique se o email foi enviado

---

## 🔍 **Troubleshooting**

### Erro: "Project not found"
```bash
# Verificar se está linkado corretamente
supabase status

# Relinkar se necessário
supabase link --project-ref SEU_PROJECT_ID
```

### Erro: "Function not found"
```bash
# Verificar se a função existe
ls supabase/functions/

# Se não existir, criar
mkdir -p supabase/functions/send_pdi_email
```

### Erro: "RESEND_API_KEY not configured"
```bash
# Verificar secrets
supabase secrets list

# Reconfigurar se necessário
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
```

### Erro: "Failed to send email"
- Verificar se a API key do Resend está correta
- Verificar se o domínio está configurado no Resend
- Verificar logs da Edge Function

---

## 📊 **Verificar Funcionamento**

### 1. Logs da Edge Function
```bash
supabase functions logs send_pdi_email
```

### 2. Dashboard do Resend
- Vá para [resend.com](https://resend.com)
- Clique em "Activity" para ver emails enviados

### 3. Teste manual
```bash
# Testar função diretamente
curl -X POST 'https://SEU_PROJECT_ID.supabase.co/functions/v1/send_pdi_email' \
  -H 'Authorization: Bearer SEU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"pdi_id": "SEU_PDI_ID"}'
```

---

## 🎉 **Sucesso!**

Se tudo funcionou:
- ✅ Resend configurado
- ✅ Edge Function deployada
- ✅ Emails sendo enviados automaticamente
- ✅ Sistema 100% funcional

---

## 📞 **Precisa de Ajuda?**

Se encontrar problemas:
1. Verifique os logs: `supabase functions logs send_pdi_email`
2. Confirme a API key do Resend
3. Verifique se o projeto está linkado corretamente
4. Teste com o domínio de teste do Resend primeiro
