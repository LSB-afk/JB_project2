#!/bin/bash
# vendor-sync.sh — 연결된 외부 레포를 레포 루트 _vendor/ 에 clone/pull 해서 로컬에서 바로 쓰게 함.
# 외부 레포는 우리 git에 커밋하지 않는다(_vendor/ 는 .gitignore). 업데이트되면 이 스크립트만 재실행.
# 사용: bash 08_본선/_system/tools/vendor-sync.sh [name ...]   (인자 없으면 활성 목록 전체)
set -euo pipefail

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
VENDOR="$ROOT/_vendor"
mkdir -p "$VENDOR"

# name|git-url  — 주석(#) 해제로 대상 추가
REPOS=(
  "harness-engineering-skills|https://github.com/River-181/harness-engineering-skills.git"
  # "hagent-os|https://github.com/River-181/hagent-os.git"
  "JB_project2|https://github.com/LSB-afk/JB_project2.git"
)

sync_one() {
  local name="$1" url="$2"
  if [ -d "$VENDOR/$name/.git" ]; then
    echo "→ pull $name"
    git -C "$VENDOR/$name" pull --ff-only || echo "  ⚠ $name pull 실패(수동 확인)"
  else
    echo "→ clone $name"
    git clone --depth 1 "$url" "$VENDOR/$name"
  fi
}

want=("$@")
for entry in "${REPOS[@]}"; do
  name="${entry%%|*}"; url="${entry##*|}"
  if [ ${#want[@]} -gt 0 ]; then
    case " ${want[*]} " in *" $name "*) ;; *) continue;; esac
  fi
  sync_one "$name" "$url"
done
echo "완료. 위치: $VENDOR"
