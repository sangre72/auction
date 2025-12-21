#!/bin/bash
#
# Auction 데이터베이스 테이블 생성 스크립트
#
# 사용법:
#   ./create_tables.sh                    # 기본값 사용
#   ./create_tables.sh -h host -d dbname  # 호스트/DB 지정
#

set -e

# 기본값
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-test_db}"
DB_USER="${DB_USER:-postgres}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 도움말
show_help() {
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -h, --host     데이터베이스 호스트 (기본값: localhost)"
    echo "  -p, --port     데이터베이스 포트 (기본값: 5432)"
    echo "  -d, --database 데이터베이스 이름 (기본값: test_db)"
    echo "  -u, --user     데이터베이스 사용자 (기본값: postgres)"
    echo "  --help         도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0"
    echo "  $0 -h localhost -d auction_db -u postgres"
    echo ""
    echo "환경 변수:"
    echo "  DB_HOST, DB_PORT, DB_NAME, DB_USER, PGPASSWORD"
}

# 인자 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}알 수 없는 옵션: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW} Auction 데이터베이스 스키마 생성${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "호스트: $DB_HOST:$DB_PORT"
echo "데이터베이스: $DB_NAME"
echo "사용자: $DB_USER"
echo ""

# 비밀번호 확인
if [ -z "$PGPASSWORD" ]; then
    echo -n "비밀번호 입력: "
    read -s PGPASSWORD
    export PGPASSWORD
    echo ""
fi

# 연결 테스트
echo -e "${YELLOW}연결 테스트 중...${NC}"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}데이터베이스 연결 실패${NC}"
    exit 1
fi
echo -e "${GREEN}연결 성공${NC}"
echo ""

# 스키마 적용
echo -e "${YELLOW}스키마 적용 중...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/schema.sql" > /dev/null 2>&1; then
    echo -e "${GREEN}스키마 적용 완료${NC}"
else
    echo -e "${RED}스키마 적용 실패${NC}"
    exit 1
fi

# 테이블 확인
echo ""
echo -e "${YELLOW}생성된 테이블:${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt" 2>/dev/null | grep -E "^\s+public"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} 완료!${NC}"
echo -e "${GREEN}========================================${NC}"
