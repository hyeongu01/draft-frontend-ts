import Link from "next/link";
import { type JSX } from "react";

const REASONS: Record<string, { title: string; description: string }> = {
  oauth_failed: {
    title: "로그인에 실패했어요",
    description: "인증 과정에서 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
  },
  no_code: {
    title: "잘못된 접근이에요",
    description: "인증 코드 없이 이 페이지에 접근할 수 없어요.",
  },
  no_user: {
    title: "사용자 정보를 찾을 수 없어요",
    description: "세션은 만들어졌지만 사용자 정보를 가져오지 못했어요.",
  },
  signup_failed: {
    title: "가입에 실패했어요",
    description: "잠시 후 다시 시도해 주세요.",
  },
};

const DEFAULT = {
  title: "문제가 발생했어요",
  description: "알 수 없는 오류가 발생했어요. 다시 시도해 주세요.",
};

type PageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function ErrorPage({
  searchParams,
}: PageProps): Promise<JSX.Element> {
  const { reason } = await searchParams;
  const { title, description } = REASONS[reason ?? ""] ?? DEFAULT;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm space-y-10 text-center">
        <div className="space-y-2">
          <div className="text-3xl font-bold tracking-tight text-gray-900">
            drafted
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-6xl">😵</div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        <Link
          href="/login"
          className="block w-full py-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white transition-colors"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
