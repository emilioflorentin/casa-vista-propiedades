import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzkawijtocphmvrpoqfl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6a2F3aWp0b2NwaG12cnBvcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjQyOTUsImV4cCI6MjA2Nzk0MDI5NX0.2JnthwZ_Ph9wVCe3emdj3HIGaQHLutOoQft6qEEs3TM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});