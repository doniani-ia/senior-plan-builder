# Configuração do Resend para Sistema de Email

## 📧 **Passo 1: Criar conta no Resend**

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu domínio ou use o domínio de teste do Resend

## 🔑 **Passo 2: Obter API Key**

1. No dashboard do Resend, vá para "API Keys"
2. Clique em "Create API Key"
3. Copie a chave gerada (formato: `re_xxxxxxxxxx`)

## ⚙️ **Passo 3: Configurar no Supabase**

### Via Dashboard do Supabase:

1. Acesse o projeto no Supabase Dashboard
2. Vá para **Settings > Edge Functions**
3. Clique em **Environment Variables**
4. Adicione as seguintes variáveis:

```
RESEND_API_KEY = re_xxxxxxxxxx (sua chave do Resend)
FRONTEND_URL = http://localhost:5173 (URL do seu frontend)
```

### Via CLI do Supabase:

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Fazer login
supabase login

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
supabase secrets set FRONTEND_URL=http://localhost:5173
```

## 🚀 **Passo 4: Deploy da Edge Function**

```bash
# Deploy da função
supabase functions deploy send_pdi_email

# Verificar status
supabase functions list
```

## 🧪 **Passo 5: Testar**

1. Execute o script `setup_email_trigger.sql` no Supabase
2. Crie uma avaliação e gere um PDI
3. Verifique se os emails foram enviados

## 📋 **Estrutura dos Emails**

### Email para Colaborador:
- ✅ Resumo da avaliação
- ✅ Nível e pontuação
- ✅ Link para visualizar PDI completo
- ✅ Contato do gestor

### Email para Gestor:
- ✅ Notificação de PDI criado
- ✅ Detalhes do colaborador
- ✅ Link para visualizar na plataforma

## 🔧 **Troubleshooting**

### Erro: "RESEND_API_KEY not configured"
- Verifique se a variável de ambiente está configurada
- Reinicie a Edge Function após configurar

### Erro: "Failed to send email"
- Verifique se a API key do Resend está correta
- Confirme se o domínio está verificado no Resend

### Emails não chegando
- Verifique a pasta de spam
- Confirme se os emails estão corretos no banco
- Teste com domínio verificado no Resend

## 📊 **Monitoramento**

- Use o dashboard do Resend para monitorar envios
- Verifique logs da Edge Function no Supabase
- Configure webhooks se necessário para tracking avançado
