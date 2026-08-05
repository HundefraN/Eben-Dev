import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://syjpexvehquuzutewrbf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5anBleHZlaHF1dXp1dGV3cmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4OTMyMTYsImV4cCI6MjEwMTQ2OTIxNn0.pFciKq1I-nSxvBDJI0ZUYor537upXGfwiBsfM0DADto';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
