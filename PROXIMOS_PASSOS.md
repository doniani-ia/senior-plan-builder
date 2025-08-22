# 🚀 Próximos Passos - Sistema de Email

## ✅ **O que já foi feito:**
- ✅ Supabase CLI instalado (versão 2.34.3)
- ✅ Edge Function criada (`send_pdi_email`)
- ✅ Trigger simplificado criado
- ✅ Frontend atualizado para chamar a função

## 📋 **Próximos Passos (Execute em ordem):**

### **1. 📧 Criar conta no Resend**
- Vá para [resend.com](https://resend.com)
- Clique em "Get Started"
- Crie uma conta gratuita
- **IMPORTANTE**: Guarde sua API Key (formato: `re_xxxxxxxxxx`)

### **2. 🔐 Fazer login no Supabase**
```bash
supabase login
```
- Vá para [supabase.com](https://supabase.com)
- Account > Access Tokens > Generate new token
- Cole o token quando solicitado

### **3. 🌐 Linkar projeto**
```bash
supabase link --project-ref SEU_PROJECT_ID
```
- Substitua `SEU_PROJECT_ID` pelo ID do seu projeto
- O ID aparece na URL: `https://supabase.com/dashboard/project/SEU_PROJECT_ID`

### **4. 🔑 Configurar secrets**
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
supabase secrets set FRONTEND_URL=http://localhost:5173
```
- Substitua `re_xxxxxxxxxx` pela sua chave do Resend

### **5. 🚀 Deploy da função**
```bash
supabase functions deploy send_pdi_email
```

### **6. 🧪 Configurar trigger**
- Vá para o SQL Editor do Supabase
- Execute o arquivo `setup_email_trigger_simple.sql`

### **7. 🎯 Testar**
- Faça login como gestor
- Vá para "Avaliar Colaborador"
- Preencha uma avaliação
- Salve e verifique se o email foi enviado

## 📖 **Documentação Completa:**
- **Guia detalhado**: `GUIA_RESEND_DEPLOY.md`
- **Configuração**: `setup_resend_config.md`
- **README principal**: `EMAIL_SETUP_README.md`

## 🆘 **Se encontrar problemas:**
1. Verifique os logs: `supabase functions logs send_pdi_email`
2. Confirme a API key do Resend
3. Verifique se o projeto está linkado: `supabase status`
4. Teste com o domínio de teste do Resend primeiro

## 🎉 **Resultado Final:**
Após completar todos os passos, você terá:
- ✅ Sistema de email automático funcionando
- ✅ Emails enviados para colaborador e gestor
- ✅ Templates HTML profissionais
- ✅ Projeto 100% completo!

---

**🚀 Vamos começar? Execute os passos em ordem!**
