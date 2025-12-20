#!/bin/bash

# OAuth 제공자 추가 스캐폴딩 스크립트
# 사용법: ./new-oauth-provider.sh <provider-name>
# 예시: ./new-oauth-provider.sh facebook

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 헬퍼 함수
error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 입력 검증
if [ -z "$1" ]; then
    error "Provider name is required. Usage: ./new-oauth-provider.sh <provider-name>"
fi

PROVIDER_ID="$1"
PROVIDER_NAME="${PROVIDER_ID^}"  # 첫 글자 대문자
PROVIDER_CLASS_NAME="${PROVIDER_NAME}OAuthProvider"
PROVIDER_ENV_PREFIX="${PROVIDER_ID^^}"  # 전체 대문자

info "Creating new OAuth provider: $PROVIDER_NAME"
echo "  Provider ID: $PROVIDER_ID"
echo "  Class Name: $PROVIDER_CLASS_NAME"
echo "  Env Prefix: $PROVIDER_ENV_PREFIX"
echo ""

# 사용자 입력 받기
read -p "Authorization URL: " AUTHORIZATION_URL
read -p "Token URL: " TOKEN_URL
read -p "User Info URL: " USERINFO_URL
read -p "Documentation URL: " DOCUMENTATION_URL
read -p "Default Scope (e.g., 'email profile'): " DEFAULT_SCOPE
read -p "User ID field name (e.g., 'id'): " USER_ID_FIELD
read -p "Email field name (e.g., 'email'): " EMAIL_FIELD
read -p "Name field name (e.g., 'name'): " NAME_FIELD
read -p "Profile image field name (e.g., 'picture'): " PROFILE_IMAGE_FIELD

# 템플릿 파일 경로
TEMPLATE_FILE=".claude/templates/oauth-provider.template.ts"
OUTPUT_FILE="src/lib/auth/${PROVIDER_ID}.ts"

# 템플릿 파일 존재 확인
if [ ! -f "$TEMPLATE_FILE" ]; then
    error "Template file not found: $TEMPLATE_FILE"
fi

# 출력 파일이 이미 존재하는지 확인
if [ -f "$OUTPUT_FILE" ]; then
    read -p "File $OUTPUT_FILE already exists. Overwrite? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        error "Aborted."
    fi
fi

# 템플릿 처리 및 파일 생성
info "Generating provider file..."
sed -e "s|{{PROVIDER_NAME}}|$PROVIDER_NAME|g" \
    -e "s|{{PROVIDER_ID}}|$PROVIDER_ID|g" \
    -e "s|{{PROVIDER_CLASS_NAME}}|$PROVIDER_CLASS_NAME|g" \
    -e "s|{{PROVIDER_ENV_PREFIX}}|$PROVIDER_ENV_PREFIX|g" \
    -e "s|{{AUTHORIZATION_URL}}|$AUTHORIZATION_URL|g" \
    -e "s|{{TOKEN_URL}}|$TOKEN_URL|g" \
    -e "s|{{USERINFO_URL}}|$USERINFO_URL|g" \
    -e "s|{{DOCUMENTATION_URL}}|$DOCUMENTATION_URL|g" \
    -e "s|{{DEFAULT_SCOPE}}|$DEFAULT_SCOPE|g" \
    -e "s|{{USER_ID_FIELD}}|$USER_ID_FIELD|g" \
    -e "s|{{EMAIL_FIELD}}|$EMAIL_FIELD|g" \
    -e "s|{{NAME_FIELD}}|$NAME_FIELD|g" \
    -e "s|{{PROFILE_IMAGE_FIELD}}|$PROFILE_IMAGE_FIELD|g" \
    "$TEMPLATE_FILE" > "$OUTPUT_FILE"

success "Created $OUTPUT_FILE"

# .env.local 업데이트
ENV_FILE=".env.local"
info "Updating $ENV_FILE..."

if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

# 환경 변수 추가 (중복 체크)
if grep -q "${PROVIDER_ENV_PREFIX}_CLIENT_ID" "$ENV_FILE"; then
    info "Environment variables already exist in $ENV_FILE"
else
    cat >> "$ENV_FILE" << EOF

# ${PROVIDER_NAME} OAuth
${PROVIDER_ENV_PREFIX}_CLIENT_ID=your_${PROVIDER_ID}_client_id
${PROVIDER_ENV_PREFIX}_CLIENT_SECRET=your_${PROVIDER_ID}_client_secret
${PROVIDER_ENV_PREFIX}_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=${PROVIDER_ID}
EOF
    success "Added environment variables to $ENV_FILE"
fi

# Next.js API 라우트 업데이트 안내
info "Next steps:"
echo ""
echo "1. Update src/app/api/auth/[provider]/route.ts:"
echo "   import { ${PROVIDER_CLASS_NAME} } from '@/lib/auth/${PROVIDER_ID}';"
echo ""
echo "   const providers = {"
echo "     kakao: KakaoOAuthProvider,"
echo "     naver: NaverOAuthProvider,"
echo "     google: GoogleOAuthProvider,"
echo "     ${PROVIDER_ID}: ${PROVIDER_CLASS_NAME}, // <-- Add this line"
echo "   };"
echo ""
echo "2. Update src/app/api/auth/callback/route.ts with the same import and registry"
echo ""
echo "3. Fill in the environment variables in $ENV_FILE"
echo ""
echo "4. Add login button in src/components/SocialLoginButtons.tsx"
echo ""
echo "5. Test the implementation:"
echo "   npm run dev"
echo "   Open http://localhost:3000"
echo ""
success "Done! Happy coding! 🎉"
