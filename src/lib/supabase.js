import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ltveqoztaxzoxjykiszl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmVxb3p0YXh6b3hqeWtpc3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NzEyNDIsImV4cCI6MjEwNDI0NzI0Mn0.xCsfTFjnETdfpO0cVJFApuRI6o3E3ApjkyGbnWtRjLU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
