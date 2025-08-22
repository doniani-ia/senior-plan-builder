import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge Function create-user iniciada')
    console.log('Headers:', Object.fromEntries(req.headers.entries()))
    
    // Create a Supabase client with the Auth context of the function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Supabase URL:', supabaseUrl)
    console.log('Service Role Key exists:', !!serviceRoleKey)
    
    const supabaseClient = createClient(
      supabaseUrl ?? '',
      serviceRoleKey ?? ''
    )

    const body = await req.json()
    console.log('Body recebido:', body)
    
    const { nome, email, senha, papel, gestor_id } = body

    // Validate required fields
    console.log('Validando campos:', { nome, email, papel })
    if (!nome || !email || !papel) {
      console.log('Campos obrigatórios não preenchidos')
      return new Response(
        JSON.stringify({ error: 'Nome, email e papel são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user in Supabase Auth
    console.log('Criando usuário na autenticação...')
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: senha || 'senha123',
      email_confirm: true,
      user_metadata: {
        full_name: nome.trim()
      }
    })

    console.log('Resposta da criação de usuário:', { authData, authError })

    if (authError) {
      console.error('Erro na autenticação:', authError)
      return new Response(
        JSON.stringify({ error: `Erro na autenticação: ${authError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Falha ao criar usuário na autenticação' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create profile in profiles table
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        papel: papel,
        gestor_id: gestor_id || null
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      // Try to delete the auth user if profile creation fails
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      
      return new Response(
        JSON.stringify({ error: 'Erro ao criar perfil do usuário' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user,
        message: 'Usuário criado com sucesso'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
