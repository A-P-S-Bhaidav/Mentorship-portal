import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const payload = await request.json();
    
    // Cal.com webhook payloads have a 'triggerEvent' and 'payload' object
    const { triggerEvent, payload: eventData } = payload;
    
    if (!triggerEvent || !eventData) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Extract relevant data
    const title = eventData.title;
    const scheduledAt = eventData.startTime;
    const durationMinutes = eventData.length || 60;
    const meetingUrl = eventData.videoCallUrl || '';
    const attendees = eventData.attendees || [];
    
    // We need to identify the mentor and startup based on emails
    // Cal.com includes attendees. We can look up profiles by email.
    const emails = attendees.map(a => a.email);
    if (eventData.organizer?.email) {
      emails.push(eventData.organizer.email);
    }
    
    // Find matching profiles in our database
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, role')
      .in('email', emails);
      
    if (!profiles || profiles.length < 2) {
      return NextResponse.json({ message: 'Could not match both mentor and startup to this event.' }, { status: 200 });
    }
    
    const mentor = profiles.find(p => p.role === 'mentor');
    const startup = profiles.find(p => p.role === 'startup');
    
    if (!mentor || !startup) {
      return NextResponse.json({ message: 'Event does not contain both a registered mentor and startup.' }, { status: 200 });
    }

    // Determine status based on trigger event
    let status = 'scheduled';
    if (triggerEvent === 'BOOKING_CANCELLED') status = 'cancelled';
    if (triggerEvent === 'BOOKING_RESCHEDULED') status = 'scheduled';

    // Insert or update meeting record
    // Using a composite key or just inserting. For simplicity, we'll insert a new record for new bookings.
    // If it's a cancellation, we ideally update, but Cal.com gives us a uid. Let's just insert/update based on scheduled time.
    
    if (triggerEvent === 'BOOKING_CREATED') {
      await supabase.from('meetings').insert({
        mentor_id: mentor.id,
        startup_id: startup.id,
        title: title,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        status: status,
        meeting_url: meetingUrl
      });
    } else {
      // Try to update existing meeting
      await supabase.from('meetings')
        .update({ status: status })
        .eq('mentor_id', mentor.id)
        .eq('startup_id', startup.id)
        .eq('scheduled_at', scheduledAt);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
