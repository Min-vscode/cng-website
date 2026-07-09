/* ==========================================================================
   CNG 웹사이트 — 메인 스크립트
   네비게이션, 작업사례/파트너/상품 렌더링, 관리자 로그인, 상품 CRUD,
   문의 폼, 스크롤 애니메이션 등 전체 인터랙션을 담당합니다.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- 공통 엘리먼트 ---------- */
  const header = document.getElementById("siteHeader");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileNav = document.getElementById("mobileNav");
  const adminBanner = document.getElementById("adminBanner");
  const adminLoginBtn = document.getElementById("adminLoginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const loginModal = document.getElementById("loginModal");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  const productModal = document.getElementById("productModal");
  const productForm = document.getElementById("productForm");
  const productModalTitle = document.getElementById("productModalTitle");

  const workGrid = document.getElementById("workGrid");
  const workFilterBar = document.getElementById("workFilterBar");
  const partnersGrid = document.getElementById("partnersGrid");
  const productsGrid = document.getElementById("productsGrid");

  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");

  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* ---------- 헤더 스크롤 & 모바일 메뉴 ---------- */
  function onScroll() {
    if (window.scrollY > 20) header.classList.add("solid");
    else header.classList.remove("solid");
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  hamburgerBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
  });
  mobileNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => mobileNav.classList.remove("show"));
  });

  /* 스크롤 시 섹션 네비 활성화 */
  const navLinks = document.querySelectorAll(".main-nav a");
  const sections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function onScrollSpy() {
    let currentId = sections[0] ? sections[0].id : "";
    const scrollPos = window.scrollY + 140;
    sections.forEach((sec) => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }
  window.addEventListener("scroll", onScrollSpy);
  onScrollSpy();

  /* ---------- 스크롤 reveal 애니메이션 ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- 토스트 ---------- */
  let toastTimer = null;
  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------- 모달 공통 ---------- */
  function openModal(modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeModal(modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeModal(document.getElementById(btn.dataset.close));
    });
  });
  [loginModal, productModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(loginModal);
      closeModal(productModal);
    }
  });

  /* ---------- 작업사례(포트폴리오) 렌더링 ---------- */
  function renderWorks(filter) {
    const list = filter && filter !== "all" ? WORKS.filter((w) => w.category === filter) : WORKS;
    workGrid.innerHTML = list
      .map(
        (w) => `
      <div class="work-card reveal in">
        <img src="${w.image}" alt="${w.title}" loading="lazy" />
        <div class="work-overlay">
          <span class="tag">${w.category}</span>
          <h4>${w.title}</h4>
        </div>
      </div>`
      )
      .join("");
  }

  workFilterBar.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    workFilterBar.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    renderWorks(chip.dataset.filter);
  });

  renderWorks("all");

  /* ---------- 파트너사 렌더링 ---------- */
  partnersGrid.innerHTML = PARTNERS.map((name) => `<div class="partner-logo reveal in">${name}</div>`).join("");

  /* ---------- 상품 렌더링 & 관리자 CRUD ---------- */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function renderProducts() {
    const products = Store.getProducts();
    const isAdmin = Store.isAdmin();

    let html = products
      .map(
        (p) => `
      <div class="product-card reveal in" data-id="${p.id}">
        ${
          isAdmin
            ? `<div class="admin-controls">
                <button class="icon-chip" data-action="edit" data-id="${p.id}" title="수정">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                </button>
                <button class="icon-chip danger" data-action="delete" data-id="${p.id}" title="삭제">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z"/></svg>
                </button>
              </div>`
            : ""
        }
        <div class="product-thumb"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" /></div>
        <div class="product-body">
          <div class="product-cat">${escapeHtml(p.category)}</div>
          <h4>${escapeHtml(p.name)}</h4>
          <p class="desc">${escapeHtml(p.desc)}</p>
          <div class="product-price">${escapeHtml(p.price)}${p.price === "견적 문의" ? "" : "원"}<span class="unit">${escapeHtml(p.unit)}</span></div>
        </div>
      </div>`
      )
      .join("");

    html += `
      <div class="add-card" id="addProductCard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        새 제품 추가
      </div>`;

    productsGrid.innerHTML = html;

    const addCard = document.getElementById("addProductCard");
    if (addCard) addCard.addEventListener("click", () => openProductForm());

    productsGrid.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openProductForm(btn.dataset.id);
      });
    });
    productsGrid.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteProduct(btn.dataset.id);
      });
    });
  }

  function setAdminMode(on) {
    document.body.classList.toggle("admin-mode", on);
    adminBanner.classList.toggle("show", on);
    renderProducts();
  }

  /* ---------- 로그인 / 로그아웃 ---------- */
  adminLoginBtn.addEventListener("click", () => {
    if (Store.isAdmin()) {
      setAdminMode(true);
      return;
    }
    loginError.classList.remove("show");
    loginForm.reset();
    openModal(loginModal);
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("loginId").value.trim();
    const pw = document.getElementById("loginPw").value;
    if (id === "admin" && pw === "cng2012") {
      Store.setAdmin(true);
      closeModal(loginModal);
      setAdminMode(true);
      showToast("관리자로 로그인되었습니다.");
    } else {
      loginError.classList.add("show");
    }
  });

  logoutBtn.addEventListener("click", () => {
    Store.setAdmin(false);
    setAdminMode(false);
    showToast("로그아웃되었습니다.");
  });

  /* ---------- 상품 추가/수정 폼 ---------- */
  const pfId = document.getElementById("pfId");
  const pfCategory = document.getElementById("pfCategory");
  const pfName = document.getElementById("pfName");
  const pfDesc = document.getElementById("pfDesc");
  const pfPrice = document.getElementById("pfPrice");
  const pfUnit = document.getElementById("pfUnit");
  const pfImageFile = document.getElementById("pfImageFile");
  const pfThumbPreview = document.getElementById("pfThumbPreview");

  let pendingImageData = "";

  function resetProductForm() {
    productForm.reset();
    pfId.value = "";
    pendingImageData = "";
    pfThumbPreview.style.backgroundImage = "";
    pfThumbPreview.textContent = "이미지를 선택하세요";
  }

  function openProductForm(id) {
    resetProductForm();
    if (id) {
      const products = Store.getProducts();
      const p = products.find((x) => x.id === id);
      if (!p) return;
      productModalTitle.textContent = "제품 수정";
      pfId.value = p.id;
      pfCategory.value = p.category;
      pfName.value = p.name;
      pfDesc.value = p.desc;
      pfPrice.value = p.price;
      pfUnit.value = p.unit;
      pendingImageData = p.image;
      pfThumbPreview.style.backgroundImage = `url('${p.image}')`;
      pfThumbPreview.textContent = "";
    } else {
      productModalTitle.textContent = "제품 추가";
    }
    openModal(productModal);
  }

  pfImageFile.addEventListener("change", () => {
    const file = pfImageFile.files && pfImageFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingImageData = e.target.result;
      pfThumbPreview.style.backgroundImage = `url('${pendingImageData}')`;
      pfThumbPreview.style.backgroundSize = "cover";
      pfThumbPreview.style.backgroundPosition = "center";
      pfThumbPreview.textContent = "";
    };
    reader.readAsDataURL(file);
  });

  productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const products = Store.getProducts();
    const id = pfId.value;

    const data = {
      category: pfCategory.value,
      name: pfName.value.trim(),
      desc: pfDesc.value.trim(),
      price: pfPrice.value.trim(),
      unit: pfUnit.value.trim(),
      image: pendingImageData || "images/work-metal-1.jpg",
    };

    if (id) {
      const idx = products.findIndex((p) => p.id === id);
      if (idx > -1) products[idx] = { ...products[idx], ...data };
      showToast("제품 정보가 수정되었습니다.");
    } else {
      const newId = "p" + (Date.now());
      products.push({ id: newId, ...data });
      showToast("새 제품이 추가되었습니다.");
    }

    Store.saveProducts(products);
    closeModal(productModal);
    renderProducts();
  });

  function deleteProduct(id) {
    if (!confirm("이 제품을 삭제하시겠습니까?")) return;
    const products = Store.getProducts().filter((p) => p.id !== id);
    Store.saveProducts(products);
    renderProducts();
    showToast("제품이 삭제되었습니다.");
  }

  /* ---------- 문의 폼 ---------- */
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formSuccess.classList.add("show");
    contactForm.reset();
    setTimeout(() => formSuccess.classList.remove("show"), 4000);
  });

  /* ---------- 초기화 ---------- */
  renderProducts();
  if (Store.isAdmin()) setAdminMode(true);
})();
