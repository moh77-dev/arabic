-- Storage buckets for user-recorded audio and generated TTS audio.

insert into storage.buckets (id, name, public)
values
  ('pronunciation-recordings', 'pronunciation-recordings', false),
  ('tts-cache', 'tts-cache', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Users can only manage recordings inside a folder named after their own uid:
-- pronunciation-recordings/{auth.uid()}/...
create policy "own pronunciation recordings rw"
  on storage.objects for all
  using (bucket_id = 'pronunciation-recordings' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'pronunciation-recordings' and auth.uid()::text = (storage.foldername(name))[1]);

-- TTS cache is generated server-side (service role) and readable by anyone signed in.
create policy "tts cache readable by authenticated"
  on storage.objects for select
  using (bucket_id = 'tts-cache');

create policy "own avatar rw"
  on storage.objects for all
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars readable by authenticated"
  on storage.objects for select
  using (bucket_id = 'avatars');
