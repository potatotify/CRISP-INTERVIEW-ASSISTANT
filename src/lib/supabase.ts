import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)


// Test function
export async function testConnection() {
  const { data, error } = await supabase.from('candidates').select('count')
  console.log('Supabase connection:', { data, error })
}