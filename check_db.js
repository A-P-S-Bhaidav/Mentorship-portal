require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: mentors } = await supabase.from('mentors').select('id, firm, role_type, cal_link');
  console.log("Mentors:");
  console.log(mentors);
  
  const { data: assignments } = await supabase.from('assignments').select('*');
  console.log("Assignments:");
  console.log(assignments);
}

check();
