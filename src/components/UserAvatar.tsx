// 공용 아바타 — profileImageUrl 있으면 이미지, 없으면 닉네임 이니셜 폴백.
// R2 공개 도메인이 유동적이라 next/image(remotePatterns 필요) 대신 일반 <img> 사용.
// 아바타는 20~80px라 이미지 최적화 불필요. 서버/클라이언트 양쪽에서 사용 가능.
type Props = {
  src?: string | null;
  nickname?: string | null;
  // 크기·폰트는 사용처에서 지정 (예: "w-7 h-7 text-xs")
  className?: string;
};

export default function UserAvatar({ src, nickname, className = "" }: Props) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${nickname ?? "사용자"} 프로필 이미지`}
        className={`${className} rounded-full object-cover bg-gray-100 shrink-0`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${className} rounded-full bg-gray-100 text-gray-600 font-semibold flex items-center justify-center shrink-0`}
    >
      {nickname?.[0]?.toUpperCase() ?? "U"}
    </span>
  );
}
