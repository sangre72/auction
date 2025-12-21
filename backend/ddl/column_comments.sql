-- ============================================
-- 테이블 및 컬럼 코멘트 정의
-- PostgreSQL COMMENT ON 문
-- ============================================

-- ============================================
-- users: 사용자 테이블
-- ============================================
COMMENT ON TABLE users IS '사용자 정보';
COMMENT ON COLUMN users.id IS '사용자 고유 ID';
COMMENT ON COLUMN users.email IS '이메일 주소';
COMMENT ON COLUMN users.phone IS '전화번호 (레거시, 사용 안함)';
COMMENT ON COLUMN users.name IS '실명';
COMMENT ON COLUMN users.nickname IS '닉네임';
COMMENT ON COLUMN users.profile_image IS '프로필 이미지 URL';
COMMENT ON COLUMN users.provider IS '인증 제공자 (email, kakao, naver, google 등)';
COMMENT ON COLUMN users.provider_id IS '소셜 로그인 제공자 ID';
COMMENT ON COLUMN users.password_hash IS '비밀번호 해시 (bcrypt)';
COMMENT ON COLUMN users.status IS '상태 (active, inactive, suspended, banned, deleted)';
COMMENT ON COLUMN users.is_verified IS '이메일 인증 여부';
COMMENT ON COLUMN users.point_balance IS '포인트 잔액';
COMMENT ON COLUMN users.last_login_at IS '마지막 로그인 시각';
COMMENT ON COLUMN users.created_at IS '가입 시각';
COMMENT ON COLUMN users.updated_at IS '정보 수정 시각';
COMMENT ON COLUMN users.phone_hash IS '전화번호 SHA256 해시 (중복 방지용)';
COMMENT ON COLUMN users.phone_verified_at IS '전화번호 인증 시각';
COMMENT ON COLUMN users.ci_hash IS '본인인증 CI 해시 (중복 가입 방지)';
COMMENT ON COLUMN users.ci_verified_at IS '본인인증 시각';
COMMENT ON COLUMN users.verification_level IS '인증 레벨 (none, phone, ci)';
COMMENT ON COLUMN users.status_reason IS '상태 변경 사유 (정지 사유 등)';
COMMENT ON COLUMN users.failed_login_count IS '연속 로그인 실패 횟수';
COMMENT ON COLUMN users.locked_at IS '계정 잠금 시각';

-- ============================================
-- user_devices: 사용자 디바이스 테이블
-- ============================================
COMMENT ON TABLE user_devices IS '사용자 디바이스 핑거프린트';
COMMENT ON COLUMN user_devices.id IS '디바이스 고유 ID';
COMMENT ON COLUMN user_devices.user_id IS '사용자 FK';
COMMENT ON COLUMN user_devices.device_fingerprint IS '디바이스 핑거프린트 해시';
COMMENT ON COLUMN user_devices.device_type IS '디바이스 유형 (desktop, mobile, tablet)';
COMMENT ON COLUMN user_devices.browser IS '브라우저 정보';
COMMENT ON COLUMN user_devices.os IS '운영체제 정보';
COMMENT ON COLUMN user_devices.ip_address IS 'IP 주소';
COMMENT ON COLUMN user_devices.is_trusted IS '신뢰할 수 있는 디바이스 여부';
COMMENT ON COLUMN user_devices.last_used_at IS '마지막 사용 시각';
COMMENT ON COLUMN user_devices.created_at IS '등록 시각';

-- ============================================
-- shipping_addresses: 배송지 테이블
-- ============================================
COMMENT ON TABLE shipping_addresses IS '배송지 정보 (암호화)';
COMMENT ON COLUMN shipping_addresses.id IS '배송지 고유 ID';
COMMENT ON COLUMN shipping_addresses.user_id IS '사용자 FK';
COMMENT ON COLUMN shipping_addresses.label IS '배송지 별칭 (집, 회사 등)';
COMMENT ON COLUMN shipping_addresses.recipient_name IS '수령인 이름 (암호화)';
COMMENT ON COLUMN shipping_addresses.phone IS '연락처 (암호화)';
COMMENT ON COLUMN shipping_addresses.postal_code IS '우편번호';
COMMENT ON COLUMN shipping_addresses.address IS '기본 주소';
COMMENT ON COLUMN shipping_addresses.address_detail IS '상세 주소 (암호화)';
COMMENT ON COLUMN shipping_addresses.is_default IS '기본 배송지 여부';
COMMENT ON COLUMN shipping_addresses.created_at IS '등록 시각';
COMMENT ON COLUMN shipping_addresses.updated_at IS '수정 시각';

-- ============================================
-- suspicious_activities: 의심 활동 로그
-- ============================================
COMMENT ON TABLE suspicious_activities IS '의심 활동 탐지 로그';
COMMENT ON COLUMN suspicious_activities.id IS '로그 고유 ID';
COMMENT ON COLUMN suspicious_activities.user_id IS '사용자 FK (NULL 가능)';
COMMENT ON COLUMN suspicious_activities.activity_type IS '활동 유형 (duplicate_device, rapid_signup 등)';
COMMENT ON COLUMN suspicious_activities.severity IS '심각도 (low, medium, high, critical)';
COMMENT ON COLUMN suspicious_activities.details IS '상세 정보 (JSON)';
COMMENT ON COLUMN suspicious_activities.ip_address IS 'IP 주소';
COMMENT ON COLUMN suspicious_activities.device_fingerprint IS '디바이스 핑거프린트';
COMMENT ON COLUMN suspicious_activities.is_resolved IS '해결 여부';
COMMENT ON COLUMN suspicious_activities.resolved_at IS '해결 시각';
COMMENT ON COLUMN suspicious_activities.resolved_by IS '해결한 관리자 ID';
COMMENT ON COLUMN suspicious_activities.resolution_note IS '해결 메모';
COMMENT ON COLUMN suspicious_activities.created_at IS '발생 시각';

-- ============================================
-- admins: 관리자 테이블
-- ============================================
COMMENT ON TABLE admins IS '관리자 계정';
COMMENT ON COLUMN admins.id IS '관리자 고유 ID';
COMMENT ON COLUMN admins.email IS '이메일 주소';
COMMENT ON COLUMN admins.password_hash IS '비밀번호 해시 (bcrypt)';
COMMENT ON COLUMN admins.name IS '관리자 이름';
COMMENT ON COLUMN admins.role IS '권한 (admin, super_admin)';
COMMENT ON COLUMN admins.is_active IS '활성 상태';
COMMENT ON COLUMN admins.last_login_at IS '마지막 로그인 시각';
COMMENT ON COLUMN admins.created_at IS '등록 시각';
COMMENT ON COLUMN admins.updated_at IS '수정 시각';

-- ============================================
-- categories: 카테고리 테이블
-- ============================================
COMMENT ON TABLE categories IS '상품 카테고리';
COMMENT ON COLUMN categories.id IS '카테고리 고유 ID';
COMMENT ON COLUMN categories.name IS '카테고리명';
COMMENT ON COLUMN categories.slug IS 'URL용 슬러그';
COMMENT ON COLUMN categories.description IS '카테고리 설명';
COMMENT ON COLUMN categories.parent_id IS '상위 카테고리 FK (계층 구조)';
COMMENT ON COLUMN categories.sort_order IS '정렬 순서';
COMMENT ON COLUMN categories.is_active IS '활성 상태';
COMMENT ON COLUMN categories.created_at IS '등록 시각';
COMMENT ON COLUMN categories.updated_at IS '수정 시각';

-- ============================================
-- products: 상품 테이블
-- ============================================
COMMENT ON TABLE products IS '상품 정보';
COMMENT ON COLUMN products.id IS '상품 고유 ID';
COMMENT ON COLUMN products.seller_id IS '판매자 FK (users)';
COMMENT ON COLUMN products.title IS '상품명';
COMMENT ON COLUMN products.description IS '상품 설명';
COMMENT ON COLUMN products.category IS '카테고리 (레거시, 문자열)';
COMMENT ON COLUMN products.category_id IS '카테고리 FK';
COMMENT ON COLUMN products.auction_type IS '경매 유형 (auction, fixed_price)';
COMMENT ON COLUMN products.starting_price IS '시작 가격';
COMMENT ON COLUMN products.current_price IS '현재 가격';
COMMENT ON COLUMN products.buy_now_price IS '즉시 구매가';
COMMENT ON COLUMN products.min_bid_increment IS '최소 입찰 단위';
COMMENT ON COLUMN products.slot_price IS '슬롯당 가격';
COMMENT ON COLUMN products.slot_count IS '총 슬롯 수';
COMMENT ON COLUMN products.sold_slot_count IS '판매된 슬롯 수';
COMMENT ON COLUMN products.start_time IS '경매 시작 시각';
COMMENT ON COLUMN products.end_time IS '경매 종료 시각';
COMMENT ON COLUMN products.bid_count IS '입찰 횟수';
COMMENT ON COLUMN products.status IS '상태 (draft, pending, active, sold, cancelled, expired)';
COMMENT ON COLUMN products.is_featured IS '추천 상품 여부';
COMMENT ON COLUMN products.thumbnail_url IS '썸네일 이미지 URL';
COMMENT ON COLUMN products.created_at IS '등록 시각';
COMMENT ON COLUMN products.updated_at IS '수정 시각';

-- ============================================
-- product_images: 상품 이미지 테이블
-- ============================================
COMMENT ON TABLE product_images IS '상품 이미지';
COMMENT ON COLUMN product_images.id IS '이미지 고유 ID';
COMMENT ON COLUMN product_images.product_id IS '상품 FK';
COMMENT ON COLUMN product_images.image_url IS '이미지 URL';
COMMENT ON COLUMN product_images.sort_order IS '정렬 순서';
COMMENT ON COLUMN product_images.created_at IS '등록 시각';

-- ============================================
-- product_slots: 상품 슬롯 테이블
-- ============================================
COMMENT ON TABLE product_slots IS '상품 슬롯 (구매 단위)';
COMMENT ON COLUMN product_slots.id IS '슬롯 고유 ID';
COMMENT ON COLUMN product_slots.product_id IS '상품 FK';
COMMENT ON COLUMN product_slots.slot_number IS '슬롯 번호';
COMMENT ON COLUMN product_slots.buyer_id IS '구매자 FK';
COMMENT ON COLUMN product_slots.status IS '상태 (available, reserved, sold, cancelled)';
COMMENT ON COLUMN product_slots.reserved_at IS '예약 시각';
COMMENT ON COLUMN product_slots.sold_at IS '판매 완료 시각';
COMMENT ON COLUMN product_slots.created_at IS '등록 시각';
COMMENT ON COLUMN product_slots.updated_at IS '수정 시각';

-- ============================================
-- payments: 결제 테이블
-- ============================================
COMMENT ON TABLE payments IS '결제 내역';
COMMENT ON COLUMN payments.id IS '결제 고유 ID';
COMMENT ON COLUMN payments.user_id IS '사용자 FK';
COMMENT ON COLUMN payments.product_id IS '상품 FK';
COMMENT ON COLUMN payments.order_id IS '주문 번호 (고유)';
COMMENT ON COLUMN payments.payment_key IS 'PG사 결제 키';
COMMENT ON COLUMN payments.method IS '결제 수단 (card, bank_transfer, virtual_account, points, mixed)';
COMMENT ON COLUMN payments.status IS '결제 상태 (pending, completed, failed, cancelled, refunded)';
COMMENT ON COLUMN payments.amount IS '결제 금액';
COMMENT ON COLUMN payments.paid_amount IS '실 결제 금액';
COMMENT ON COLUMN payments.points_used IS '사용 포인트';
COMMENT ON COLUMN payments.pg_provider IS 'PG사 (toss, nice 등)';
COMMENT ON COLUMN payments.card_company IS '카드사';
COMMENT ON COLUMN payments.card_number IS '카드 번호 (마스킹)';
COMMENT ON COLUMN payments.description IS '결제 설명';
COMMENT ON COLUMN payments.failure_reason IS '실패 사유';
COMMENT ON COLUMN payments.refund_reason IS '환불 사유';
COMMENT ON COLUMN payments.paid_at IS '결제 완료 시각';
COMMENT ON COLUMN payments.cancelled_at IS '취소 시각';
COMMENT ON COLUMN payments.refunded_at IS '환불 시각';
COMMENT ON COLUMN payments.created_at IS '생성 시각';
COMMENT ON COLUMN payments.updated_at IS '수정 시각';

-- ============================================
-- point_histories: 포인트 이력 테이블
-- ============================================
COMMENT ON TABLE point_histories IS '포인트 적립/사용 이력';
COMMENT ON COLUMN point_histories.id IS '이력 고유 ID';
COMMENT ON COLUMN point_histories.user_id IS '사용자 FK';
COMMENT ON COLUMN point_histories.type IS '유형 (earn, use, expire, admin_add, admin_deduct, refund)';
COMMENT ON COLUMN point_histories.reason IS '사유 (signup_bonus, purchase, payment 등)';
COMMENT ON COLUMN point_histories.amount IS '금액 (양수: 적립, 음수: 차감)';
COMMENT ON COLUMN point_histories.balance IS '거래 후 잔액';
COMMENT ON COLUMN point_histories.reference_id IS '관련 주문/결제 ID';
COMMENT ON COLUMN point_histories.description IS '상세 설명';
COMMENT ON COLUMN point_histories.admin_id IS '처리 관리자 FK';
COMMENT ON COLUMN point_histories.expires_at IS '만료 시각';
COMMENT ON COLUMN point_histories.created_at IS '생성 시각';

-- ============================================
-- boards: 게시판 테이블
-- ============================================
COMMENT ON TABLE boards IS '게시판 설정';
COMMENT ON COLUMN boards.id IS '게시판 고유 ID';
COMMENT ON COLUMN boards.name IS '게시판 영문명 (URL용, 고유)';
COMMENT ON COLUMN boards.title IS '게시판 제목';
COMMENT ON COLUMN boards.description IS '게시판 설명';
COMMENT ON COLUMN boards.read_permission IS '읽기 권한 (public, login, admin)';
COMMENT ON COLUMN boards.write_permission IS '쓰기 권한 (login, admin)';
COMMENT ON COLUMN boards.comment_permission IS '댓글 권한 (disabled, login)';
COMMENT ON COLUMN boards.is_active IS '활성 상태';
COMMENT ON COLUMN boards.sort_order IS '정렬 순서';
COMMENT ON COLUMN boards.allow_attachments IS '첨부파일 허용 여부';
COMMENT ON COLUMN boards.allow_images IS '이미지 허용 여부';
COMMENT ON COLUMN boards.max_attachments IS '최대 첨부파일 수';
COMMENT ON COLUMN boards.created_at IS '생성 시각';
COMMENT ON COLUMN boards.updated_at IS '수정 시각';

-- ============================================
-- posts: 게시글 테이블
-- ============================================
COMMENT ON TABLE posts IS '게시글';
COMMENT ON COLUMN posts.id IS '게시글 고유 ID';
COMMENT ON COLUMN posts.board_id IS '게시판 FK';
COMMENT ON COLUMN posts.author_id IS '작성자 FK';
COMMENT ON COLUMN posts.title IS '제목';
COMMENT ON COLUMN posts.content IS '내용 (HTML)';
COMMENT ON COLUMN posts.status IS '상태 (draft, published, hidden, deleted)';
COMMENT ON COLUMN posts.is_pinned IS '상단 고정 여부';
COMMENT ON COLUMN posts.is_notice IS '공지사항 여부';
COMMENT ON COLUMN posts.view_count IS '조회수';
COMMENT ON COLUMN posts.like_count IS '좋아요 수';
COMMENT ON COLUMN posts.comment_count IS '댓글 수';
COMMENT ON COLUMN posts.created_at IS '작성 시각';
COMMENT ON COLUMN posts.updated_at IS '수정 시각';

-- ============================================
-- post_images: 게시글 이미지 테이블
-- ============================================
COMMENT ON TABLE post_images IS '게시글 본문 이미지';
COMMENT ON COLUMN post_images.id IS '이미지 고유 ID';
COMMENT ON COLUMN post_images.post_id IS '게시글 FK';
COMMENT ON COLUMN post_images.image_url IS '이미지 URL';
COMMENT ON COLUMN post_images.original_filename IS '원본 파일명';
COMMENT ON COLUMN post_images.file_size IS '파일 크기 (bytes)';
COMMENT ON COLUMN post_images.created_at IS '업로드 시각';

-- ============================================
-- post_attachments: 게시글 첨부파일 테이블
-- ============================================
COMMENT ON TABLE post_attachments IS '게시글 첨부파일';
COMMENT ON COLUMN post_attachments.id IS '첨부파일 고유 ID';
COMMENT ON COLUMN post_attachments.post_id IS '게시글 FK';
COMMENT ON COLUMN post_attachments.file_url IS '파일 URL';
COMMENT ON COLUMN post_attachments.original_filename IS '원본 파일명';
COMMENT ON COLUMN post_attachments.file_size IS '파일 크기 (bytes)';
COMMENT ON COLUMN post_attachments.file_type IS 'MIME 타입';
COMMENT ON COLUMN post_attachments.download_count IS '다운로드 횟수';
COMMENT ON COLUMN post_attachments.created_at IS '업로드 시각';

-- ============================================
-- post_likes: 게시글 좋아요 테이블
-- ============================================
COMMENT ON TABLE post_likes IS '게시글 좋아요';
COMMENT ON COLUMN post_likes.id IS '좋아요 고유 ID';
COMMENT ON COLUMN post_likes.post_id IS '게시글 FK';
COMMENT ON COLUMN post_likes.user_id IS '사용자 FK';
COMMENT ON COLUMN post_likes.created_at IS '좋아요 시각';

-- ============================================
-- comments: 댓글 테이블
-- ============================================
COMMENT ON TABLE comments IS '게시글 댓글';
COMMENT ON COLUMN comments.id IS '댓글 고유 ID';
COMMENT ON COLUMN comments.post_id IS '게시글 FK';
COMMENT ON COLUMN comments.author_id IS '작성자 FK';
COMMENT ON COLUMN comments.parent_id IS '상위 댓글 FK (대댓글용)';
COMMENT ON COLUMN comments.content IS '댓글 내용';
COMMENT ON COLUMN comments.is_deleted IS '삭제 여부';
COMMENT ON COLUMN comments.created_at IS '작성 시각';
COMMENT ON COLUMN comments.updated_at IS '수정 시각';

-- ============================================
-- forbidden_words: 금칙어 테이블
-- ============================================
COMMENT ON TABLE forbidden_words IS '금칙어 목록';
COMMENT ON COLUMN forbidden_words.id IS '금칙어 고유 ID';
COMMENT ON COLUMN forbidden_words.word IS '금칙어';
COMMENT ON COLUMN forbidden_words.replacement IS '대체 텍스트 (NULL이면 필터링)';
COMMENT ON COLUMN forbidden_words.match_type IS '매칭 방식 (exact, contains, regex)';
COMMENT ON COLUMN forbidden_words.target IS '적용 대상 (all, post_title, post_content, comment, nickname)';
COMMENT ON COLUMN forbidden_words.is_active IS '활성 상태';
COMMENT ON COLUMN forbidden_words.reason IS '등록 사유';
COMMENT ON COLUMN forbidden_words.created_at IS '등록 시각';
COMMENT ON COLUMN forbidden_words.updated_at IS '수정 시각';

-- ============================================
-- banners: 배너 테이블
-- ============================================
COMMENT ON TABLE banners IS '배너 관리';
COMMENT ON COLUMN banners.id IS '배너 고유 ID';
COMMENT ON COLUMN banners.title IS '배너 제목';
COMMENT ON COLUMN banners.description IS '배너 설명';
COMMENT ON COLUMN banners.position IS '위치 (main_top, main_middle, sidebar, popup, footer)';
COMMENT ON COLUMN banners.type IS '타입 (image, video, html)';
COMMENT ON COLUMN banners.image_url IS '이미지 URL';
COMMENT ON COLUMN banners.mobile_image_url IS '모바일 이미지 URL';
COMMENT ON COLUMN banners.video_url IS '비디오 URL';
COMMENT ON COLUMN banners.html_content IS 'HTML 콘텐츠';
COMMENT ON COLUMN banners.link_url IS '링크 URL';
COMMENT ON COLUMN banners.link_target IS '링크 타겟 (_self, _blank)';
COMMENT ON COLUMN banners.is_active IS '활성 상태';
COMMENT ON COLUMN banners.sort_order IS '정렬 순서';
COMMENT ON COLUMN banners.start_date IS '노출 시작일';
COMMENT ON COLUMN banners.end_date IS '노출 종료일';
COMMENT ON COLUMN banners.view_count IS '노출 수';
COMMENT ON COLUMN banners.click_count IS '클릭 수';
COMMENT ON COLUMN banners.created_at IS '등록 시각';
COMMENT ON COLUMN banners.updated_at IS '수정 시각';

-- ============================================
-- visitors: 방문자 로그 테이블
-- ============================================
COMMENT ON TABLE visitors IS '방문자 로그';
COMMENT ON COLUMN visitors.id IS '로그 고유 ID';
COMMENT ON COLUMN visitors.ip_address IS 'IP 주소 (IPv6 지원)';
COMMENT ON COLUMN visitors.user_agent IS 'User-Agent 문자열';
COMMENT ON COLUMN visitors.device_type IS '디바이스 유형 (desktop, mobile, tablet)';
COMMENT ON COLUMN visitors.browser IS '브라우저';
COMMENT ON COLUMN visitors.os IS '운영체제';
COMMENT ON COLUMN visitors.page_url IS '방문 페이지 URL';
COMMENT ON COLUMN visitors.referrer IS '유입 경로';
COMMENT ON COLUMN visitors.session_id IS '세션 ID';
COMMENT ON COLUMN visitors.user_id IS '사용자 FK (로그인 시)';
COMMENT ON COLUMN visitors.country IS '국가';
COMMENT ON COLUMN visitors.city IS '도시';
COMMENT ON COLUMN visitors.visited_at IS '방문 시각';

-- ============================================
-- daily_stats: 일별 통계 테이블
-- ============================================
COMMENT ON TABLE daily_stats IS '일별 통계';
COMMENT ON COLUMN daily_stats.id IS '통계 고유 ID';
COMMENT ON COLUMN daily_stats.date IS '날짜 (고유)';
COMMENT ON COLUMN daily_stats.total_visits IS '총 방문 수';
COMMENT ON COLUMN daily_stats.unique_visitors IS '순 방문자 수';
COMMENT ON COLUMN daily_stats.new_visitors IS '신규 방문자 수';
COMMENT ON COLUMN daily_stats.returning_visitors IS '재방문자 수';
COMMENT ON COLUMN daily_stats.page_views IS '페이지뷰 수';
COMMENT ON COLUMN daily_stats.avg_pages_per_session IS '세션당 평균 페이지';
COMMENT ON COLUMN daily_stats.desktop_visits IS '데스크톱 방문 수';
COMMENT ON COLUMN daily_stats.mobile_visits IS '모바일 방문 수';
COMMENT ON COLUMN daily_stats.tablet_visits IS '태블릿 방문 수';
COMMENT ON COLUMN daily_stats.new_signups IS '신규 가입자 수';
COMMENT ON COLUMN daily_stats.active_users IS '활성 사용자 수';
COMMENT ON COLUMN daily_stats.total_orders IS '총 주문 수';
COMMENT ON COLUMN daily_stats.total_revenue IS '총 매출액';
COMMENT ON COLUMN daily_stats.created_at IS '생성 시각';
COMMENT ON COLUMN daily_stats.updated_at IS '수정 시각';

-- ============================================
-- wishlists: 관심 상품 테이블
-- ============================================
COMMENT ON TABLE wishlists IS '관심 상품 (찜)';
COMMENT ON COLUMN wishlists.id IS '관심 상품 고유 ID';
COMMENT ON COLUMN wishlists.user_id IS '사용자 FK';
COMMENT ON COLUMN wishlists.product_id IS '상품 FK';
COMMENT ON COLUMN wishlists.created_at IS '등록 시각';
