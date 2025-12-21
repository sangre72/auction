"""
Auction Admin Backend API
FastAPI 기반 관리자 백엔드 서버
"""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from core.database import init_db

# 라우터 임포트
from auth.router import router as auth_router
from auth.user_router import router as user_auth_router
from users.router import router as users_router
from users.my_router import router as my_router
from products.router import router as products_router
from products.public_router import router as public_products_router
from products.ws_router import router as products_ws_router
from payments.router import router as payments_router
from payments.public_router import router as public_payments_router
from points.router import router as points_router
from banners.router import router as banners_router
from visitors.router import router as visitors_router
from categories.router import router as categories_router
from wishlist.router import router as wishlist_router
from boards.router import router as boards_router
from boards.public_router import router as public_boards_router
from forbidden_words.router import router as forbidden_words_router
from uploads.router import router as uploads_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 라이프사이클"""
    # 시작 시 DB 초기화
    init_db()
    print("Database initialized")

    # 업로드 디렉토리 생성
    upload_dir = Path("static/uploads")
    (upload_dir / "images").mkdir(parents=True, exist_ok=True)
    (upload_dir / "attachments").mkdir(parents=True, exist_ok=True)
    print("Upload directories created")

    yield
    # 종료 시 정리 작업
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="옥션 관리자 백엔드 API",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(auth_router, prefix="/api")
app.include_router(user_auth_router, prefix="/api")  # 일반 회원 인증
app.include_router(users_router, prefix="/api")
app.include_router(my_router, prefix="/api")  # 마이페이지 API
app.include_router(products_router, prefix="/api")
app.include_router(public_products_router, prefix="/api")  # 공개 상품 API
app.include_router(products_ws_router)  # 상품 대기열 WebSocket
app.include_router(payments_router, prefix="/api")
app.include_router(public_payments_router, prefix="/api")  # 공개 결제 API
app.include_router(points_router, prefix="/api")
app.include_router(banners_router, prefix="/api")
app.include_router(visitors_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
app.include_router(wishlist_router, prefix="/api")  # 관심 상품
app.include_router(boards_router, prefix="/api")  # 게시판 관리
app.include_router(public_boards_router, prefix="/api")  # 공개 게시판 API
app.include_router(forbidden_words_router, prefix="/api")  # 금칙어 관리
app.include_router(uploads_router, prefix="/api")  # 파일 업로드

# 정적 파일 서빙 (업로드된 파일)
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    """API 루트 엔드포인트"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
