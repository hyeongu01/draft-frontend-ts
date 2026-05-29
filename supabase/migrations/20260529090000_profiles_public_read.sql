-- 닉네임 공개 읽기
-- 기존 정책은 본인 프로필만 SELECT 허용이라, 피드·상세에서 타인 닉네임이 안 보였음.
-- profiles는 닉네임·아바타만 담고 닉네임은 공개 전제이므로 전체 읽기 허용.
create policy "닉네임은 누구나 읽기"
  on public.profiles for select
  using (true);
