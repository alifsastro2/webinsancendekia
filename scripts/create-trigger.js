import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  console.log('Creating trigger for auto-sync users...\n')

  // First, create the function
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.users (id, email, nama, username, role, kelas_id, is_active)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'siswa'),
        (NEW.raw_user_meta_data->>'kelas_id')::UUID,
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        kelas_id = EXCLUDED.kelas_id,
        updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `

  const { error: funcError } = await supabase.rpc('exec', { sql: createFunctionSQL })

  // Use direct SQL instead
  const { error } = await supabase.query(createFunctionSQL)

  if (error) {
    console.log('Function SQL:', error)
  }

  console.log('Creating trigger...')

  // Create trigger
  const createTriggerSQL = `
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `

  console.log('SQL to run manually:')
  console.log('='.repeat(50))
  console.log(createFunctionSQL)
  console.log('='.repeat(50))
  console.log(createTriggerSQL)
}

main()
