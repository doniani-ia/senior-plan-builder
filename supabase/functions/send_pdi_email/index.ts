import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PDIData {
  id: string;
  avaliacao_id: string;
  colaborador_id: string;
  plano_html: string;
  created_at: string;
  avaliacao: {
    id: string;
    pontuacao_total: number;
    nivel_calculado: string;
    observacoes?: string;
    avaliado: {
      id: string;
      nome: string;
      email: string;
    };
    avaliador: {
      id: string;
      nome: string;
      email: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { pdi_id } = await req.json()

    if (!pdi_id) {
      throw new Error('PDI ID is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get PDI data with related information
    const { data: pdiData, error: pdiError } = await supabase
      .from('pdis')
      .select(`
        *,
        avaliacao:avaliacoes(
          id,
          pontuacao_total,
          nivel_calculado,
          observacoes,
          avaliado:profiles!avaliacoes_avaliado_id_fkey(id, nome, email),
          avaliador:profiles!avaliacoes_avaliador_id_fkey(id, nome, email)
        )
      `)
      .eq('id', pdi_id)
      .single()

    if (pdiError || !pdiData) {
      throw new Error(`Failed to fetch PDI data: ${pdiError?.message}`)
    }

    const pdi = pdiData as PDIData

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Prepare email data
    const colaborador = pdi.avaliacao.avaliado
    const gestor = pdi.avaliacao.avaliador
    const nivelDisplay = pdi.avaliacao.nivel_calculado === 'junior' ? 'Júnior' : 
                        pdi.avaliacao.nivel_calculado === 'pleno' ? 'Pleno' : 'Sênior'

    // Create email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PDI - ${colaborador.nome}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .summary {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #667eea;
            }
            .summary h3 {
              margin-top: 0;
              color: #667eea;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 15px;
            }
            .summary-item {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 5px;
            }
            .summary-item strong {
              color: #667eea;
            }
            .pdi-content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .btn {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
            }
            .btn:hover {
              background: #5a6fd8;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Plano de Desenvolvimento Individual</h1>
            <p>Seu PDI foi gerado com sucesso!</p>
          </div>
          
          <div class="content">
            <div class="summary">
              <h3>📊 Resumo da Avaliação</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <strong>Colaborador:</strong><br>
                  ${colaborador.nome}
                </div>
                <div class="summary-item">
                  <strong>Nível Atual:</strong><br>
                  ${nivelDisplay}
                </div>
                <div class="summary-item">
                  <strong>Pontuação:</strong><br>
                  ${pdi.avaliacao.pontuacao_total}/100
                </div>
                <div class="summary-item">
                  <strong>Data:</strong><br>
                  ${new Date(pdi.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              ${pdi.avaliacao.observacoes ? `
                <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                  <strong>Observações:</strong><br>
                  ${pdi.avaliacao.observacoes}
                </div>
              ` : ''}
            </div>

            <div class="pdi-content">
              <h3>🎯 Ações de Desenvolvimento</h3>
              <p>Seu PDI contém ações específicas para o seu nível de senioridade. Acesse a plataforma para visualizar o plano completo e começar seu desenvolvimento.</p>
              
              <a href="${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/pdis" class="btn">
                Ver PDI Completo
              </a>
            </div>

            <div class="footer">
              <p>Este email foi gerado automaticamente pelo sistema SeniorityEval.</p>
              <p>Para dúvidas, entre em contato com seu gestor: ${gestor.nome} (${gestor.email})</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to collaborator
    const collaboratorEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SeniorityEval <noreply@seniorityeval.com>',
        to: [colaborador.email],
        subject: `PDI Gerado - ${colaborador.nome}`,
        html: emailHTML,
      }),
    })

    if (!collaboratorEmailResponse.ok) {
      const errorData = await collaboratorEmailResponse.text()
      throw new Error(`Failed to send email to collaborator: ${errorData}`)
    }

    // Send notification email to manager
    const managerEmailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PDI Gerado - ${colaborador.nome}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .summary {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #28a745;
            }
            .btn {
              display: inline-block;
              background: #28a745;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ PDI Gerado com Sucesso</h1>
            <p>Um novo PDI foi criado para seu colaborador</p>
          </div>
          
          <div class="content">
            <div class="summary">
              <h3>📋 Detalhes do PDI</h3>
              <p><strong>Colaborador:</strong> ${colaborador.nome}</p>
              <p><strong>Nível:</strong> ${nivelDisplay}</p>
              <p><strong>Pontuação:</strong> ${pdi.avaliacao.pontuacao_total}/100</p>
              <p><strong>Data:</strong> ${new Date(pdi.created_at).toLocaleDateString('pt-BR')}</p>
            </div>

            <p>O PDI foi enviado automaticamente para ${colaborador.nome} e está disponível na plataforma.</p>
            
            <a href="${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/pdis" class="btn">
              Ver PDI na Plataforma
            </a>
          </div>
        </body>
      </html>
    `

    const managerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SeniorityEval <noreply@seniorityeval.com>',
        to: [gestor.email],
        subject: `PDI Gerado - ${colaborador.nome}`,
        html: managerEmailHTML,
      }),
    })

    if (!managerEmailResponse.ok) {
      const errorData = await managerEmailResponse.text()
      throw new Error(`Failed to send email to manager: ${errorData}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails sent successfully',
        pdi_id: pdi_id,
        sent_to: [colaborador.email, gestor.email]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send_pdi_email function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
