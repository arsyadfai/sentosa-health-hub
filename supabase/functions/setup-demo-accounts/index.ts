import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DemoAccount {
  email: string
  password: string
  nama: string
  role: 'admin' | 'dokter' | 'kasir'
}

const demoAccounts: DemoAccount[] = [
  { email: 'admin@sentosa.id', password: 'admin123', nama: 'Administrator', role: 'admin' },
  { email: 'dokter@sentosa.id', password: 'dokter123', nama: 'Dr. Budi Santoso', role: 'dokter' },
  { email: 'kasir@sentosa.id', password: 'kasir123', nama: 'Siti Rahayu', role: 'kasir' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const results = []

    for (const account of demoAccounts) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === account.email)

      let userId: string

      if (existingUser) {
        userId = existingUser.id
        results.push({ email: account.email, status: 'exists', userId })
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: { nama: account.nama }
        })

        if (createError) {
          results.push({ email: account.email, status: 'error', error: createError.message })
          continue
        }

        userId = newUser.user.id
        results.push({ email: account.email, status: 'created', userId })
      }

      // Update profile name
      await supabaseAdmin
        .from('profiles')
        .upsert({ user_id: userId, nama: account.nama }, { onConflict: 'user_id' })

      // Assign role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: userId, role: account.role }, { onConflict: 'user_id,role' })

      if (roleError) {
        results.push({ email: account.email, roleError: roleError.message })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
