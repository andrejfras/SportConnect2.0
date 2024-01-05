import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmpnbkpbrrwijlxuyrwl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcG5ia3BicnJ3aWpseHV5cndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzY3NTU0MiwiZXhwIjoyMDE5MjUxNTQyfQ.oZJXo-jHKQv7t7vy-_LRcqXVMXf7ExXtvHi4UxtCUtc';

// Create a single instance of the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;