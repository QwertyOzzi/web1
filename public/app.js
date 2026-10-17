/**
 * Arz MODS WebSell • Cosmic Unconstrained Frontend Application
 * Starfield Engine, 3D Card Hover, Widescreen Storefront & Tribute Product Pages
 */

// Application State
const state = {
  products: [],
  filteredProducts: [],
  currentProduct: null,
  isAdmin: false,
  settings: {
    store_name: "Arz MODS • Jimi Hopper",
    avatar_url: "/uploads/avatar.svg",
    bio: "Приватные сборки, топовые скрипты и сочная графика для SA-MP / Arizona RP.",
    telegram_username: "jimi_hopper",
    currency: "₽",
    admin_pin: "7777"
  },
  activeCategory: "all",
  searchQuery: "",
  editingProductId: null
};

// DOM References
const elements = {
  // Navigation & Views
  catalogView: document.getElementById("catalog-view"),
  productView: document.getElementById("product-view"),
  navBrandBtn: document.getElementById("nav-brand-btn"),
  btnBackNav: document.getElementById("btn-back-nav"),
  btnSharePage: document.getElementById("btn-share-page"),
  btnOpenSettings: document.getElementById("btn-open-settings"),
  btnAddProduct: document.getElementById("btn-add-product"),
  emptyAddBtn: document.getElementById("empty-add-btn"),
  navBrandTitle: document.getElementById("nav-brand-title"),
  
  // Search & Filters
  globalSearch: document.getElementById("global-search"),
  searchClearBtn: document.getElementById("search-clear-btn"),
  categoriesContainer: document.getElementById("categories-container"),
  productsGrid: document.getElementById("products-grid"),
  productsCount: document.getElementById("products-count"),
  emptyState: document.getElementById("empty-state"),
  statsTotalProducts: document.getElementById("stats-total-products"),
  
  // Storefront Profile
  storeName: document.getElementById("store-name"),
  storeAvatar: document.getElementById("store-avatar"),
  storeBio: document.getElementById("store-bio"),
  storeTgLink: document.getElementById("store-tg-link"),
  storeTgHandle: document.getElementById("store-tg-handle"),
  
  // Product Detail View
  breadcrumbHome: document.getElementById("breadcrumb-home"),
  breadcrumbCategory: document.getElementById("breadcrumb-category"),
  breadcrumbTitle: document.getElementById("breadcrumb-title"),
  detailImage: document.getElementById("detail-image"),
  detailBadge: document.getElementById("detail-badge"),
  detailCategoryTag: document.getElementById("detail-category-tag"),
  detailTitle: document.getElementById("detail-title"),
  detailPrice: document.getElementById("detail-price"),
  detailCurrency: document.getElementById("detail-currency"),
  detailAuthorAvatar: document.getElementById("detail-author-avatar"),
  detailAuthorName: document.getElementById("detail-author-name"),
  detailTgContact: document.getElementById("detail-tg-contact"),
  detailDescription: document.getElementById("detail-description"),
  buyButtonText: document.getElementById("buy-button-text"),
  btnBuyAction: document.getElementById("btn-buy-action"),
  btnZoomImage: document.getElementById("btn-zoom-image"),
  btnEditCurrent: document.getElementById("btn-edit-current"),
  btnDeleteCurrent: document.getElementById("btn-delete-current"),
  
  // Buy Modal
  modalBuy: document.getElementById("modal-buy"),
  modalBuyClose: document.getElementById("modal-buy-close"),
  buyModalThumb: document.getElementById("buy-modal-thumb"),
  buyModalTitle: document.getElementById("buy-modal-title"),
  buyModalPrice: document.getElementById("buy-modal-price"),
  buyTgActionBtn: document.getElementById("buy-tg-action-btn"),
  buyTgBtnLabel: document.getElementById("buy-tg-btn-label"),
  modalDirectDownload: document.getElementById("modal-direct-download"),
  modalDownloadLink: document.getElementById("modal-download-link"),
  
  // Product Add/Edit Modal
  modalProduct: document.getElementById("modal-product"),
  modalProductClose: document.getElementById("modal-product-close"),
  modalProductTitle: document.getElementById("modal-product-title"),
  formProduct: document.getElementById("form-product"),
  btnCancelProduct: document.getElementById("btn-cancel-product"),
  formProdId: document.getElementById("form-prod-id"),
  formTitle: document.getElementById("form-title"),
  formSlug: document.getElementById("form-slug"),
  formPrice: document.getElementById("form-price"),
  formCategory: document.getElementById("form-category"),
  formBadge: document.getElementById("form-badge"),
  formFileInput: document.getElementById("form-file-input"),
  formImageUrl: document.getElementById("form-image-url"),
  imgPreview: document.getElementById("img-preview"),
  imgPreviewPlaceholder: document.getElementById("img-preview-placeholder"),
  formShortDesc: document.getElementById("form-short-desc"),
  formDescription: document.getElementById("form-description"),
  formDownloadUrl: document.getElementById("form-download-url"),
  formContactTg: document.getElementById("form-contact-tg"),
  
  // Settings Modal
  modalSettings: document.getElementById("modal-settings"),
  modalSettingsClose: document.getElementById("modal-settings-close"),
  formSettings: document.getElementById("form-settings"),
  btnCancelSettings: document.getElementById("btn-cancel-settings"),
  settingStoreName: document.getElementById("setting-store-name"),
  settingTelegram: document.getElementById("setting-telegram"),
  settingBio: document.getElementById("setting-bio"),
  settingAvatarFile: document.getElementById("setting-avatar-file"),
  settingAvatarUrl: document.getElementById("setting-avatar-url"),
  settingAvatarPreview: document.getElementById("setting-avatar-preview"),
  settingAdminPin: document.getElementById("setting-admin-pin"),
  settingGithubToken: document.getElementById("setting-github-token"),
  btnExportProducts: document.getElementById("btn-export-products"),
  btnExportSettings: document.getElementById("btn-export-settings"),

  // Admin Security & PIN Modal
  btnAdminLogout: document.getElementById("btn-admin-logout"),
  modalAdminPin: document.getElementById("modal-admin-pin"),
  modalPinClose: document.getElementById("modal-pin-close"),
  formAdminPin: document.getElementById("form-admin-pin"),
  adminPinInput: document.getElementById("admin-pin-input"),
  pinErrorMsg: document.getElementById("pin-error-msg"),
  btnCancelPin: document.getElementById("btn-cancel-pin"),

  // Admin Publish to GitHub
  btnAdminPublish: document.getElementById("btn-admin-publish"),
  modalPublishConfirm: document.getElementById("modal-publish-confirm"),
  modalPublishClose: document.getElementById("modal-publish-close"),
  btnCancelPublish: document.getElementById("btn-cancel-publish"),
  btnStartPublish: document.getElementById("btn-start-publish"),
  publishGithubToken: document.getElementById("publish-github-token"),
  publishStatusBox: document.getElementById("publish-status-box"),
  publishStatusText: document.getElementById("publish-status-text"),

  // Lightbox
  modalLightbox: document.getElementById("modal-lightbox"),
  lightboxImg: document.getElementById("lightbox-img"),
  lightboxClose: document.getElementById("lightbox-close"),
  
  // Toast
  toast: document.getElementById("toast")
};

// ==========================================
// Initialization
// ==========================================

async function init() {
  await Promise.all([loadSettings(), loadProducts()]);
  setupAdminAuth();
  setupEventListeners();
  handleRoute();
}

window.addEventListener("popstate", handleRoute);

// ==========================================
// Media URL Resolver (GitHub Pages & Local Server Compatibility)
// ==========================================

function resolveMediaUrl(url) {
  if (!url) return "uploads/avatar.svg";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  // If running on GitHub Pages or file protocol, ensure relative path
  if (url.startsWith("/")) {
    if (window.location.hostname.includes("github.io") || window.location.protocol === "file:") {
      return url.substring(1);
    }
  }
  return url;
}

// ==========================================
// Data Loaders with Static & LocalStorage Fallback
// ==========================================

async function loadSettings() {
  // 1. Try local backend API
  try {
    const res = await fetch("/api/settings");
    if (res.ok) {
      state.settings = await res.json();
      localStorage.setItem("cosmic_settings", JSON.stringify(state.settings));
      applySettingsToUI();
      return;
    }
  } catch (err) {
    // API not available, proceed to fallback
  }

  // 2. Try localStorage
  const saved = localStorage.getItem("cosmic_settings");
  if (saved) {
    try {
      state.settings = JSON.parse(saved);
      applySettingsToUI();
      return;
    } catch(e) {}
  }

  // 3. Try static data/settings.json
  try {
    const res = await fetch("data/settings.json");
    if (res.ok) {
      state.settings = await res.json();
      localStorage.setItem("cosmic_settings", JSON.stringify(state.settings));
      applySettingsToUI();
      return;
    }
  } catch(e) {}

  applySettingsToUI();
}

function applySettingsToUI() {
  const { store_name, avatar_url, bio, telegram_username } = state.settings;
  elements.navBrandTitle.textContent = store_name || "Arz MODS";
  elements.storeName.textContent = store_name || "Arz MODS";
  document.title = `${store_name} • Workshop`;

  const resolvedAvatar = resolveMediaUrl(avatar_url || "uploads/avatar.svg");
  elements.storeAvatar.src = resolvedAvatar;
  elements.detailAuthorAvatar.src = resolvedAvatar;
  elements.settingAvatarPreview.src = resolvedAvatar;
  
  if (bio) {
    elements.storeBio.textContent = bio;
  }

  const tgClean = (telegram_username || "").replace(/^@/, "");
  elements.storeTgHandle.textContent = `@${tgClean}`;
  elements.storeTgLink.href = `https://t.me/${tgClean}`;
  elements.detailTgContact.href = `https://t.me/${tgClean}`;
  elements.detailAuthorName.textContent = tgClean || "Автор";
}

async function loadProducts() {
  // 1. Try local backend API
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      state.products = await res.json();
      localStorage.setItem("cosmic_products", JSON.stringify(state.products));
      if (elements.statsTotalProducts) {
        elements.statsTotalProducts.textContent = state.products.length;
      }
      filterProducts();
      return;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using static fallback.");
  }

  // 2. Try localStorage (for changes made while on GitHub Pages)
  const saved = localStorage.getItem("cosmic_products");
  if (saved) {
    try {
      state.products = JSON.parse(saved);
      if (elements.statsTotalProducts) {
        elements.statsTotalProducts.textContent = state.products.length;
      }
      filterProducts();
      return;
    } catch(e) {}
  }

  // 3. Try static data/products.json
  try {
    const res = await fetch("data/products.json");
    if (res.ok) {
      state.products = await res.json();
      localStorage.setItem("cosmic_products", JSON.stringify(state.products));
      if (elements.statsTotalProducts) {
        elements.statsTotalProducts.textContent = state.products.length;
      }
      filterProducts();
      return;
    }
  } catch(e) {}

  filterProducts();
}

// ==========================================
// Routing & Views (Hash & Path Hybrid)
// ==========================================

function handleRoute() {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);

  let slug = null;
  if (params.get("p")) {
    slug = params.get("p");
  } else if (hash.startsWith("#/p/")) {
    slug = hash.substring(4);
  } else if (path.startsWith("/p/")) {
    slug = path.substring(3).replace(/\/$/, "");
  } else if (hash.startsWith("#") && hash.length > 2 && !hash.startsWith("#/")) {
    slug = hash.substring(1);
  }

  if (slug) {
    showProductView(slug);
  } else {
    showCatalogView();
  }
}

function navigateToProduct(slug) {
  if (window.location.protocol === "file:" || window.location.hostname.includes("github.io")) {
    history.pushState(null, "", `#/p/${slug}`);
  } else {
    history.pushState(null, "", `/p/${slug}`);
  }
  showProductView(slug);
}

function navigateToCatalog() {
  if (window.location.protocol === "file:" || window.location.hostname.includes("github.io")) {
    history.pushState(null, "", "#/");
  } else {
    history.pushState(null, "", "/");
  }
  showCatalogView();
}

function showCatalogView() {
  elements.catalogView.classList.remove("hidden");
  elements.productView.classList.add("hidden");
  elements.btnBackNav.classList.add("hidden");
  
  // Dynamic SEO meta tags for Catalog
  document.title = `${state.settings.store_name || "Arz MODS"} • Workshop`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", state.settings.bio || "Приватные сборки, топовые скрипты и сочная графика для SA-MP / Arizona RP от Jimi Hopper.");
  }
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function showProductView(slug) {
  let product = state.products.find(p => p.slug === slug || String(p.id) === String(slug));
  
  if (!product) {
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (res.ok) {
        product = await res.json();
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!product) {
    showToast("Товар не найден");
    navigateToCatalog();
    return;
  }

  state.currentProduct = product;
  renderProductDetail(product);

  // Dynamic SEO meta tags for Product
  document.title = `${product.title} • Arz MODS`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", `${product.title}: ${product.short_desc || "Приватный цифровой товар для SA-MP / Arizona RP."}`);
  }
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${product.title} • Arz MODS`);

  elements.catalogView.classList.add("hidden");
  elements.productView.classList.remove("hidden");
  elements.btnBackNav.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderProductDetail(product) {
  elements.breadcrumbCategory.textContent = product.category || "Сборки";
  elements.breadcrumbTitle.textContent = product.title;

  elements.detailTitle.textContent = product.title;
  elements.detailPrice.textContent = product.price;
  elements.detailCurrency.textContent = product.currency || "₽";
  elements.buyButtonText.textContent = `Купить в Telegram за ${product.price} ${product.currency || "₽"}`;

  elements.detailBadge.textContent = product.badge || "Цифровой архив";
  elements.detailCategoryTag.textContent = product.category || "Сборки";

  // Cover image with fallback
  elements.detailImage.src = resolveMediaUrl(product.image_url || "uploads/avatar.svg");

  // Description
  elements.detailDescription.textContent = product.description || product.short_desc || "Подробное описание скоро появится.";

  // Author details
  const authorHandle = (product.contact_tg || state.settings.telegram_username || "").replace(/^@/, "");
  elements.detailAuthorName.textContent = authorHandle || "Jimi_Hopper";
  elements.detailTgContact.href = `https://t.me/${authorHandle}`;
}

// ==========================================
// Catalog Rendering & Filtering
// ==========================================

function filterProducts() {
  const query = state.searchQuery.toLowerCase().trim();
  const category = state.activeCategory;

  state.filteredProducts = state.products.filter(p => {
    const matchesCat = category === "all" || p.category === category;
    const matchesQuery = !query || 
      p.title.toLowerCase().includes(query) || 
      (p.short_desc && p.short_desc.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  renderCatalog();
}

function renderCatalog() {
  const container = elements.productsGrid;
  container.innerHTML = "";

  elements.productsCount.textContent = `${state.filteredProducts.length} ${getNoun(state.filteredProducts.length, "товар", "товара", "товаров")}`;

  if (state.filteredProducts.length === 0) {
    elements.emptyState.classList.remove("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");

  state.filteredProducts.forEach(prod => {
    const card = document.createElement("article");
    card.className = "cosmic-product-card";
    
    const imgUrl = resolveMediaUrl(prod.image_url || "uploads/avatar.svg");
    const badgeText = prod.badge || "Цифровой товар";
    const priceText = `${prod.price} ${prod.currency || "₽"}`;
    const descText = prod.short_desc || prod.description || "";

    card.innerHTML = `
      <div class="card-media-box">
        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(prod.title)}" class="card-img-cover" width="400" height="225" loading="lazy" decoding="async" />
        <span class="card-badge-cosmic">${escapeHtml(badgeText)}</span>
        <span class="card-price-cosmic">${escapeHtml(priceText)}</span>
      </div>
      <div class="card-content-box">
        <div class="card-category-strip">${escapeHtml(prod.category || "Сборки")}</div>
        <h3 class="card-headline">${escapeHtml(prod.title)}</h3>
        <p class="card-snippet">${escapeHtml(descText)}</p>
        <div class="card-bottom-row">
          <span class="card-open-link">
            Смотреть детали
          </span>
          <span class="card-instant-tag">
            Прямая выдача
          </span>
        </div>
      </div>
    `;



    card.addEventListener("click", () => {
      navigateToProduct(prod.slug || prod.id);
    });

    container.appendChild(card);
  });
}

// ==========================================
// Modals & Action Flows
// ==========================================

// 1. Buy Flow
elements.btnBuyAction.addEventListener("click", () => {
  const prod = state.currentProduct;
  if (!prod) return;

  elements.buyModalThumb.src = resolveMediaUrl(prod.image_url || "uploads/avatar.svg");
  elements.buyModalTitle.textContent = prod.title;
  elements.buyModalPrice.textContent = `${prod.price} ${prod.currency || "₽"}`;

  const tgHandle = (prod.contact_tg || state.settings.telegram_username || "jimi_hopper").replace(/^@/, "");
  const defaultMsg = encodeURIComponent(`Привет! Хочу приобрести "${prod.title}" (${prod.price} ${prod.currency || "₽"})`);
  elements.buyTgActionBtn.href = `https://t.me/${tgHandle}?text=${defaultMsg}`;
  elements.buyTgBtnLabel.textContent = `Написать @${tgHandle} в Telegram`;

  // Direct download link if available
  if (prod.download_url && prod.download_url.trim()) {
    elements.modalDirectDownload.classList.remove("hidden");
    elements.modalDownloadLink.href = prod.download_url.trim();
  } else {
    elements.modalDirectDownload.classList.add("hidden");
  }

  elements.modalBuy.classList.remove("hidden");
});

elements.modalBuyClose.addEventListener("click", () => {
  elements.modalBuy.classList.add("hidden");
});

// 2. Lightbox Zoom
elements.btnZoomImage.addEventListener("click", () => {
  if (state.currentProduct && state.currentProduct.image_url) {
    elements.lightboxImg.src = state.currentProduct.image_url;
    elements.modalLightbox.classList.remove("hidden");
  }
});

elements.lightboxClose.addEventListener("click", () => {
  elements.modalLightbox.classList.add("hidden");
});

elements.modalLightbox.addEventListener("click", (e) => {
  if (e.target === elements.modalLightbox) {
    elements.modalLightbox.classList.add("hidden");
  }
});

// 3. Product Add / Edit
function openProductModal(product = null) {
  elements.formProduct.reset();
  elements.imgPreview.classList.add("hidden");
  elements.imgPreviewPlaceholder.classList.remove("hidden");

  if (product) {
    state.editingProductId = product.id;
    elements.modalProductTitle.textContent = "Редактировать товар";
    elements.formProdId.value = product.id;
    elements.formTitle.value = product.title || "";
    elements.formSlug.value = product.slug || "";
    elements.formPrice.value = product.price || 0;
    elements.formCategory.value = product.category || "Сборки";
    elements.formBadge.value = product.badge || "";
    elements.formImageUrl.value = product.image_url || "";
    elements.formShortDesc.value = product.short_desc || "";
    elements.formDescription.value = product.description || "";
    elements.formDownloadUrl.value = product.download_url || "";
    elements.formContactTg.value = product.contact_tg || state.settings.telegram_username || "";

    if (product.image_url) {
      elements.imgPreview.src = product.image_url;
      elements.imgPreview.classList.remove("hidden");
      elements.imgPreviewPlaceholder.classList.add("hidden");
    }
  } else {
    state.editingProductId = null;
    elements.modalProductTitle.textContent = "Добавить новый товар";
    elements.formProdId.value = "";
    elements.formCategory.value = "Сборки";
    elements.formBadge.value = "Хит продаж";
    elements.formContactTg.value = state.settings.telegram_username ? `@${state.settings.telegram_username}` : "";
  }

  elements.modalProduct.classList.remove("hidden");
}

elements.btnAddProduct.addEventListener("click", () => openProductModal());
elements.emptyAddBtn.addEventListener("click", () => openProductModal());
elements.btnEditCurrent.addEventListener("click", () => openProductModal(state.currentProduct));

elements.btnCancelProduct.addEventListener("click", () => elements.modalProduct.classList.add("hidden"));
elements.modalProductClose.addEventListener("click", () => elements.modalProduct.classList.add("hidden"));

// Delete Product
elements.btnDeleteCurrent.addEventListener("click", async () => {
  const prod = state.currentProduct;
  if (!prod) return;

  if (confirm(`Вы действительно хотите удалить "${prod.title}"?`)) {
    let deleted = false;
    try {
      const res = await fetch(`/api/products/${prod.id}`, { method: "DELETE" });
      if (res && res.ok) {
        deleted = true;
      }
    } catch (e) {
      // offline or GitHub Pages
    }

    if (!deleted) {
      state.products = state.products.filter(p => String(p.id) !== String(prod.id));
      localStorage.setItem("cosmic_products", JSON.stringify(state.products));
      deleted = true;

      if (window.location.hostname.includes("github.io") || window.location.protocol === "file:") {
        const savedToken = localStorage.getItem("cosmic_github_token");
        if (savedToken) {
          showToast("Товар удален! Синхронизация с GitHub...");
          startPublishingProcess(true);
        } else {
          markUnpublishedChanges();
          showToast("Товар удален! Нажмите «Опубликовать для всех», чтобы применить на сайте.");
        }
      }
    }

    if (deleted) {
      filterProducts();
      navigateToCatalog();
    }
  }
});

// Image Upload handling
elements.formFileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Data = reader.result;
    elements.imgPreview.src = base64Data;
    elements.imgPreview.classList.remove("hidden");
    elements.imgPreviewPlaceholder.classList.add("hidden");
    // Pre-fill with base64 so it works even if static or offline
    elements.formImageUrl.value = base64Data;

    try {
      showToast("Загрузка обложки...");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_data: base64Data, file_name: file.name })
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          elements.formImageUrl.value = data.url;
          showToast("Изображение загружено!");
          return;
        }
      }
    } catch (err) {
      console.warn("Upload endpoint unreachable, using base64 data URL.");
    }
    showToast("Изображение прикреплено!");
  };
  reader.readAsDataURL(file);
});

elements.formImageUrl.addEventListener("input", (e) => {
  const val = e.target.value.trim();
  if (val) {
    elements.imgPreview.src = resolveMediaUrl(val);
    elements.imgPreview.classList.remove("hidden");
    elements.imgPreviewPlaceholder.classList.add("hidden");
  } else {
    elements.imgPreview.classList.add("hidden");
    elements.imgPreviewPlaceholder.classList.remove("hidden");
  }
});

// Save Product
elements.formProduct.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = elements.formTitle.value.trim();
  let slug = elements.formSlug.value.trim();
  if (!slug) {
    slug = transliterate(title).substring(0, 24);
  }

  const payload = {
    title,
    slug,
    price: parseFloat(elements.formPrice.value) || 0,
    currency: "₽",
    category: elements.formCategory.value,
    badge: elements.formBadge.value.trim(),
    image_url: elements.formImageUrl.value.trim(),
    short_desc: elements.formShortDesc.value.trim(),
    description: elements.formDescription.value.trim(),
    download_url: elements.formDownloadUrl.value.trim(),
    contact_tg: elements.formContactTg.value.trim()
  };

  let savedSuccessfully = false;
  let finalProduct = null;

  try {
    let res;
    if (state.editingProductId) {
      res = await fetch(`/api/products/${state.editingProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (res && res.ok) {
      const data = await res.json();
      if (data.success) {
        savedSuccessfully = true;
        finalProduct = data.product;
      }
    }
  } catch (err) {
    console.warn("API unavailable, fallback to local storage:", err);
  }

  // Fallback for GitHub Pages or offline
  if (!savedSuccessfully) {
    if (state.editingProductId) {
      const idx = state.products.findIndex(p => p.id === state.editingProductId);
      if (idx !== -1) {
        state.products[idx] = { ...state.products[idx], ...payload };
        finalProduct = state.products[idx];
      }
    } else {
      finalProduct = {
        id: Date.now(),
        ...payload,
        created_at: Math.floor(Date.now() / 1000)
      };
      state.products.unshift(finalProduct);
    }
    localStorage.setItem("cosmic_products", JSON.stringify(state.products));
    savedSuccessfully = true;
  }

  if (savedSuccessfully) {
    elements.modalProduct.classList.add("hidden");
    filterProducts();
    if (finalProduct) {
      navigateToProduct(finalProduct.slug || finalProduct.id);
    }
    
    // Check if running on GitHub Pages
    if (window.location.hostname.includes("github.io") || window.location.protocol === "file:") {
      showToast(state.editingProductId ? "Товар обновлен! Нажмите «Опубликовать для всех»." : "Товар добавлен! Нажмите «Опубликовать для всех».");
    } else {
      showToast(state.editingProductId ? "Товар обновлен!" : "Товар добавлен!");
    }
  }
});

// 4. Store Settings Modal
elements.btnOpenSettings.addEventListener("click", () => {
  elements.settingStoreName.value = state.settings.store_name || "";
  elements.settingTelegram.value = (state.settings.telegram_username || "").replace(/^@/, "");
  elements.settingBio.value = state.settings.bio || "";
  elements.settingAvatarUrl.value = state.settings.avatar_url || "";
  elements.settingAvatarPreview.src = resolveMediaUrl(state.settings.avatar_url || "uploads/avatar.svg");
  if (elements.settingAdminPin) {
    elements.settingAdminPin.value = state.settings.admin_pin || "7777";
  }
  if (elements.settingGithubToken) {
    elements.settingGithubToken.value = localStorage.getItem("cosmic_github_token") || "";
  }
  elements.modalSettings.classList.remove("hidden");
});

elements.btnCancelSettings.addEventListener("click", () => elements.modalSettings.classList.add("hidden"));
elements.modalSettingsClose.addEventListener("click", () => elements.modalSettings.classList.add("hidden"));

// Data Export Buttons
if (elements.btnExportProducts) {
  elements.btnExportProducts.addEventListener("click", () => {
    downloadJson("products.json", state.products);
  });
}
if (elements.btnExportSettings) {
  elements.btnExportSettings.addEventListener("click", () => {
    const cleanSettings = { ...state.settings };
    delete cleanSettings.github_token;
    downloadJson("settings.json", cleanSettings);
  });
}

elements.settingAvatarFile.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Data = reader.result;
    elements.settingAvatarPreview.src = base64Data;
    elements.settingAvatarUrl.value = base64Data;

    try {
      showToast("Загрузка аватарки...");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_data: base64Data, file_name: file.name })
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          elements.settingAvatarUrl.value = data.url;
          showToast("Аватарка обновлена!");
          return;
        }
      }
    } catch (err) {
      console.warn("Upload endpoint unreachable, using base64 avatar.");
    }
    showToast("Аватарка прикреплена!");
  };
  reader.readAsDataURL(file);
});

elements.formSettings.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    store_name: elements.settingStoreName.value.trim(),
    telegram_username: elements.settingTelegram.value.trim().replace(/^@/, ""),
    bio: elements.settingBio.value.trim(),
    avatar_url: elements.settingAvatarUrl.value.trim() || "uploads/avatar.svg",
    admin_pin: (elements.settingAdminPin ? elements.settingAdminPin.value.trim() : "") || "7777"
  };

  if (elements.settingGithubToken && elements.settingGithubToken.value.trim()) {
    localStorage.setItem("cosmic_github_token", elements.settingGithubToken.value.trim());
  }

  let saved = false;
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res && res.ok) {
      const data = await res.json();
      state.settings = data.settings;
      saved = true;
    }
  } catch (err) {
    console.warn("API unreachable, saving settings to localStorage");
  }

  if (!saved) {
    state.settings = payload;
  }

  localStorage.setItem("cosmic_settings", JSON.stringify(state.settings));
  applySettingsToUI();
  elements.modalSettings.classList.add("hidden");
  
  if (window.location.hostname.includes("github.io") || window.location.protocol === "file:") {
    showToast("Настройки сохранены! Нажмите «Опубликовать для всех», чтобы выгрузить на сайт.");
  } else {
    showToast("Настройки успешно сохранены!");
  }
});

// ==========================================
// Admin Security & PIN Authentication
// ==========================================

function setAdminMode(active) {
  state.isAdmin = Boolean(active);
  if (state.isAdmin) {
    document.body.classList.add("is-admin");
    localStorage.setItem("cosmic_admin_auth", "true");
  } else {
    document.body.classList.remove("is-admin");
    localStorage.removeItem("cosmic_admin_auth");
  }
}

function openAdminPinModal() {
  if (!elements.modalAdminPin) return;
  if (elements.pinErrorMsg) elements.pinErrorMsg.classList.add("hidden");
  if (elements.adminPinInput) {
    elements.adminPinInput.value = "";
  }
  elements.modalAdminPin.classList.remove("hidden");
  setTimeout(() => {
    if (elements.adminPinInput) elements.adminPinInput.focus();
  }, 100);
}

function closeAdminPinModal() {
  if (elements.modalAdminPin) {
    elements.modalAdminPin.classList.add("hidden");
  }
}

function setupAdminAuth() {
  // 1. Restore auth state if already logged in
  if (localStorage.getItem("cosmic_admin_auth") === "true") {
    setAdminMode(true);
  }

  // 2. Secret link access: check for ?admin or #admin
  const queryStr = window.location.search.toLowerCase();
  const hashStr = window.location.hash.toLowerCase();
  if (queryStr.includes("admin") || hashStr.includes("admin")) {
    if (state.isAdmin) {
      showToast("👑 Режим владельца активен");
    } else {
      openAdminPinModal();
    }
  }

  // 3. Secret logo gesture: 3 clicks within 2.2 seconds
  let brandClicks = [];
  if (elements.navBrandBtn) {
    elements.navBrandBtn.addEventListener("click", () => {
      const now = Date.now();
      brandClicks.push(now);
      brandClicks = brandClicks.filter(t => now - t < 2200);
      if (brandClicks.length >= 3) {
        brandClicks = [];
        if (!state.isAdmin) {
          openAdminPinModal();
        } else {
          showToast("👑 Вы уже в режиме администратора");
        }
      }
    });
  }

  // 4. PIN Submit
  if (elements.formAdminPin) {
    elements.formAdminPin.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = elements.adminPinInput ? elements.adminPinInput.value.trim() : "";
      const validPin = (state.settings && state.settings.admin_pin) ? String(state.settings.admin_pin).trim() : "7777";

      if (entered === validPin) {
        setAdminMode(true);
        closeAdminPinModal();
        showToast("🔓 Доступ разрешен! Панель управления активирована.");
      } else {
        if (elements.pinErrorMsg) {
          elements.pinErrorMsg.classList.remove("hidden");
        }
        if (elements.adminPinInput) {
          elements.adminPinInput.value = "";
          elements.adminPinInput.focus();
        }
      }
    });
  }

  // 5. Cancel / Close buttons
  if (elements.btnCancelPin) {
    elements.btnCancelPin.addEventListener("click", closeAdminPinModal);
  }
  if (elements.modalPinClose) {
    elements.modalPinClose.addEventListener("click", closeAdminPinModal);
  }

  // 6. Logout
  if (elements.btnAdminLogout) {
    elements.btnAdminLogout.addEventListener("click", () => {
      setAdminMode(false);
      showToast("🔒 Вы вышли из режима администратора");
    });
  }
}

// ==========================================
// GitHub Cloud Direct Publishing & Data Export
// ==========================================

function markUnpublishedChanges() {
  if (elements.btnAdminPublish) {
    elements.btnAdminPublish.classList.add("has-unsaved");
  }
}

function clearUnpublishedChanges() {
  if (elements.btnAdminPublish) {
    elements.btnAdminPublish.classList.remove("has-unsaved");
  }
}

function openPublishModal() {
  if (!elements.modalPublishConfirm) return;
  const savedToken = localStorage.getItem("cosmic_github_token") || "";
  if (elements.publishGithubToken) {
    elements.publishGithubToken.value = savedToken;
  }
  if (elements.publishStatusBox) {
    elements.publishStatusBox.classList.add("hidden");
  }
  if (elements.btnStartPublish) {
    elements.btnStartPublish.disabled = false;
    elements.btnStartPublish.textContent = "Опубликовать в репозиторий";
  }
  elements.modalPublishConfirm.classList.remove("hidden");
}

function closePublishModal() {
  if (elements.modalPublishConfirm) {
    elements.modalPublishConfirm.classList.add("hidden");
  }
}

async function uploadOrUpdateFileToGitHub(token, path, contentBase64, commitMsg) {
  const cleanToken = token.trim().replace(/^['"]|['"]$/g, '');
  const repo = "QwertyOzzi/web1";
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  let sha = null;
  try {
    const res = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch (e) {
    // File may not exist yet in repo
  }

  const payload = {
    message: commitMsg,
    content: contentBase64,
    branch: "main"
  };
  if (sha) {
    payload.sha = sha;
  }

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${cleanToken}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!putRes.ok) {
    const errObj = await putRes.json().catch(() => ({}));
    let msg = errObj.message || `HTTP ${putRes.status}`;
    if (putRes.status === 401) {
      msg = "Неверный GitHub токен. Убедитесь, что токен скопирован полностью (начинается на ghp_).";
    } else if (putRes.status === 403 || putRes.status === 404) {
      msg = "Нет прав на запись в репозиторий QwertyOzzi/web1. Убедитесь, что у токена отмечена галочка 'repo'.";
    }
    throw new Error(msg);
  }

  return await putRes.json();
}

function stringToBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function generateSitemapXml(products) {
  const today = new Date().toISOString().split("T")[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <url>\n    <loc>https://qwertyozzi.github.io/web1/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  products.forEach(p => {
    const slug = p.slug || p.id;
    xml += `  <url>\n    <loc>https://qwertyozzi.github.io/web1/?p=${encodeURIComponent(slug)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });
  xml += `</urlset>\n`;
  return xml;
}

function generateLlmsTxt(products, settings) {
  const name = settings.store_name || "Arz MODS";
  const tg = (settings.telegram_username || "jimi_hopper").replace(/^@/, "");
  let txt = `# ${name} Storefront\n\n> ${settings.bio || "Digital storefront for SA-MP / Arizona RP"}\n\n`;
  txt += `## Overview\n- Website: https://qwertyozzi.github.io/web1/\n- Store Owner: Jimi Hopper (@${tg})\n- Contact: https://t.me/${tg}\n\n`;
  txt += `## Products Catalog\n`;
  products.forEach(p => {
    txt += `- [${p.title}](https://qwertyozzi.github.io/web1/?p=${encodeURIComponent(p.slug || p.id)}): ${p.short_desc || p.title}. Price: ${p.price} ${p.currency || "₽"}.\n`;
  });
  return txt;
}

async function startPublishingProcess(isSilent = false) {
  const rawToken = (elements.publishGithubToken ? elements.publishGithubToken.value.trim() : "") || localStorage.getItem("cosmic_github_token") || "";
  const token = rawToken.trim().replace(/^['"]|['"]$/g, '');

  if (!token) {
    openPublishModal();
    return;
  }

  localStorage.setItem("cosmic_github_token", token);

  if (!isSilent) {
    if (elements.btnStartPublish) {
      elements.btnStartPublish.disabled = true;
      elements.btnStartPublish.textContent = "Публикация...";
    }
    if (elements.publishStatusBox) elements.publishStatusBox.classList.remove("hidden");
    if (elements.publishStatusText) elements.publishStatusText.textContent = "1/4 Обработка изображений...";
  } else {
    showToast("⏳ Публикация изменений в репозиторий GitHub...");
  }

  try {
    // 1. Process base64 images in products
    for (let i = 0; i < state.products.length; i++) {
      const p = state.products[i];
      if (p.image_url && p.image_url.startsWith("data:image/")) {
        if (!isSilent && elements.publishStatusText) {
          elements.publishStatusText.textContent = `Загрузка обложки "${p.title}" в GitHub...`;
        }
        const commaIdx = p.image_url.indexOf(",");
        const meta = p.image_url.substring(0, commaIdx);
        const base64Data = p.image_url.substring(commaIdx + 1);
        let ext = ".jpg";
        if (meta.includes("png")) ext = ".png";
        else if (meta.includes("gif")) ext = ".gif";
        else if (meta.includes("webp")) ext = ".webp";
        
        const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`;
        const targetPath = `uploads/${filename}`;
        await uploadOrUpdateFileToGitHub(token, targetPath, base64Data, `Upload product cover ${filename}`);
        p.image_url = targetPath;
      }
    }

    // 2. Process base64 avatar in settings
    if (state.settings.avatar_url && state.settings.avatar_url.startsWith("data:image/")) {
      if (!isSilent && elements.publishStatusText) {
        elements.publishStatusText.textContent = "Загрузка аватарки в GitHub...";
      }
      const commaIdx = state.settings.avatar_url.indexOf(",");
      const base64Data = state.settings.avatar_url.substring(commaIdx + 1);
      const filename = `avatar_${Date.now()}.png`;
      const targetPath = `uploads/${filename}`;
      await uploadOrUpdateFileToGitHub(token, targetPath, base64Data, `Upload avatar ${filename}`);
      state.settings.avatar_url = targetPath;
      applySettingsToUI();
    }

    // 3. Publish data/products.json
    if (!isSilent && elements.publishStatusText) {
      elements.publishStatusText.textContent = "2/4 Обновление каталога товаров (products.json)...";
    }
    const productsJson = JSON.stringify(state.products, null, 2);
    await uploadOrUpdateFileToGitHub(token, "data/products.json", stringToBase64Utf8(productsJson), "Update products catalog via Cosmic Admin");
    localStorage.setItem("cosmic_products", productsJson);

    // 4. Publish data/settings.json
    if (!isSilent && elements.publishStatusText) {
      elements.publishStatusText.textContent = "3/4 Обновление настроек магазина (settings.json)...";
    }
    const settingsClean = { ...state.settings };
    delete settingsClean.github_token;
    const settingsJson = JSON.stringify(settingsClean, null, 2);
    await uploadOrUpdateFileToGitHub(token, "data/settings.json", stringToBase64Utf8(settingsJson), "Update settings via Cosmic Admin");
    localStorage.setItem("cosmic_settings", settingsJson);

    // 5. Update sitemap.xml and llms.txt for SEO & AI assistants
    if (!isSilent && elements.publishStatusText) {
      elements.publishStatusText.textContent = "4/4 Обновление sitemap.xml и llms.txt...";
    }
    try {
      const sitemapContent = generateSitemapXml(state.products);
      await uploadOrUpdateFileToGitHub(token, "sitemap.xml", stringToBase64Utf8(sitemapContent), "Update sitemap.xml");

      const llmsContent = generateLlmsTxt(state.products, state.settings);
      await uploadOrUpdateFileToGitHub(token, "llms.txt", stringToBase64Utf8(llmsContent), "Update llms.txt");
    } catch (e) {
      console.warn("Could not sync sitemap/llms:", e);
    }

    clearUnpublishedChanges();

    if (!isSilent) {
      if (elements.publishStatusText) {
        elements.publishStatusText.textContent = "🎉 Успешно отправлено в репозиторий GitHub!";
      }
      showToast("🚀 Сайт обновлен на GitHub! Через 30–45 секунд изменения появятся для всех посетителей.");
      setTimeout(() => {
        closePublishModal();
      }, 1500);
    } else {
      showToast("✅ Изменения опубликованы на GitHub для всех устройств (через 30–45 сек)");
    }

  } catch (err) {
    console.error("Publish error:", err);
    if (!isSilent) {
      if (elements.publishStatusText) {
        elements.publishStatusText.textContent = `❌ Ошибка: ${err.message}`;
      }
      if (elements.btnStartPublish) {
        elements.btnStartPublish.disabled = false;
        elements.btnStartPublish.textContent = "Попробовать снова";
      }
    } else {
      showToast(`❌ Ошибка отправки на GitHub: ${err.message}`);
      openPublishModal();
    }
  }
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Файл ${filename} скачан!`);
}

// ==========================================
// Event Listeners & Helpers
// ==========================================

function setupEventListeners() {
  elements.navBrandBtn.addEventListener("click", navigateToCatalog);
  elements.btnBackNav.addEventListener("click", navigateToCatalog);
  elements.breadcrumbHome.addEventListener("click", (e) => {
    e.preventDefault();
    navigateToCatalog();
  });

  // Publish to GitHub Button
  if (elements.btnAdminPublish) {
    elements.btnAdminPublish.addEventListener("click", openPublishModal);
  }
  if (elements.btnCancelPublish) {
    elements.btnCancelPublish.addEventListener("click", closePublishModal);
  }
  if (elements.modalPublishClose) {
    elements.modalPublishClose.addEventListener("click", closePublishModal);
  }
  if (elements.btnStartPublish) {
    elements.btnStartPublish.addEventListener("click", startPublishingProcess);
  }

  // ESCAPE Key to go back from product to catalog, or close any open modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.keyCode === 27) {
      // 1. Fullscreen Lightbox
      if (elements.modalLightbox && !elements.modalLightbox.classList.contains("hidden")) {
        elements.modalLightbox.classList.add("hidden");
        return;
      }
      // 2. Open Modals (including PIN and Publish modals)
      const openModals = [
        elements.modalBuy,
        elements.modalProduct,
        elements.modalSettings,
        elements.modalAdminPin,
        elements.modalPublishConfirm
      ];
      const visibleModal = openModals.find(m => m && !m.classList.contains("hidden"));
      if (visibleModal) {
        visibleModal.classList.add("hidden");
        return;
      }
      // 3. If on Product Page, return to Catalog!
      if (elements.productView && !elements.productView.classList.contains("hidden")) {
        navigateToCatalog();
        showToast("Возврат в каталог [ESC]");
      }
    }
  });

  // Share URL
  elements.btnSharePage.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast("Ссылка скопирована в буфер!");
    }).catch(() => {
      showToast("Не удалось скопировать");
    });
  });

  // Search input
  elements.globalSearch.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery.length > 0) {
      elements.searchClearBtn.classList.remove("hidden");
    } else {
      elements.searchClearBtn.classList.add("hidden");
    }
    filterProducts();
  });

  elements.searchClearBtn.addEventListener("click", () => {
    elements.globalSearch.value = "";
    state.searchQuery = "";
    elements.searchClearBtn.classList.add("hidden");
    filterProducts();
  });

  // Categories
  elements.categoriesContainer.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;

    document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");

    state.activeCategory = pill.dataset.cat;
    filterProducts();
  });

  // Overlay click to close modals
  [
    elements.modalBuy,
    elements.modalProduct,
    elements.modalSettings,
    elements.modalAdminPin,
    elements.modalPublishConfirm
  ].forEach(modal => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.add("hidden");
        }
      });
    }
  });
}

function showToast(message) {
  const toast = elements.toast;
  toast.textContent = message;
  toast.classList.remove("hidden");
  
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getNoun(number, one, two, five) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) return five;
  n %= 10;
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return two;
  return five;
}

function transliterate(word) {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  return word.toLowerCase().split('').map(char => {
    return map[char] !== undefined ? map[char] : (char.match(/[a-z0-9]/i) ? char : '-');
  }).join('').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Start Application
document.addEventListener("DOMContentLoaded", init);
