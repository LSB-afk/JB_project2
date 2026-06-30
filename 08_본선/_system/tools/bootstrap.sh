#!/usr/bin/env bash
# =============================================================================
# bootstrap.sh — JB 본선 하네스 부트스트랩
# =============================================================================
#
# 사용법:
#   chmod +x 08_본선/_system/tools/bootstrap.sh   # 최초 1회
#   bash 08_본선/_system/tools/bootstrap.sh --dry-run   # 점검만 (시스템 변경 없음)
#   bash 08_본선/_system/tools/bootstrap.sh              # 실제 적용
#
# 이 스크립트가 하는 일:
#   1. 전제 조건 점검 (node / gh / pandoc / ffmpeg)
#   2. [--dry-run 아닐 때] 에이전트 역할 파일 → 루트 .claude/agents/ 복사
#   3. [--dry-run 아닐 때] 자체 구축 스킬 → 루트 .claude/skills/ 복사
#   4. Codex 연동 안내 (AGENTS.md 참조)
#   5. MCP 등록 안내 (echo만 — 자동 실행·인증 금지)
#   6. 훅 설정 안내 (/update-config 또는 settings.json 수동 편집)
#
# 보안 원칙:
#   - 자동 인증(OAuth/토큰) 실행 금지
#   - MCP 서버 자동 실행 금지
#   - .env 또는 시크릿 파일 자동 생성 금지
#   - --dry-run 기본 권장: 먼저 점검 후 적용
# =============================================================================

set -euo pipefail

# ── 색상 출력 헬퍼 ────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()  { echo -e "${CYAN}[INFO]${RESET}  $*"; }
ok()    { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
err()   { echo -e "${RED}[ERROR]${RESET} $*"; }
head()  { echo -e "\n${BOLD}$*${RESET}"; }

# ── 인자 파싱 ────────────────────────────────────────────────────────────────
DRY_RUN=false
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    *) warn "알 수 없는 인자: $arg (무시)" ;;
  esac
done

if $DRY_RUN; then
  echo -e "\n${YELLOW}======= DRY-RUN 모드 (시스템 변경 없음) =======${RESET}\n"
else
  echo -e "\n${GREEN}======= 실제 적용 모드 =======${RESET}\n"
fi

# ── 경로 계산 ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VAULT_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"   # tools→_system→08_본선→JBproject(repo root)
SYSTEM_DIR="$SCRIPT_DIR/.."
AGENTS_SRC="$SYSTEM_DIR/agents/roles"
SKILLS_SRC="$SYSTEM_DIR/skills"
CLAUDE_AGENTS="$VAULT_ROOT/.claude/agents"
CLAUDE_SKILLS="$VAULT_ROOT/.claude/skills"

info "볼트 루트: $VAULT_ROOT"
info "에이전트 소스: $AGENTS_SRC"
info "스킬 소스:    $SKILLS_SRC"
info "배포 대상:    .claude/agents/ · .claude/skills/"

# =============================================================================
# STEP 1: 전제 조건 점검
# =============================================================================
head "STEP 1 — 전제 조건 점검"

MISSING=()

check_cmd() {
  local cmd=$1 hint=$2
  if command -v "$cmd" &>/dev/null; then
    ok "$cmd ($(command -v "$cmd"))"
  else
    err "$cmd — 없음. 설치: $hint"
    MISSING+=("$cmd")
  fi
}

check_cmd node   "brew install node  또는  nvm install --lts"
check_cmd gh     "brew install gh  →  gh auth login"
check_cmd pandoc "brew install pandoc"
check_cmd ffmpeg "brew install ffmpeg"

# node 있으면 playwright 확인 (선택)
if command -v npx &>/dev/null; then
  if npx playwright --version &>/dev/null 2>&1; then
    ok "playwright (npx)"
  else
    warn "playwright 미설치 (선택). 설치: npm install -g playwright && playwright install"
  fi
fi

if [ ${#MISSING[@]} -gt 0 ]; then
  err "누락된 필수 도구: ${MISSING[*]}"
  err "위 안내에 따라 설치 후 다시 실행하세요."
  if ! $DRY_RUN; then
    exit 1
  fi
fi

# =============================================================================
# STEP 2: 에이전트 역할 파일 배포
# =============================================================================
head "STEP 2 — 에이전트 역할 파일 배포"
# _system/agents/roles/* → 루트 .claude/agents/

if $DRY_RUN; then
  info "[DRY-RUN] 다음 파일을 $CLAUDE_AGENTS/ 로 복사 예정:"
  for f in "$AGENTS_SRC"/*.md; do
    info "  $(basename "$f")"
  done
else
  mkdir -p "$CLAUDE_AGENTS"
  copied=0
  for f in "$AGENTS_SRC"/*.md; do
    dest="$CLAUDE_AGENTS/$(basename "$f")"
    cp -f "$f" "$dest"
    ok "복사: $(basename "$f") → $CLAUDE_AGENTS/"
    ((copied++))
  done
  ok "에이전트 역할 $copied 개 배포 완료"
fi

# =============================================================================
# STEP 3: 자체 구축 스킬 배포
# =============================================================================
head "STEP 3 — 자체 구축 스킬 배포"
# _system/skills/* → 루트 .claude/skills/

SKILL_DIRS=(telemetry-aggregator canon-moc-sync pii-governance-validator harness-sync visualization-cycle meeting-intake)

if $DRY_RUN; then
  info "[DRY-RUN] 다음 스킬을 $CLAUDE_SKILLS/ 로 복사 예정:"
  for skill in "${SKILL_DIRS[@]}"; do
    src_dir="$SKILLS_SRC/$skill"
    if [ -d "$src_dir" ]; then
      info "  $skill/"
    else
      warn "  $skill/ — 소스 없음 (건너뜀)"
    fi
  done
else
  mkdir -p "$CLAUDE_SKILLS"
  for skill in "${SKILL_DIRS[@]}"; do
    src_dir="$SKILLS_SRC/$skill"
    dest_dir="$CLAUDE_SKILLS/$skill"
    if [ -d "$src_dir" ]; then
      cp -rf "$src_dir" "$dest_dir"
      ok "복사: $skill/ → $CLAUDE_SKILLS/"
    else
      warn "$skill/ 소스 없음 — 건너뜀"
    fi
  done
  ok "자체 스킬 배포 완료"
fi

# =============================================================================
# STEP 3.5: 서드파티 에이전트 스킬·툴 (echo만 — 외부 코드 다운로드라 자동 실행 금지)
# =============================================================================
head "STEP 3.5 — 서드파티 스킬·툴 (팀 동기화 / 각자 터미널에서 실행)"
echo ""
warn "아래는 외부 repo 코드를 전 권한으로 실행합니다. 출처 확인 후 직접 실행하세요."
warn "런타임 산출물(.agents/ .claude/)은 gitignore — 소스는 커밋 안 됨. 레지스트리=registry-skills.md"
echo ""
echo -e "${BOLD}── 🔒 보안 게이트: 설치 전 스캔 (NVIDIA SkillSpector) ───────${RESET}"
echo "  uv tool install git+https://github.com/NVIDIA/skillspector.git   # 1회 설치"
echo "  skillspector scan <스킬경로|레포URL>          # 0~100 위험점수: 51+ = 설치 금지"
echo "  # ⚠️ 한국어 스킬은 정적모드가 놓칠 수 있음 → --no-llm 끄고 LLM모드(anthropic/claude_cli) 병행"
echo "  # 새 서드파티 스킬·플러그인은 아래 설치 전에 반드시 스캔. 상세 → 도구-확장-리서치-20260701.md"
echo ""
echo -e "${BOLD}── 락파일 기반 일괄 동기화 (스캔 통과 후) ───────────────────${RESET}"
echo "  npx skills install                 # 루트 skills-lock.json 의 스킬 전부 재현"
echo ""
echo -e "${BOLD}── 디자인 (MVP 재설계) ──────────────────────────────────────${RESET}"
echo "  npx skills add https://github.com/Leonxlnx/taste-skill --skill \"design-taste-frontend\""
echo "  npx impeccable install && (echo '세션에서 /impeccable init 실행')   # ⚠️ 대화식·프로젝트 훅"
echo ""
echo -e "${BOLD}── 리서치 (외부 출처 전용 — 고객 PII/대외비 투입 금지) ──────${RESET}"
echo "  uv tool install \"notebooklm-py[browser]\"   # ⚠️ 비공식 NotebookLM(구글 외부전송)"
echo "  notebooklm skill install --scope project"
echo ""
echo -e "${BOLD}── 백엔드/데이터 (구현 phase에서) ──────────────────────────${RESET}"
echo "  uv pip install lightrag-hku                  # 백엔드 RAG 구성요소"
echo "  npm i -g @mendable/firecrawl-js              # 공개 웹 스크래핑(API 키 필요)"
echo ""
info "상세·주의사항 → 08_본선/_system/tools/registry-skills.md · registry-cli.md"

# =============================================================================
# STEP 4: Codex 연동 안내
# =============================================================================
head "STEP 4 — Codex 연동 안내 (자동 실행 없음)"
echo ""
info "Codex는 볼트 루트의 AGENTS.md 를 자동으로 읽습니다."
info "별도 설치 불필요 — codex:* 스킬이 활성화된 상태에서 /codex:setup 실행."
echo ""
echo -e "  ${CYAN}파일 위치:${RESET} $VAULT_ROOT/AGENTS.md"
echo -e "  ${CYAN}스킬 호출:${RESET} /codex:setup  (Claude Code 세션 안에서)"

# =============================================================================
# STEP 5: MCP 등록 안내 (echo만 — 자동 실행 금지)
# =============================================================================
head "STEP 5 — MCP 등록 안내 (복사 후 터미널에서 직접 실행)"
echo ""
warn "아래 명령은 이 스크립트가 직접 실행하지 않습니다."
warn "터미널에서 필요한 항목만 골라 실행하세요."
echo ""
echo -e "${BOLD}── 인증 불필요 ──────────────────────────────────────────────${RESET}"
echo "  claude mcp add context7"
echo "  claude mcp add excalidraw"
echo "  claude mcp add hwp-mcp"
echo ""
echo -e "${BOLD}── 인증 필요 (실행 후 OAuth/토큰 플로우 진행) ─────────────${RESET}"
echo "  claude mcp add claude-in-chrome   # Chrome 확장 권한 필요"
echo "  claude mcp add perplexity          # Perplexity 계정 필요"
echo "  claude mcp add claude.ai/Figma     # Figma OAuth"
echo "  claude mcp add claude.ai/Notion    # Notion 통합 토큰"
echo "  claude mcp add claude.ai/Google_Calendar  # Google OAuth"
echo "  claude mcp add claude.ai/Google_Drive     # Google OAuth"
echo "  claude mcp add claude.ai/Gmail            # Google OAuth"
echo ""
echo -e "${BOLD}── 검증 후 사용 (안정성 확인 후 추가) ─────────────────────${RESET}"
echo "  # claude mcp add github          # GitHub PAT 필요"
echo "  # claude mcp add obsidian-mcp"
echo "  # claude mcp add notion          # 공식 Notion MCP"
echo ""
info "상세 목록 → 08_본선/_system/tools/registry-mcp.md"
echo ""
warn "플러그인(.claude/settings.json)은 clone 시 project scope로 자동 적용되지만,"
warn "MCP 서버는 인증 때문에 팀원 각자 위 명령을 직접 실행해야 합니다."

# =============================================================================
# STEP 5.5: 협업 채널 안내 (Discord · Syncthing — echo만)
# =============================================================================
head "STEP 5.5 — 협업 채널 합류 안내 (echo만 — 자동 설정 없음)"
echo ""
info "팀 협업·공유·동기화 채널. 상세 → 08_본선/_system/tools/registry-integrations.md"
echo ""
echo -e "${BOLD}── Syncthing (볼트 P2P 동기화) ──────────────────────────────${RESET}"
echo "  # 이 볼트는 Syncthing으로 팀 로컬 동기화됩니다(.stfolder/·.stignore는 gitignore)."
echo "  # 충돌 주의: 세션 중 외부 변경 가능 → 편집 전 최신 상태 확인 권장."
echo "  # 폴더 ID·디바이스 공유는 팀에 문의(_(팀 확정)_)."
echo ""
echo -e "${BOLD}── Discord (실시간 커뮤니케이션·알림) ───────────────────────${RESET}"
echo "  # 팀 Discord 서버 초대링크는 팀에 문의(_(팀 확정)_)."
echo "  # 코드·문서=GitHub / 볼트=Syncthing / 잡담·알림=Discord / 대용량=GDrive / 외부게시=Notion."

# =============================================================================
# STEP 6: 훅 설정 안내
# =============================================================================
head "STEP 6 — 훅 설정 안내 (/update-config 사용 권장)"
echo ""
info "Stop 훅(telemetry-aggregator 자동 실행)은 settings.json 등록이 필요합니다."
info "Claude Code 세션 안에서 아래 스킬을 실행하세요:"
echo ""
echo -e "  ${CYAN}/update-config${RESET}"
echo -e "  → 자동화 훅 설정을 안내받을 수 있습니다."
echo ""
info "수동 등록 경로: $VAULT_ROOT/.claude/settings.json"
info "자동화 스크립트 위치: $SYSTEM_DIR/automation/"

# =============================================================================
# 완료
# =============================================================================
echo ""
if $DRY_RUN; then
  echo -e "${YELLOW}===== DRY-RUN 완료 — 시스템 변경 없음 =====${RESET}"
  echo -e "  실제 적용: ${BOLD}bash 08_본선/_system/tools/bootstrap.sh${RESET}"
else
  echo -e "${GREEN}===== 부트스트랩 완료 =====${RESET}"
  echo -e "  다음 단계:"
  echo -e "  1. Claude Code 세션 재시작 (스킬·에이전트 즉시 적용)"
  echo -e "  2. STEP 5 MCP 명령 중 필요한 항목 실행"
  echo -e "  3. /update-config 로 훅 설정"
fi
echo ""
