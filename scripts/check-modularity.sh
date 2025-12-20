#!/bin/bash
# 모듈화 가이드라인 검사 스크립트
# Git pre-commit hook 또는 CI/CD에서 사용

set -e

echo "=== 모듈화 가이드라인 검사 ==="

ERRORS=0
WARNINGS=0

# 1. features/* 간 직접 import 검사
echo ""
echo "[1] 모듈 간 직접 참조 검사..."
CROSS_IMPORTS=$(grep -rn "from '\.\./\.\./.*features/" apps/*/src/features/ 2>/dev/null || true)
if [ -n "$CROSS_IMPORTS" ]; then
    echo "❌ CRITICAL: features/* 간 직접 import 발견"
    echo "$CROSS_IMPORTS"
    ((ERRORS++))
else
    echo "✅ 모듈 간 직접 참조 없음"
fi

# 2. 타입 중복 정의 검사
echo ""
echo "[2] 타입 중복 정의 검사..."
PRODUCT_DEFS=$(grep -rln "interface Product {" apps/ packages/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$PRODUCT_DEFS" -gt 1 ]; then
    echo "⚠️  WARNING: Product 타입이 $PRODUCT_DEFS 곳에서 정의됨"
    grep -rln "interface Product {" apps/ packages/ 2>/dev/null
    ((WARNINGS++))
else
    echo "✅ 타입 중복 없음"
fi

# 3. 공용 유틸 import 검사
echo ""
echo "[3] 공용 유틸리티 배치 검사..."
LOCAL_FORMAT=$(grep -rn "formatPrice\|formatDate\|formatNumber" apps/*/src/features/*/utils/ 2>/dev/null || true)
if [ -n "$LOCAL_FORMAT" ]; then
    echo "⚠️  WARNING: 공용 유틸이 모듈 내부에 정의됨"
    echo "$LOCAL_FORMAT"
    echo "   → @auction/shared/utils로 이동 권장"
    ((WARNINGS++))
else
    echo "✅ 공용 유틸 배치 정상"
fi

# 4. index.ts 존재 검사
echo ""
echo "[4] 모듈 public API (index.ts) 검사..."
for dir in apps/*/src/features/*/; do
    if [ -d "$dir" ] && [ ! -f "${dir}index.ts" ]; then
        echo "ℹ️  INFO: index.ts 누락 - $dir"
    fi
done

# 5. 요약
echo ""
echo "=== 요약 ==="
echo "Critical: $ERRORS"
echo "Warning: $WARNINGS"

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo "❌ 모듈화 가이드라인 위반이 있습니다. 수정 후 다시 시도하세요."
    exit 1
fi

echo ""
echo "✅ 검사 통과"
exit 0
