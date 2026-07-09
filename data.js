/* ==========================================================================
   CNG 웹사이트 — 초기 데이터 및 저장소 헬퍼
   상품 목록/로그인 상태는 브라우저 localStorage 에 저장되어
   새로고침해도 유지됩니다. (실서비스 배포 시에는 서버 DB 연동 권장)
   ========================================================================== */

const STORAGE_KEYS = {
  products: "cng_products_v1",
  auth: "cng_admin_auth_v1",
  works: "cng_works_v1",
};

/* 기본 상품(아이템) 목록 — 관리자 로그인 후 자유롭게 추가/수정/삭제 가능 */
const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    category: "금속 매대",
    name: "스탠다드 금속 진열 매대",
    desc: "매장/전시용 스틸 프레임 진열대. 사이즈·컬러 맞춤 제작이 가능합니다.",
    price: "550,000",
    unit: "1조 기준",
    image: "images/work-metal-1.jpg",
  },
  {
    id: "p2",
    category: "금속 매대",
    name: "브랜드 로고 각인 매대",
    desc: "브랜드 로고 레이저 각인 및 파우더 코팅 마감의 프리미엄 매대입니다.",
    price: "780,000",
    unit: "1조 기준",
    image: "images/work-metal-2.jpg",
  },
  {
    id: "p3",
    category: "행사 부스",
    name: "표준형 행사 부스 (3x3)",
    desc: "박람회·팝업 스토어용 조립식 부스. 그래픽 패널 포함 풀 패키지입니다.",
    price: "1,200,000",
    unit: "3m x 3m 기준",
    image: "images/work-booth-1.jpg",
  },
  {
    id: "p4",
    category: "행사 부스",
    name: "맞춤 디자인 대형 부스",
    desc: "브랜드 컨셉에 맞춘 전용 디자인 대형 부스 설계 및 시공입니다.",
    price: "견적 문의",
    unit: "규모별 산정",
    image: "images/work-booth-2.jpg",
  },
  {
    id: "p5",
    category: "행사 설치물",
    name: "옥외 행사 설치물 세트",
    desc: "행사장 포토존, 아치, 스탠딩 배너 등 설치물 일체형 제작입니다.",
    price: "980,000",
    unit: "세트 기준",
    image: "images/work-install-1.jpg",
  },
  {
    id: "p6",
    category: "행사 설치물",
    name: "실내 전시 조형물",
    desc: "실내 전시/행사용 구조 조형물. 소재·마감 협의 후 맞춤 제작합니다.",
    price: "견적 문의",
    unit: "규모별 산정",
    image: "images/work-install-2.jpg",
  },
  {
    id: "p7",
    category: "인쇄 기획",
    name: "브랜드 카탈로그 인쇄",
    desc: "기획부터 디자인, 인쇄, 후가공까지 원스톱으로 진행합니다.",
    price: "320,000",
    unit: "100부 기준",
    image: "images/work-print-1.jpg",
  },
  {
    id: "p8",
    category: "인쇄 기획",
    name: "패키지 & POP 인쇄물",
    desc: "제품 패키지, 매장 POP, 홍보물 등 다양한 인쇄물을 제작합니다.",
    price: "260,000",
    unit: "100부 기준",
    image: "images/work-print-2.jpg",
  },
];

/* 지난 작업(포트폴리오) 목록 */
const WORKS = [
  { id: "w1", category: "금속 매대 제작", title: "리테일 매장 금속 매대", image: "images/work-metal-1.jpg" },
  { id: "w2", category: "금속 매대 제작", title: "브랜드 각인 진열대", image: "images/work-metal-2.jpg" },
  { id: "w3", category: "금속 매대 제작", title: "매대 상세 마감", image: "images/work-metal-3.jpg" },
  { id: "w4", category: "금속 매대 제작", title: "다단 진열 구조물", image: "images/work-metal-4.jpg" },
  { id: "w5", category: "행사 부스 제작", title: "박람회 전시 부스", image: "images/work-booth-1.jpg" },
  { id: "w6", category: "행사 부스 제작", title: "브랜드 팝업 부스", image: "images/work-booth-2.jpg" },
  { id: "w7", category: "행사 부스 제작", title: "행사장 대형 부스", image: "images/work-booth-3.jpg" },
  { id: "w8", category: "행사 부스 제작", title: "맞춤 그래픽 부스", image: "images/work-booth-4.jpg" },
  { id: "w9", category: "행사 설치물 제작", title: "옥외 포토존 설치", image: "images/work-install-1.jpg" },
  { id: "w10", category: "행사 설치물 제작", title: "실내 전시 조형물", image: "images/work-install-2.jpg" },
  { id: "w11", category: "인쇄 기획 제작", title: "브랜드 카탈로그", image: "images/work-print-1.jpg" },
  { id: "w12", category: "인쇄 기획 제작", title: "패키지 & POP 인쇄", image: "images/work-print-2.jpg" },
];

/* 파트너사 (PPT 내 협력사 로고 슬라이드 기준 — 실제 로고 이미지로 교체 가능) */
const PARTNERS = [
  "이랜드리테일", "신세계", "롯데마트", "홈플러스", "GS리테일", "CU 편의점",
  "쿠팡", "현대백화점", "이마트", "농협하나로", "다이소", "올리브영",
];

/* ---------- Storage helpers ---------- */
const Store = {
  getProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.products);
      return raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  },
  saveProducts(list) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(list));
  },
  isAdmin() {
    return sessionStorage.getItem(STORAGE_KEYS.auth) === "true";
  },
  setAdmin(val) {
    if (val) sessionStorage.setItem(STORAGE_KEYS.auth, "true");
    else sessionStorage.removeItem(STORAGE_KEYS.auth);
  },
};
