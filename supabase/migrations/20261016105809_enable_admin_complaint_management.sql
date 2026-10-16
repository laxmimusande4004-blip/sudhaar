GRANT UPDATE (status, updated_at)
ON public.complaints
TO authenticated;

GRANT INSERT (
  complaint_id,
  actor_id,
  status,
  note,
  proof_path
)
ON public.complaint_updates
TO authenticated;