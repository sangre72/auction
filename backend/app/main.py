"""
FastAPI OAuth Social Authentication Backend
카카오, 네이버, 구글 소셜 로그인을 지원하는 백엔드 API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import auth

# 환경 변수 로드
load_dotenv()

app = FastAPI(
    title="OAuth Social Auth API",
    description="카카오, 네이버, 구글 소셜 로그인 API",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api")


@app.get("/")
async def root():
    """API 루트 엔드포인트"""
    return {
        "message": "OAuth Social Auth API",
        "version": "1.0.0",
        "providers": ["kakao", "naver", "google"],
    }


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
