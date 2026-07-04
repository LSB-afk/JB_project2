export const meta = {
  name: 'harness-audit',
  description: '08_본선 하네스 다차원 감사 — 파이프라인·데드파일·층위·정본/레퍼런스·git·에이전트 활용을 병렬 조사 후 교차검증',
  whenToUse: '사용자가 "하네스 점검"/"전체 감사"/"시스템 점검"을 요청할 때, 또는 제출·발표 마일스톤 D-1 등 정기 건강도 점검 시. 읽기 위주(git은 조회만) — 쓰기 작업은 별도 승인 후 진행.',
  phases: [
    { title: 'Audit', detail: '9개 차원 병렬 조사' },
    { title: 'Verify', detail: '차원별 핵심 수치 독립 재검증' },
  ],
}

// 이 스크립트는 Workflow 툴 전용이다(Claude Code 세션 안에서만 실행 가능).
// 단독 `node workflow.js`로는 못 돌린다 — Claude Code에서
//   Workflow({ scriptPath: '08_본선/_system/skills/harness-audit/workflow.js' })
// 로 호출한다. 세부 사용법은 SKILL.md 참조.

const FIND_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    summary: { type: 'string' },
    metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, value: { type: 'string' } },
        required: ['name', 'value'],
      },
    },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          issue: { type: 'string' },
          evidence: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['path', 'issue', 'evidence'],
      },
    },
    top_claims: {
      type: 'array',
      items: { type: 'string' },
      description: '가장 중요한 수치/사실 주장 3개, 독립 재검증용으로 그대로 인용',
    },
  },
  required: ['dimension', 'summary', 'metrics', 'findings', 'top_claims'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    claim_checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          verified: { type: 'boolean' },
          actual_evidence: { type: 'string' },
        },
        required: ['claim', 'verified', 'actual_evidence'],
      },
    },
    overall_confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    corrections: { type: 'string' },
  },
  required: ['dimension', 'claim_checks', 'overall_confidence', 'corrections'],
}

// 리포지토리 루트는 이 워크플로가 실행되는 프로젝트 워킹디렉토리로 가정한다.
// 각 프롬프트는 "무엇을, 어떻게 확인하라"만 지시하고 오늘 날짜의 구체적 숫자는
// 하드코딩하지 않는다 — 매 실행마다 그 시점의 실제 상태를 새로 조사해야 한다.
const DIMENSIONS = [
  {
    key: 'pipeline',
    label: '파이프라인 적합성',
    prompt: `저장소 루트에서 08_본선/_system/skills/ 아래 모든 스킬 폴더를 나열하라(find/ls로 직접 확인, 목록을 가정하지 말 것).

08_본선/AGENTS.md 의 "§4-A 자동 시행 스킬" 트리거 표와 08_본선/_system/tools/registry-skills.md의 "자체 구축 스킬" 목록을, 실제 skills/ 폴더 목록과 1:1 대조하라.

확인할 것:
1. skills/ 폴더 각각이 AGENTS.md §4-A 트리거 표에 실제로 언급되는가? (폴더는 있는데 문서에 없는 "고아 스킬")
2. AGENTS.md에 언급된 스킬 중 폴더/실행 스크립트가 없는 "유령 스킬"
3. 각 스킬 폴더 안에 실행 가능한 스크립트(.mjs/.js/.py/.sh)가 실제로 있는지, SKILL.md 문서만 있고 구현이 비어있는지
4. registry-skills.md가 선언하는 스킬 개수·목록이 실제 폴더와 일치하는지
5. harness-sync/sync.mjs 같은 오케스트레이터가 참조하는 하위 스크립트 경로가 실제로 존재하는지(하드코딩된 script 경로를 하나씩 resolve해서 existsSync 확인 — 가능하면 --dry-run으로 직접 실행해 SKIP/OK 여부까지 재현)
6. 각 스킬이 최근 실제로 실행된 흔적(텔레메트리·핵심로그에서 스킬명 검색)

grep/find/Read로 실제 파일을 열어 확인하라. 추측 금지, 정확한 개수(예: "N개 중 M개 정합")로 보고하라.`,
  },
  {
    key: 'deadfiles',
    label: '미사용 파일·컨텍스트 오염',
    prompt: `저장소에서 AI가 문서를 읽을 때 맥락을 혼동시킬 수 있는 "죽은/노이즈" 파일을 찾아라. 08_본선/ 과 최상위 폴더 전체를 대상으로 한다.

찾을 카테고리:
1. OS/동기화 아티팩트: .DS_Store, *.sync-conflict-*, .stversions 폴더 안 구버전 파일 — find로 개수 세고, 그중 git에 이미 커밋(tracked)된 것이 몇 개인지 git ls-files로 확인(.gitignore 규칙이 있어도 소급 적용 안 될 수 있음)
2. 빈 파일/플레이스홀더: 0바이트 .md, "무제"/untitled류 — find -size 0, 각각 git tracked 여부까지 확인
3. 고아 문서: 08_본선/_system/skills/canon-moc-sync/sync.mjs --dry-run을 직접 실행해 frontmatter 누락·죽은 링크·도달성(reachability) 결과를 그대로 보고 — **절대 직접 grep으로 링크 그래프를 재구현하지 말 것**(AGENTS.md가 경고하는 함정: NFC·이스케이프파이프·중복 basename 때문에 자체 스캐너는 반복적으로 오탐해왔다). canon-moc-sync 출력과 세션로그가 인용해온 과거 숫자가 다르면 어느 쪽이 최신인지 session-log.md의 가장 최근 검증 기록과 대조해 판단.
4. 중복 내용 문서: PLAN/PROGRESS/HANDOFF류 여러 문서가 같은 "지금 현황"을 중복 기술하는지, SSOT 안내가 있는지.
5. 날짜 라벨 모순: HANDOFF.md 등 세션 부팅 시 최우선으로 읽는 문서의 "지금 어디/D-N" 표기가 실제 오늘 날짜와 맞는지.

각 카테고리별 정확한 개수와 근거 경로를 제시하라.`,
  },
  {
    key: 'layering',
    label: '층위 정합성',
    prompt: `저장소의 폴더 넘버링 체계(예선 최상위 vs 08_본선 내부 넘버링)가 서로 어긋나거나 섞이는 곳이 있는지 점검하라.

확인할 것:
1. 파일명 중복: node_modules, _vendor, test-results, .git, .obsidian, .stversions 제외하고 전체 볼트에서 같은 basename(.md)이 2곳 이상 존재하는 케이스를 찾아라(find + xargs basename + sort + uniq -d). README.md/SKILL.md류 폴더-인덱스 관례는 위험 낮음으로 분류하되, diff로 실제 내용이 다른 "진짜 충돌" 쌍을 구분해서 보고하라.
2. 레이어 불일치 의심 문서: 본선(finals) 전용 최신 자료인데 예선 넘버링 폴더에 구버전이 남아있는 것, 그 반대의 경우. 특히 히어로 케이스 ID·에이전트 수 같은 핵심 식별자가 예선 SSOT(_canon.md)와 본선 정본 사이에서 다른 값을 쓰고 있는지 확인.
3. frontmatter 필수 필드(tags/date/up) 준수율을 08_본선/**/*.md 샘플링(각 하위폴더 10개 이상)으로 추정, 누락 파일 경로 예시.
4. 하위 폴더 번호(00_,01_,02_...) 체계가 상위/형제 폴더와 규칙이 다른지(0-based vs 1-based, 같은 번호를 파일과 폴더가 동시에 쓰는 등).

정확한 개수/비율과 근거 경로를 제시하라.`,
  },
  {
    key: 'canon_vs_reference',
    label: '레퍼런스 vs 정본 혼용',
    prompt: `"정본(canon)" 자료(최상위 _canon.md, 08_본선/_system/memory/, _체계/ 공식 안내문)와 "참고용/비정본" 자료(_vendor/ 등 gitignore된 외부 클론, 05_리서치/, 07_원천/ 원본)가 공존하는지 확인하고, 혼용 사례가 있는지 점검하라.

확인할 것:
1. gitignore된 _vendor/ 등 로컬 전용 클론을 마치 프로젝트 정본인 것처럼 위키링크나 "코드 SSOT" 문구로 인용하는 문서가 몇 개인지(grep으로 실제 개수 확인 — 리터럴하게 "SSOT/정본"이라 명시한 것과 단순 참조를 구분).
2. 끊어진 위키링크(존재하지 않는 노트를 가리키는 [[ ]])가 _vendor나 외부자료 관련해서 있는지.
3. 05_리서치/07_원천의 1차 자료 수치가 _canon.md를 거치지 않고 제출용 문서에 직접 쓰였는지, 최근 canon 정정 이력(git log -- _canon.md)이 있다면 그 정정이 다른 문서들에 전파됐는지(정정 전 값이 남아있는 문서 개수).
4. canon과 본선 정본 사이에 핵심 수치(연체율·시장규모·에이전트 수 등)가 서로 다른 값으로 동시에 존재하는지 — 특히 실제 제출 초안 문서에 그 불일치가 남아있으면 심각도 HIGH로 표시.

각 항목별 실제 인용 파일 → 대상 경로를 구체적으로 짚어 개수로 보고하라. 없으면 "없음"이라 명시하라.`,
  },
  {
    key: 'git_health',
    label: 'Git/커밋/푸시/PR 상태',
    prompt: `저장소의 git 상태를 읽기 전용으로 점검하라(절대 add/commit/push 등 쓰기 작업 금지).

확인할 것:
1. 모든 로컬 브랜치의 각 리모트(보통 origin=팀 공유, fork=개인) 대비 ahead/behind (git rev-list --left-right --count, git branch -vv로 교차검증).
2. git status --porcelain 총 변경 건수, 디렉터리별 분포, staged(index 반영) 비율 — staged 비율이 높으면 "병렬 세션이 이미 add해둔 파일을 실수로 함께 커밋할 위험"으로 플래그.
3. gh pr list 로 열린 PR과 mergeable/mergeStateStatus 확인. head 브랜치가 로컬/fork보다 몇 커밋 뒤처졌는지(오래된 스냅샷이면 지금 머지해도 최신 내용이 반영 안 됨을 명시).
4. .gitignore로 보호되어야 할 대외비 파일(원본 이메일·회의 원문·시연영상 등)이 git ls-files에 하나라도 걸리는지.
5. 최근 커밋 메시지 컨벤션 준수율과, 문서화된 커밋 규칙(collaboration-rules.md 등)이 실제 관행과 일치하는지.

정확한 숫자로 보고하고, 각 git 명령 결과를 근거로 제시하라.`,
  },
  {
    key: 'open_questions',
    label: '기타 열린 질문 (구조적 건강도)',
    prompt: `지금까지 다루지 않은 구조적 건강도 질문을 3~5개 스스로 떠올려 실제로 점검하라. 이 저장소는 마감이 있는 팀 협업 볼트이며 "Capture-by-default"(작업 후 04_증빙/01_핵심로그/에 기록) 규약과 병렬 세션 환경이라는 점을 감안하라.

점검 후보(판단해서 가장 구체적으로 확인 가능한 3~5개 선택):
- Capture-by-default 준수율: 최근 실제 git 커밋 수 대비 session-log.md/decision-log.md의 같은 기간 항목 수가 합리적인지(둘 다 파일을 열어 직접 세어 비교).
- 08_본선/_system/memory/ 안의 메모 파일이 주장하는 개수/사실(예: "스킬 N종")이 실제 폴더 상태와 일치하는지 표본 검증.
- registry-skills.md / registry-plugins.md가 선언하는 개수가 실제 .claude/settings.json enabledPlugins·skills/ 폴더와 일치하는지, 마켓플레이스 소스가 extraKnownMarketplaces에 등록됐는지.
- telemetry 파일의 duration/토큰 값에 물리적으로 불가능한 이상치(예: 세션 시작 시점보다 긴 경과시간)가 있는지.
- 세션 부팅 시 최우선으로 읽는 문서(HANDOFF 등)의 날짜/상태 라벨이 실제 오늘 날짜와 맞는지.

각 질문에 대해 실제로 파일을 열어 확인한 근거(경로, 수치)를 제시하고, 몇 건 중 몇 건이 문제였는지 개수로 보고하라.`,
  },
  {
    key: 'agent_roles',
    label: '본선 역할(role) 에이전트 registry 활용',
    prompt: `08_본선/_system/agents/ 아래 roles/(활성 역할 페르소나)와 candidates/(후보 역할) 폴더, 그리고 08_본선/AGENTS.md의 역할 분담 표·위키링크 인덱스를 대조하라.

확인할 것:
1. AGENTS.md의 역할 분담 표에 나열된 역할명과 roles/ 폴더 파일명이 1:1 일치하는지(표에만 있고 파일 없는 것, 파일만 있고 표에 없는 것).
2. AGENTS.md 안의 "역할 상세" 위키링크 목록이 roles/ 폴더 전체를 빠짐없이 링크하는지 — 정확히 몇 개가 빠졌는지.
3. candidates/ 후보 역할들이 실제로 후보 표에 등장하고 승격 트리거 조건이 명시돼 있는지.
4. 08_본선/_system/team/ 안의 팀원 프로필이 역할명을 실제로 사용해 배정하는지, 몇 개 역할이 사람 슬롯과 연결되고 몇 개가 공석/AI전담인지.
5. 04_증빙/01_핵심로그/ 로그 전수(또는 충분히 큰 표본)에서 각 역할명이 실제로 몇 번 언급/사용되는지 세어, "정의만 되고 실사용 흔적이 없는 역할"을 찾아라.

정확한 개수와 파일 경로/줄번호 근거로 보고하라.`,
  },
  {
    key: 'cc_agents',
    label: 'Claude Code 서브에이전트/스킬 경로 혼재',
    prompt: `이 프로젝트에서 실제로 사용되는 Claude Code 서브에이전트·스킬 정의 경로들(프로젝트 로컬 .agents/, .claude/skills/, .claude/agents/, 08_본선/_system/agents/, 전역 ~/.claude/agents/, ~/.claude/rules/ 등)을 조사하고, 정의가 중복되거나 실제로는 안 쓰이는 "고아" 경로가 있는지 확인하라.

확인할 것:
1. 프로젝트 로컬 .agents/skills/ 와 .claude/skills/ 에 같은 이름의 스킬이 양쪽에 존재하면 diff로 내용이 같은지, 어느 쪽이 gitignore되어 있는지, 실제로 이번 세션에서 로드되는 스킬이 어느 경로 출신인지(전역 플러그인 마켓플레이스 vs 프로젝트 로컬) 확인.
2. 사용자의 전역 규칙 파일(~/.claude/rules/*.md)이 특정 이름의 서브에이전트가 ~/.claude/agents/에 있다고 서술한다면, 실제로 그 파일들이 존재하는지, 존재하지 않으면 이번 세션에서 resolve 가능한 전체 subagent_type 목록과 대조해서 몇 개가 대체 불가능한지, 일부는 플러그인이 유사 기능을 제공하는지 확인.
3. 08_본선/_system/agents/roles/ 의 역할명이 Claude Code의 실제 subagent_type 이름과 겹치는 것이 있는지(이름 충돌 리스크), 아직 실제로 .claude/agents/에 배포됐는지(bootstrap.sh 실행 여부로 판단).

결론: "전역 규칙이 서술하는 에이전트 로스터와 실제 존재하는 것 사이에 몇 개 항목이 불일치하는지" 정확한 개수로 보고하라.`,
  },
  {
    key: 'agent_registry',
    label: '운영시스템 에이전트 레지스트리(토큰 추적) 정합성',
    prompt: `08_본선/_system/agents/_agent-registry.md(운영·개발 AI 에이전트 레지스트리 — 14-role 협업 페르소나와는 별개로, 실제 투입된 AI 에이전트 "세션"의 정의·기여·토큰을 추적하는 문서)를 조사하라.

확인할 것:
1. 이 파일 안에 에이전트 사용량/토큰을 기술하는 섹션이 몇 개 있고, 서로 다른 집계 방식(수동 서술 표 vs 자동생성 블록)이 같은 스코프를 주장하면서 다른 숫자를 보이는지, 아니면 애초에 스코프가 달라서 다른 게 정상인지 구분하라.
2. 08_본선/_system/telemetry/_telemetry-log.md(원본 append-only 로그)의 실제 행 수·합계와, 위 레지스트리 파일의 숫자를 대조. 원본 로그의 설계(멱등 dedup 여부, 스냅샷 방식)를 먼저 파악한 뒤 대조해야 오판을 피할 수 있다.
3. 08_본선/_system/automation/ 안의 스크립트들이 실제로 Stop 훅이나 다른 스킬에서 호출되는지(연쇄 호출 추적), 아니면 문서화된 수동 도구인지, 완전히 어디서도 참조 안 되는 고아 스크립트인지 각각 판정.
4. 이 레지스트리 파일의 마지막 갱신일(git blame/log)과 오늘 사이에 session-log.md에 새 세션이 몇 개 쌓였는지 비교해, 방치(stale) 여부와 방치 기간을 수치로 제시.
5. team/_contribution-stats.md 등 유사 문서와의 관계 — 몇 번째 독립 집계인지.

숫자와 파일경로·줄번호 근거 위주로 보고하라.`,
  },
]

log('9개 차원 병렬 감사 시작: ' + DIMENSIONS.map(d => d.label).join(', '))

const results = await pipeline(
  DIMENSIONS,
  d => agent(d.prompt, { label: `find:${d.key}`, phase: 'Audit', schema: FIND_SCHEMA }),
  (found, d) => {
    if (!found) return null
    const claims = (found.top_claims || []).join('\n- ')
    const verifyPrompt = `다른 에이전트가 이 저장소를 감사(${d.label} 차원)하고 다음 핵심 주장들을 했다:
- ${claims}

전체 요약: ${found.summary}

너는 이 주장들을 처음부터 다시, 독립적으로 실제 파일/git 명령으로 재확인하는 검증관이다. 그 에이전트의 말을 그대로 믿지 말고 스스로 재현하라. 숫자가 맞는지, 과장/축소됐는지, 틀렸는지 판정하고, 틀린 부분은 정확한 값으로 정정하라.`
    return agent(verifyPrompt, { label: `verify:${d.key}`, phase: 'Verify', schema: VERIFY_SCHEMA })
      .then(v => ({ dimension: d.label, key: d.key, find: found, verify: v }))
  }
)

return results.filter(Boolean)
