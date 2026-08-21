#!/bin/bash
# ==============================================================================
# 공개 배포 전용 GitHub 저장소 자동 동기화 스크립트
# ==============================================================================

TARGET_REPO="${1:-ryujean-slides}"
REMOTE_URL="https://github.com/ryujean77/${TARGET_REPO}.git"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 [안전 배포 시작] 대상 저장소: ${REMOTE_URL}"
cd "$DEPLOY_DIR"

if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"

git add .
git commit -m "deploy: 최신 강연 제안서 슬라이드 및 쇼룸 포털 안전 배포 ($(date +'%Y-%m-%d %H:%M:%S'))"
git push -u origin main --force

echo "✅ [배포 완료] https://ryujean77.github.io/${TARGET_REPO}/"
