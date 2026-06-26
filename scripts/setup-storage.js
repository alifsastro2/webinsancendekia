import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setupStorage() {
  console.log('Setting up Supabase Storage...\n')

  // Create bucket using Storage API
  const { data, error } = await supabase.storage.createBucket('materi', {
    id: 'materi',
    name: 'materi',
    public: false, // Private bucket - need auth to access
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ],
    fileSizeLimit: 52428800 // 50MB
  })

  if (error) {
    console.error('Error creating bucket:', error)
  } else {
    console.log('✓ Bucket "materi" created:', data)
  }

  // Create RLS policies for the bucket
  console.log('\nCreating RLS policies for storage...')

  // Policy: Everyone authenticated can upload (guru only in practice due to app logic)
  const { error: policyError1 } = await supabase.rpc('create_policy_if_not_exists', {
    bucket_name: 'materi',
    policy_name: 'Guru can upload',
    cmd: 'INSERT',
    using_expr: 'true',
    check_expr: "auth.role() = 'authenticated'"
  }).catch(() => null)

  console.log('Note: Manual RLS setup may be needed via SQL')

  console.log('\n=== Next Steps ===')
  console.log('1. Create storage RLS policies manually (see below)')
  console.log('2. The bucket is created but needs RLS policies')
}

setupStorage()
