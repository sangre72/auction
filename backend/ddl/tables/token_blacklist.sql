-- 토큰 블랙리스트 테이블
-- 로그아웃된 JWT 토큰을 저장하여 무효화
CREATE TABLE IF NOT EXISTS token_blacklist (
    id SERIAL PRIMARY KEY,
    jti VARCHAR(64) NOT NULL UNIQUE,                    -- JWT ID (토큰 고유 식별자)
    token_type VARCHAR(20) NOT NULL,                    -- 'access' | 'refresh'
    user_type VARCHAR(20) NOT NULL,                     -- 'admin' | 'user'
    user_id INTEGER,                                    -- 사용자 ID (참조용)
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,       -- 토큰 만료 시간
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()   -- 블랙리스트 등록 시간
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user ON token_blacklist(user_type, user_id);

-- 컬럼 코멘트
COMMENT ON TABLE token_blacklist IS '로그아웃된 JWT 토큰 블랙리스트';
COMMENT ON COLUMN token_blacklist.jti IS 'JWT ID - 토큰 고유 식별자';
COMMENT ON COLUMN token_blacklist.token_type IS '토큰 유형 (access/refresh)';
COMMENT ON COLUMN token_blacklist.user_type IS '사용자 유형 (admin/user)';
COMMENT ON COLUMN token_blacklist.user_id IS '사용자 ID';
COMMENT ON COLUMN token_blacklist.expires_at IS '토큰 만료 시간 (이후 자동 삭제 가능)';
COMMENT ON COLUMN token_blacklist.created_at IS '블랙리스트 등록 시간';
