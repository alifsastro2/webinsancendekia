const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, nama, email, role, kelas_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'role',
    (NEW.raw_user_meta_data->>'kelas_id')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

async function main() {
  console.log('=== Attempt 1: rpc("exec") ===')
  try {
    const { data, error } = await supabase.rpc('exec', { sql })
    console.log('Result:', { data, error })
    if (!error) return console.log('\n✅ SUCCESS via rpc("exec")')
  } catch (e) { console.log('Failed:', e.message) }

  console.log('\n=== Attempt 2: rpc("exec_sql") ===')
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql })
    console.log('Result:', { data, error })
    if (!error) return console.log('\n✅ SUCCESS via rpc("exec_sql")')
  } catch (e) { console.log('Failed:', e.message) }

  console.log('\n=== Attempt 3: REST API with service role key (PostgREST raw) ===')
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'params=object'
      },
      body: JSON.stringify({ query: sql })
    })
    console.log('Status:', res.status)
    const text = await res.text()
    console.log('Response:', text.substring(0, 200))
  } catch (e) { console.log('Failed:', e.message) }

  console.log('\n=== Attempt 4: Direct fetch as PostgREST RPC ===')
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql })
    })
    console.log('Status:', res.status)
    const text = await res.text()
    console.log('Response:', text.substring(0, 200))
  } catch (e) { console.log('Failed:', e.message) }

  console.log('\n❌ All approaches failed.')
}

main()
