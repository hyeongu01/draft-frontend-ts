---
name: sync-swagger
description: 백엔드 NestJS의 OpenAPI 문서를 호출해 api/swagger.json으로 동기화한다. 사용자가 "swagger 동기화", "스웨거 갱신", "API 문서 업데이트", "sync swagger" 등을 요청하거나, 프론트 작업 전 계약을 최신화해야 할 때 사용.
allowed-tools: PowerShell(pnpm gen:api) Bash(git diff:*) Bash(git show:*) Bash(git status:*)
---

# sync-swagger

로컬에서 돌고 있는 백엔드(NestJS)의 OpenAPI(Swagger) JSON을 가져와 이 레포의 단일 진실 출처 파일 `api/swagger.json`에 저장한다.

## 전제

- 백엔드가 로컬에서 실행 중이어야 한다.
- **JSON 엔드포인트: `http://localhost:4000/docs`** (이 프로젝트 백엔드가 `/docs`에서 OpenAPI JSON을 직접 반환하도록 설정됨).
- 베이스 URL은 `NEXT_PUBLIC_API_URL`(`.env.local`)과 동일한 `http://localhost:4000`.

## 절차

1. `api/` 디렉터리가 없으면 만든다. 기존 `api/swagger.json`이 있으면 diff용으로 둔다(git이 추적).
2. 백엔드 OpenAPI JSON을 가져와 보기 좋게 저장한다:

```powershell
# PowerShell
$url = "http://localhost:4000/docs"
$out = "api/swagger.json"
New-Item -ItemType Directory -Force api | Out-Null
try {
  $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
  $json = $r.Content | ConvertFrom-Json          # 유효 JSON 검증
  $json | ConvertTo-Json -Depth 100 | Out-File -FilePath $out -Encoding utf8
  Write-Host "OK: $url -> $out"
} catch {
  Write-Host "실패: 백엔드(:4000)가 떠 있는지, /docs가 JSON을 반환하는지 확인하세요. $_"
}
```

3. **코드 재생성**: swagger.json이 바뀌었으면 곧바로 orval로 타입 + TanStack Query 훅을 재생성한다.

```powershell
pnpm gen:api    # orval --config orval.config.ts → src/lib/api/generated/
```

4. 저장에 성공하면, **이전 버전과의 diff를 요약**해 사용자에게 보고한다:
   - 추가/삭제/변경된 엔드포인트(path + method)
   - 변경된 요청/응답 스키마, nullable·타입 변화
   - 재생성된 훅/타입(`src/lib/api/generated/`)이 기존 사용처에 주는 영향 (시그니처·타입 변경)
   `git diff -- api/swagger.json` 및 `git diff -- src/lib/api/generated`로 확인한다.

5. 시니어 프론트 관점에서 **계약 개선이 필요한 점**(누락 필드, 비효율 응답, 봉투 불일치, 네이밍 모호성 등)이 보이면 "왜 + 제안 스키마"를 갖춰 사용자에게 요청한다. 임의로 코드에서 우회하지 않는다.
   - 특히 응답에 **content 스키마가 없으면 생성 훅의 반환 타입이 `void`** 가 된다. 이런 엔드포인트는 응답 DTO를 swagger에 명시해달라고 요청한다.

## 주의

- `api/swagger.json`은 **단일 진실 출처**다. 손으로 편집하지 말고 항상 이 스킬(또는 사용자 직접 교체)로만 갱신한다.
- 동기화 후 프론트 타입·API 래퍼가 어긋나면, swagger에 맞춰 코드를 고치거나(또는) 계약 변경을 사용자에게 요청한다.
- `/docs`가 HTML(Swagger UI)을 돌려주면(JSON이 아니면) 백엔드 설정이 바뀐 것 — 보통 `/docs-json`이 JSON이므로 사용자에게 확인 요청.
