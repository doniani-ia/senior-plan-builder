# 📧 Sistema de Email - Vendas Pro - PDI

## 🎯 **Item E - Envio de Email (Resend + Edge Function)**

Este documento contém todas as instruções para configurar o sistema de email automático que envia PDIs para colaboradores e gestores.

## 📋 **O que foi implementado:**

### ✅ **Edge Function (`send_pdi_email`)**
- Função Deno para envio de emails via Resend
- Template HTML profissional para colaborador e gestor
- Integração com Supabase para buscar dados do PDI
- Tratamento de erros e logs

### ✅ **Trigger de Banco de Dados**
- Trigger simplificado para registrar criação de PDI
- Função `handle_pdi_created()` para logs
- Envio de email feito via frontend após criação do PDI

### ✅ **Templates de Email**
- **Email para Colaborador**: Resumo da avaliação + link para PDI
- **Email para Gestor**: Notificação de PDI criado + detalhes

## 🚀 **Passos para Configuração:**

### **1. Configurar Resend**
```bash
# 1. Criar conta em resend.com
# 2. Obter API Key (formato: re_xxxxxxxxxx)
# 3. Verificar domínio ou usar domínio de teste
```

### **2. Configurar Supabase**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
supabase secrets set FRONTEND_URL=http://localhost:5173
```

### **3. Deploy da Edge Function**
```bash
# Deploy da função
supabase functions deploy send_pdi_email

# Verificar status
supabase functions list
```

### **4. Configurar Trigger**
```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: setup_email_trigger_simple.sql
```

### **5. Testar Sistema**
```sql
-- Execute para verificar configuração
-- Arquivo: test_email_function.sql
```

## 📁 **Arquivos Criados:**

```
senior-plan-builder/
├── supabase/
│   └── functions/
│       └── send_pdi_email/
│           └── index.ts                    # Edge Function
├── setup_email_trigger.sql                 # Trigger de email
├── test_email_function.sql                 # Script de teste
├── setup_resend_config.md                  # Guia Resend
└── EMAIL_SETUP_README.md                   # Este arquivo
```

## 🔧 **Configuração via Dashboard (Alternativa)**

Se preferir usar o dashboard do Supabase:

1. **Edge Functions > Environment Variables**
   - `RESEND_API_KEY = re_xxxxxxxxxx`
   - `FRONTEND_URL = http://localhost:5173`

2. **SQL Editor > Execute `setup_email_trigger.sql`**

## 📧 **Estrutura dos Emails:**

### **Email para Colaborador:**
- 🎨 Design profissional com gradiente
- 📊 Resumo da avaliação (nível, pontuação, data)
- 📝 Observações do gestor (se houver)
- 🔗 Link para visualizar PDI completo
- 📞 Contato do gestor

### **Email para Gestor:**
- ✅ Notificação de sucesso
- 👤 Detalhes do colaborador
- 📈 Nível e pontuação
- 🔗 Link para plataforma
- 📅 Data de criação

## 🧪 **Como Testar:**

### **Teste Automático:**
1. Faça login como gestor
2. Vá para "Avaliar Colaborador"
3. Preencha uma avaliação
4. Salve a avaliação
5. Verifique se os emails foram enviados

### **Teste Manual:**
```sql
-- Execute no SQL Editor
SELECT net.http_post(
  url := 'https://' || current_setting('request.headers')['x-forwarded-host'] || '/functions/v1/send_pdi_email',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || current_setting('request.headers')['authorization']
  ),
  body := jsonb_build_object('pdi_id', 'SEU_PDI_ID_AQUI')
);
```

## 🔍 **Monitoramento:**

### **Resend Dashboard:**
- 📊 Estatísticas de envio
- 📈 Taxa de entrega
- ❌ Emails rejeitados

### **Supabase Logs:**
- 🔍 Logs da Edge Function
- ⚠️ Erros de execução
- 📝 Histórico de chamadas

## 🚨 **Troubleshooting:**

### **Erro: "RESEND_API_KEY not configured"**
```bash
# Verificar se está configurado
supabase secrets list

# Reconfigurar se necessário
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
```

### **Erro: "Failed to send email"**
- ✅ Verificar API key do Resend
- ✅ Confirmar domínio verificado
- ✅ Verificar emails no banco de dados

### **Emails não chegando**
- 📧 Verificar pasta de spam
- 🔍 Verificar logs da Edge Function
- 🌐 Testar com domínio verificado

## 🎉 **Status do Projeto:**

### ✅ **Itens Concluídos:**
- **Item A**: Setup do projeto + Supabase + RBAC
- **Item B**: CRUD de questionário e perguntas
- **Item C**: Formulário de avaliação
- **Item D**: Geração do PDI
- **Item E**: Sistema de email (✅ NOVO!)

### 🏆 **Projeto 100% Completo!**

O sistema Vendas Pro - PDI está agora completamente funcional com:
- ✅ Autenticação e autorização
- ✅ Gestão de questionários
- ✅ Avaliações de senioridade
- ✅ Geração automática de PDIs
- ✅ Sistema de email profissional

## 📞 **Suporte:**

Para dúvidas ou problemas:
1. Verifique os logs da Edge Function
2. Consulte o dashboard do Resend
3. Execute os scripts de teste
4. Verifique a configuração de secrets

---

**🎯 Sistema de Email implementado com sucesso!**
