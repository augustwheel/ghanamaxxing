-- "It's live" emails to the person who submitted a listing. A scheduled job looks for approved listings that haven't been
-- emailed yet, so it works however a listing gets approved (the admin page or the Supabase table editor).

alter table ghanamaxxing.launch_submissions
  add column approval_email_sent_at timestamptz;

-- Everything already approved counts as done, so turning this on emails nobody out of the blue.
update ghanamaxxing.launch_submissions s
set approval_email_sent_at = now()
from ghanamaxxing.launches l
where l.id = s.launch_id and l.status = 'approved';

create index launch_submissions_approval_email_idx on ghanamaxxing.launch_submissions (launch_id)
  where approval_email_sent_at is null;
