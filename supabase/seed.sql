-- Follow-Up Desk — demo seed data (optional)
-- Inserts six demo leads for the FIRST user in auth.users. Sign up once first,
-- then run this in the Supabase SQL editor (or via `supabase db reset`).
-- Dates are relative to today so the dashboard shows fresh/overdue/stale leads.

do $$
declare
  uid uuid;
begin
  select id into uid from auth.users order by created_at limit 1;
  if uid is null then
    raise notice 'No auth user found — create an account first, then re-run this seed.';
    return;
  end if;

  insert into public.leads
    (user_id, name, company, email, phone, status, source, deal_value, notes, last_contact_date, next_follow_up_date)
  values
    (uid, 'Amara Okafor', 'Clarity Coaching Co.', 'amara@claritycoaching.co', '+1 415 555 0142',
     'Proposal sent', 'Referral', 6000,
     'Wants a 12-week leadership package. Sent proposal, awaiting sign-off.',
     (current_date - 4), (current_date - 1)),
    (uid, 'Diego Santos', 'Brightwave Marketing', 'diego@brightwave.io', '+1 212 555 0190',
     'Contacted', 'Website', 9500,
     'Interested in a retainer for paid social. Asked to reconnect this week.',
     (current_date - 3), current_date),
    (uid, 'Helen Marsh', 'Northpeak Consulting', 'helen@northpeak.com', '+1 303 555 0177',
     'Waiting', 'Event', 12000,
     'Met at the ops summit. Went quiet after the first call.',
     (current_date - 21), (current_date - 7)),
    (uid, 'Marcus Rivera', 'Rivera Studio', 'marcus@riverastudio.design', null,
     'New', 'Inbound', 3500,
     'Filled out the contact form asking about brand strategy coaching.',
     null, current_date),
    (uid, 'Priya Nair', 'Summit Wellness', 'priya@summitwellness.co', '+1 646 555 0123',
     'Won', 'Referral', 8000,
     'Signed the 6-month engagement. Kickoff scheduled.',
     (current_date - 5), null),
    (uid, 'Tom Becker', 'Fairlane Partners', 'tom@fairlane.partners', '+1 718 555 0166',
     'Lost', 'Cold outreach', 5000,
     'Chose an in-house hire. Open to revisiting next year.',
     (current_date - 25), null);
end $$;
