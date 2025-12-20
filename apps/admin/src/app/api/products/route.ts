import { NextRequest, NextResponse } from 'next/server';

interface CreateProductInput {
  title: string;
  category: string;
  images: string[];
  description: string;
  slots: number;
  pricePerSlot: number;
  startDate: string;
  endDate: string;
  buyNowPrice?: number | null;
  tags?: string[];
}

// 임시 저장소 (실제로는 데이터베이스 사용)
const products: Array<CreateProductInput & { id: string; createdAt: string; status: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const body: CreateProductInput = await request.json();

    // 필수 필드 검증
    if (!body.title || body.title.length < 2 || body.title.length > 100) {
      return NextResponse.json(
        { error: '상품명은 2~100자여야 합니다.' },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { error: '카테고리를 선택해주세요.' },
        { status: 400 }
      );
    }

    if (!body.images || body.images.length === 0) {
      return NextResponse.json(
        { error: '최소 1장의 이미지를 업로드해주세요.' },
        { status: 400 }
      );
    }

    if (body.images.length > 10) {
      return NextResponse.json(
        { error: '이미지는 최대 10장까지 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    if (!body.description) {
      return NextResponse.json(
        { error: '상품 설명을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!body.slots || body.slots < 1) {
      return NextResponse.json(
        { error: '슬롯 수는 1 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (!body.pricePerSlot || body.pricePerSlot < 1000) {
      return NextResponse.json(
        { error: '슬롯당 가격은 1,000원 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (!body.startDate) {
      return NextResponse.json(
        { error: '경매 시작일을 선택해주세요.' },
        { status: 400 }
      );
    }

    if (!body.endDate) {
      return NextResponse.json(
        { error: '경매 종료일을 선택해주세요.' },
        { status: 400 }
      );
    }

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: '종료일은 시작일 이후여야 합니다.' },
        { status: 400 }
      );
    }

    // 상품 생성
    const newProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: 'pending', // pending, active, ended, cancelled
    };

    // 임시 저장 (실제로는 데이터베이스에 저장)
    products.push(newProduct);

    console.log('Product created:', newProduct);

    return NextResponse.json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: '상품 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 상품 목록 반환
  return NextResponse.json({
    success: true,
    products: products.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    total: products.length,
  });
}
