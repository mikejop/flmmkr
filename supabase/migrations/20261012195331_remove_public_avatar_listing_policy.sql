-- Public buckets serve files by URL and do not need an anonymous SELECT policy
-- on storage.objects. Removing this policy prevents listing every avatar object.
drop policy if exists "Public Access Avatars" on storage.objects;
