import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Delete all incident_history records
    const { error: historyError } = await supabase
      .from('incident_history')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // delete all rows

    if (historyError) {
      console.error('Error deleting history:', historyError)
      return new Response(JSON.stringify({ error: historyError.message }), { status: 500 })
    }

    console.log('History cleanup completed successfully')
    return new Response(JSON.stringify({ success: true, message: 'History cleaned up' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
