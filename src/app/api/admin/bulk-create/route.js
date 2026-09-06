import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { type, records } = body;

    if (!type || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    let successCount = 0;
    const errors = [];

    if (type === 'startup') {
      for (const record of records) {
        try {
          const { error } = await supabase
            .from('startups')
            .insert({
              startup_name: record.startup_name,
              founder_name: record.founder_name,
              sector: record.sector,
              stage: record.stage,
              pitch_deck_url: record.pitch_deck_url
            });

          if (error) {
            errors.push({ record, error: error.message });
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push({ record, error: err.message });
        }
      }
    } else if (type === 'mentor') {
      for (const record of records) {
        try {
          // In a real app we'd probably create a user or link to a profile,
          // but following instructions exactly: insert into mentors and profiles
          
          // Generate a dummy ID to link profile and mentor
          const dummyId = crypto.randomUUID();

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: dummyId,
              full_name: record.full_name,
              email: record.email,
              role: 'mentor'
            });

          if (profileError) {
            errors.push({ record, error: profileError.message });
            continue;
          }

          let expertiseArray = [];
          if (record.expertise) {
            expertiseArray = record.expertise.split(',').map(e => e.trim());
          }

          const { error: mentorError } = await supabase
            .from('mentors')
            .insert({
              id: dummyId,
              firm: record.firm,
              expertise: expertiseArray,
              calendly_link: record.calendly_link
            });

          if (mentorError) {
            errors.push({ record, error: mentorError.message });
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push({ record, error: err.message });
        }
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      successCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk create error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
