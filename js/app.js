/**
 * 3D FormX - Master Application Logic (India Edition)
 * Inspired by ReiseMoto: Curated inventory, INR (₹) pricing, GST, Quick Add, Indian Pincode & Checkout
 */

const AppState = {
  cart: JSON.parse(localStorage.getItem("3dformx_in_cart")) || [],
  wishlist: JSON.parse(localStorage.getItem("3dformx_in_wishlist")) || [],
  activeCategory: "all",
  activeSort: "featured",
  searchQuery: "",
  coupon: null, // { code: "FORMX10", type: "percent", val: 10 }
  freeShippingThreshold: 5000, // ₹ 5,000 for free shipping across India
  flatShippingRate: 199,
  selectedPincode: localStorage.getItem("3dformx_pincode") || ""
};

// Format currency in Indian Rupees format (e.g. ₹ 1,49,999)
function formatINR(amount) {
  if (isNaN(amount)) return "₹ 0";
  return "₹ " + Math.round(amount).toLocaleString("en-IN");
}

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderCategoryPills();
  renderProductsCatalog();
  updateCartUI();
  updateWishlistUI();
  initSearch();
  initCheckoutEvents();
  initPincodeChecker();
  initStickyHeader();
  initNewsletterForm();
  initBannerSlideshow();
});

// -------------------------------------------------------------
// Category Pills Navigation (Reise Moto Style)
// -------------------------------------------------------------
function renderCategoryPills() {
  const container = document.getElementById("categoryPillsContainer");
  if (!container) return;

  container.innerHTML = CATEGORIES_DATA.map(cat => `
    <button class="cat-pill-btn ${cat.id === AppState.activeCategory ? 'active' : ''}" 
            onclick="setCategory('${cat.id}', this)">
      <i class="${cat.icon} me-2"></i>
      <span>${cat.label}</span>
      <span class="cat-pill-count">${cat.count}</span>
    </button>
  `).join('');
}

// -------------------------------------------------------------
// Products Catalog Rendering
// -------------------------------------------------------------
function renderProductsCatalog() {
  const container = document.getElementById("productsCatalogGrid");
  const countDisplay = document.getElementById("catalogResultsCount");
  if (!container) return;

  let filtered = [...PRODUCTS_DATA];

  // Category filter
  if (AppState.activeCategory !== "all") {
    filtered = filtered.filter(p => p.category === AppState.activeCategory);
  }

  // Search filter
  if (AppState.searchQuery.trim() !== "") {
    const q = AppState.searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.shortDesc.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (AppState.activeSort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (AppState.activeSort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (AppState.activeSort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} products`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fa-solid fa-box-open fa-3x text-orange mb-3"></i>
        <h4 class="text-white">No products found in this category</h4>
        <p class="text-muted-dark">Try searching for other printers, filaments or clear the filters.</p>
        <button class="btn btn-outline-formx mt-2" onclick="resetFilters()">View All Products</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(product => {
    const isWishlisted = AppState.wishlist.includes(product.id);
    const hasDiscount = product.mrp && product.mrp > product.price;

    return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
        <div class="reise-product-card" data-product-id="${product.id}">
          
          <!-- Badges (Reise Moto Style) -->
          <div class="product-badges-wrap">
            ${product.badge ? `<span class="reise-badge reise-badge--${product.badgeType || 'trending'}">${product.badge}</span>` : ''}
            ${hasDiscount ? `<span class="reise-badge reise-badge--discount">Save ${product.discountPct}%</span>` : ''}
          </div>

          <!-- Wishlist Button -->
          <button class="product-wishlist-icon ${isWishlisted ? 'active' : ''}" 
                  onclick="toggleWishlist('${product.id}')" 
                  title="${isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}">
            <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
          </button>

          <!-- Image Box with hover swap -->
          <div class="product-card-media" onclick="openQuickView('${product.id}')">
            <img src="${product.image}" alt="${product.name}" class="product-img-primary" loading="lazy">
            ${product.secondaryImage ? `<img src="${product.secondaryImage}" alt="${product.name}" class="product-img-secondary" loading="lazy">` : ''}
            
            <button class="quick-view-hover-btn" onclick="event.stopPropagation(); openQuickView('${product.id}')">
              <i class="fa-regular fa-eye me-1"></i> Quick View
            </button>
          </div>

          <!-- Content / Info -->
          <div class="product-card-content">
            <div class="product-brand-tag">${product.brand}</div>
            <h3 class="product-title" onclick="openQuickView('${product.id}')" title="${product.name}">
              ${product.name}
            </h3>

            <!-- Rating -->
            <div class="product-rating-row">
              <div class="stars-gold">${getStarRatingHTML(product.rating)}</div>
              <span class="rating-count">(${product.reviewsCount})</span>
            </div>

            <!-- Price & Tax (Reise Moto Style) -->
            <div class="product-price-section">
              <div class="d-flex align-items-baseline gap-2 flex-wrap">
                <span class="price-current">${formatINR(product.price)}</span>
                ${hasDiscount ? `<span class="price-mrp">${formatINR(product.mrp)}</span>` : ''}
                ${hasDiscount ? `<span class="price-discount-tag">(${product.discountPct}% OFF)</span>` : ''}
              </div>
              <div class="tax-inclusive-tag">MRP inclusive of all Taxes (18% GST)</div>
            </div>

            <!-- Variant Swatches / Quick Options -->
            ${product.variants && product.variants.length > 1 ? `
              <div class="product-variant-pills">
                ${product.variants.slice(0, 3).map((v, i) => `
                  <span class="variant-pill ${i === 0 ? 'selected' : ''}" title="${v.label}">
                    ${v.label.split(' ')[0]}
                  </span>
                `).join('')}
              </div>
            ` : ''}

            <!-- Add to Cart Action -->
            <div class="product-card-action">
              <button class="btn-reise-add-cart" onclick="addToCart('${product.id}')">
                <i class="fa-solid fa-cart-shopping me-1"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getStarRatingHTML(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars += '<i class="fa-solid fa-star"></i>';
    } else if (i - 0.5 <= rating) {
      stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    } else {
      stars += '<i class="fa-regular fa-star"></i>';
    }
  }
  return stars;
}

window.setCategory = function(catKey, elem) {
  AppState.activeCategory = catKey;
  document.querySelectorAll(".cat-pill-btn").forEach(btn => btn.classList.remove("active"));
  if (elem) elem.classList.add("active");
  renderProductsCatalog();
};

window.setSort = function(sortKey) {
  AppState.activeSort = sortKey;
  renderProductsCatalog();
};

window.resetFilters = function() {
  AppState.activeCategory = "all";
  AppState.activeSort = "featured";
  AppState.searchQuery = "";
  const input = document.getElementById("reiseSearchInput");
  if (input) input.value = "";
  renderCategoryPills();
  renderProductsCatalog();
};

// -------------------------------------------------------------
// Live Search System (Reise Moto Style Drawer/Field)
// -------------------------------------------------------------
function initSearch() {
  const input = document.getElementById("reiseSearchInput");
  const resultsBox = document.getElementById("reiseSearchResults");
  if (!input) return;

  let debounce;
  input.addEventListener("input", (e) => {
    clearTimeout(debounce);
    const query = e.target.value.trim().toLowerCase();
    AppState.searchQuery = query;

    if (query.length < 2) {
      if (resultsBox) {
        resultsBox.classList.remove("show");
        resultsBox.innerHTML = "";
      }
      renderProductsCatalog();
      return;
    }

    debounce = setTimeout(() => {
      renderProductsCatalog();

      if (resultsBox) {
        const matches = PRODUCTS_DATA.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.categoryLabel.toLowerCase().includes(query)
        ).slice(0, 5);

        if (matches.length > 0) {
          resultsBox.innerHTML = matches.map(item => `
            <div class="search-item" onclick="openQuickView('${item.id}'); document.getElementById('reiseSearchResults').classList.remove('show');">
              <img src="${item.image}" alt="${item.name}" class="search-item-thumb">
              <div class="flex-grow-1">
                <div class="small text-orange fw-bold">${item.categoryLabel}</div>
                <div class="fw-semibold text-white small text-truncate" style="max-width: 220px;">${item.name}</div>
                <div class="text-orange font-mono small">${formatINR(item.price)}</div>
              </div>
            </div>
          `).join('');
          resultsBox.classList.add("show");
        } else {
          resultsBox.innerHTML = `<div class="p-3 text-center text-muted-dark small">No matching 3D gear found.</div>`;
          resultsBox.classList.add("show");
        }
      }
    }, 200);
  });

  document.addEventListener("click", (e) => {
    if (resultsBox && !input.contains(e.target) && !resultsBox.contains(e.target)) {
      resultsBox.classList.remove("show");
    }
  });
}

// -------------------------------------------------------------
// Cart Management (Reise Moto Style Drawer)
// -------------------------------------------------------------
window.addToCart = function(productId, qty = 1, variantLabel = null) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const chosenVariant = variantLabel || (product.variants && product.variants.length > 0 ? product.variants[0].label : "Standard");
  const cartKey = `${productId}_${chosenVariant}`;

  const existingIndex = AppState.cart.findIndex(item => item.cartKey === cartKey);
  if (existingIndex > -1) {
    AppState.cart[existingIndex].quantity += qty;
  } else {
    AppState.cart.push({
      cartKey: cartKey,
      product: product,
      variant: chosenVariant,
      quantity: qty
    });
  }

  saveCart();
  updateCartUI();
  showToast("Added to Cart", `${product.name} (${chosenVariant}) added.`, "cart");

  // Open cart drawer
  const drawerEl = document.getElementById("reiseCartDrawer");
  if (drawerEl && typeof bootstrap !== "undefined") {
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(drawerEl);
    bsOffcanvas.show();
  }
};

window.removeFromCart = function(index) {
  const item = AppState.cart[index];
  if (item) {
    AppState.cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast("Removed", `${item.product.name} removed from cart.`, "info");
  }
};

window.updateCartQty = function(index, delta) {
  if (AppState.cart[index]) {
    AppState.cart[index].quantity += delta;
    if (AppState.cart[index].quantity <= 0) {
      removeFromCart(index);
      return;
    }
    saveCart();
    updateCartUI();
  }
};

function saveCart() {
  localStorage.setItem("3dformx_in_cart", JSON.stringify(AppState.cart));
}

function updateCartUI() {
  const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update Badges
  document.querySelectorAll(".cart-count-badge").forEach(badge => {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? "inline-flex" : "none";
  });

  const itemsContainer = document.getElementById("cartDrawerItems");
  const subtotalDisplay = document.getElementById("cartSubtotalDisplay");
  const totalDisplay = document.getElementById("cartTotalDisplay");
  const discountRow = document.getElementById("cartDiscountRow");
  const discountAmountEl = document.getElementById("cartDiscountDisplay");
  const shippingMsg = document.getElementById("freeShippingMsg");
  const shippingBar = document.getElementById("freeShippingBar");

  if (!itemsContainer) return;

  const subtotal = getCartSubtotal();
  const discount = getDiscountAmount(subtotal);
  const isFreeShipping = subtotal >= AppState.freeShippingThreshold || subtotal === 0;
  const shippingCharge = isFreeShipping ? 0 : AppState.flatShippingRate;
  const grandTotal = Math.max(0, subtotal - discount + (subtotal > 0 ? shippingCharge : 0));

  // Free shipping progress (Reise Moto style)
  if (shippingBar && shippingMsg) {
    const progressPct = Math.min(100, Math.round((subtotal / AppState.freeShippingThreshold) * 100));
    shippingBar.style.width = `${progressPct}%`;

    if (subtotal >= AppState.freeShippingThreshold) {
      shippingMsg.innerHTML = `<span class="text-success"><i class="fa-solid fa-circle-check me-1"></i> You have unlocked <strong>FREE Express Shipping</strong> across India!</span>`;
    } else {
      const remaining = AppState.freeShippingThreshold - subtotal;
      shippingMsg.innerHTML = `Spend <strong>${formatINR(remaining)}</strong> more to reach <strong>FREE Pan-India Shipping</strong>!`;
    }
  }

  if (AppState.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="text-center py-5">
        <i class="fa-solid fa-cart-arrow-down fa-3x text-muted-dark mb-3"></i>
        <h5 class="text-white">Your cart is currently empty.</h5>
        <p class="text-muted-dark small mb-4">Discover our high-speed printers, carbon filaments & resins.</p>
        <button class="btn btn-primary-formx btn-sm" data-bs-dismiss="offcanvas" onclick="location.href='#catalogSection'">
          Explore Bestsellers
        </button>
      </div>
    `;
    if (subtotalDisplay) subtotalDisplay.textContent = formatINR(0);
    if (totalDisplay) totalDisplay.textContent = formatINR(0);
    if (discountRow) discountRow.classList.add("d-none");
    return;
  }

  itemsContainer.innerHTML = AppState.cart.map((item, idx) => `
    <div class="cart-drawer-item">
      <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-thumb">
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-start">
          <div class="cart-item-title">${item.product.name}</div>
          <button class="cart-item-del-btn" onclick="removeFromCart(${idx})" title="Remove item">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
        <div class="cart-item-variant">${item.variant}</div>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div class="cart-stepper">
            <button onclick="updateCartQty(${idx}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQty(${idx}, 1)">+</button>
          </div>
          <div class="cart-item-price">${formatINR(item.product.price * item.quantity)}</div>
        </div>
      </div>
    </div>
  `).join('');

  if (subtotalDisplay) subtotalDisplay.textContent = formatINR(subtotal);
  if (totalDisplay) totalDisplay.textContent = formatINR(grandTotal);

  if (discount > 0 && discountRow && discountAmountEl) {
    discountRow.classList.remove("d-none");
    discountAmountEl.textContent = `-${formatINR(discount)}`;
  } else if (discountRow) {
    discountRow.classList.add("d-none");
  }
}

function getCartSubtotal() {
  return AppState.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
}

function getDiscountAmount(subtotal) {
  if (!AppState.coupon) return 0;
  if (AppState.coupon.type === "percent") {
    return subtotal * (AppState.coupon.val / 100);
  }
  return AppState.coupon.val;
}

window.applyIndianCoupon = function() {
  const input = document.getElementById("cartCouponInput");
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === "FORMX10") {
    AppState.coupon = { code: "FORMX10", type: "percent", val: 10 };
    showToast("Coupon Applied", "10% VIP Inaugural Discount Applied!", "success");
    updateCartUI();
  } else if (code === "DIWALI500") {
    AppState.coupon = { code: "DIWALI500", type: "fixed", val: 500 };
    showToast("Coupon Applied", "₹ 500 Festive Credit Applied!", "success");
    updateCartUI();
  } else {
    showToast("Invalid Code", "Please enter 'FORMX10' for 10% OFF or 'DIWALI500'.", "warning");
  }
};

// -------------------------------------------------------------
// Wishlist System
// -------------------------------------------------------------
window.toggleWishlist = function(productId) {
  const index = AppState.wishlist.indexOf(productId);
  const product = PRODUCTS_DATA.find(p => p.id === productId);

  if (index > -1) {
    AppState.wishlist.splice(index, 1);
    showToast("Wishlist", `${product ? product.name : 'Item'} removed from wishlist.`, "info");
  } else {
    AppState.wishlist.push(productId);
    showToast("Wishlist", `${product ? product.name : 'Item'} saved to wishlist!`, "wishlist");
  }

  localStorage.setItem("3dformx_in_wishlist", JSON.stringify(AppState.wishlist));
  updateWishlistUI();
  renderProductsCatalog();
};

function updateWishlistUI() {
  const count = AppState.wishlist.length;
  document.querySelectorAll(".wishlist-count-badge").forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? "inline-flex" : "none";
  });

  const listEl = document.getElementById("wishlistItemsList");
  if (!listEl) return;

  if (count === 0) {
    listEl.innerHTML = `
      <div class="text-center py-5">
        <i class="fa-regular fa-heart fa-3x text-muted-dark mb-3"></i>
        <h5 class="text-white">Your wishlist is empty</h5>
        <p class="text-muted-dark small">Tap the heart on any product to save it for quick access.</p>
      </div>
    `;
    return;
  }

  const items = PRODUCTS_DATA.filter(p => AppState.wishlist.includes(p.id));
  listEl.innerHTML = items.map(p => `
    <div class="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary mb-2 rounded bg-card">
      <div class="d-flex align-items-center gap-3">
        <img src="${p.image}" alt="${p.name}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px;">
        <div>
          <h6 class="text-white mb-0 small fw-bold">${p.name}</h6>
          <span class="text-orange fw-bold font-mono">${formatINR(p.price)}</span>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-primary-formx" onclick="addToCart('${p.id}'); toggleWishlist('${p.id}');">
          Move to Cart
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="toggleWishlist('${p.id}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// Quick View Modal
// -------------------------------------------------------------
window.openQuickView = function(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const modalImg = document.getElementById("quickViewImg");
  const modalBadge = document.getElementById("quickViewBadge");
  const modalTitle = document.getElementById("quickViewTitle");
  const modalPrice = document.getElementById("quickViewPrice");
  const modalMrp = document.getElementById("quickViewMrp");
  const modalDiscount = document.getElementById("quickViewDiscount");
  const modalDesc = document.getElementById("quickViewDesc");
  const modalSpecs = document.getElementById("quickViewSpecs");
  const modalFeatures = document.getElementById("quickViewFeatures");
  const variantSelect = document.getElementById("quickViewVariantSelect");
  const addBtn = document.getElementById("quickViewAddBtn");

  if (modalImg) modalImg.src = product.image;
  if (modalBadge) {
    if (product.badge) {
      modalBadge.textContent = product.badge;
      modalBadge.className = `reise-badge reise-badge--${product.badgeType || 'trending'} position-static`;
      modalBadge.style.display = "inline-block";
    } else {
      modalBadge.style.display = "none";
    }
  }
  if (modalTitle) modalTitle.textContent = product.name;
  if (modalPrice) modalPrice.textContent = formatINR(product.price);
  if (modalMrp) modalMrp.textContent = product.mrp ? formatINR(product.mrp) : '';
  if (modalDiscount) modalDiscount.textContent = product.discountPct ? `(${product.discountPct}% OFF)` : '';
  if (modalDesc) modalDesc.textContent = product.shortDesc;

  // Variants dropdown
  if (variantSelect) {
    if (product.variants && product.variants.length > 0) {
      variantSelect.innerHTML = product.variants.map(v => `
        <option value="${v.label}">${v.label} ${v.inStock ? '(In Stock)' : '(Out of Stock)'}</option>
      `).join('');
      variantSelect.parentElement.classList.remove("d-none");
    } else {
      variantSelect.parentElement.classList.add("d-none");
    }
  }

  // Specs Table
  if (modalSpecs) {
    modalSpecs.innerHTML = Object.entries(product.specs).map(([k, v]) => `
      <tr>
        <th class="text-muted-dark small" style="width: 40%;">${k}</th>
        <td class="text-white small font-mono">${v}</td>
      </tr>
    `).join('');
  }

  // Features List
  if (modalFeatures) {
    modalFeatures.innerHTML = product.features.map(f => `
      <li class="mb-1"><i class="fa-solid fa-check text-orange me-2"></i>${f}</li>
    `).join('');
  }

  if (addBtn) {
    addBtn.onclick = () => {
      const qtyInput = document.getElementById("quickViewQty");
      const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
      const chosenVar = variantSelect ? variantSelect.value : null;
      addToCart(product.id, qty, chosenVar);

      const modalEl = document.getElementById("quickViewModal");
      if (modalEl && typeof bootstrap !== "undefined") {
        bootstrap.Modal.getInstance(modalEl)?.hide();
      }
    };
  }

  const modalEl = document.getElementById("quickViewModal");
  if (modalEl && typeof bootstrap !== "undefined") {
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
};

// -------------------------------------------------------------
// Pincode Delivery Estimator (India Specific)
// -------------------------------------------------------------
function initPincodeChecker() {
  const pinInput = document.getElementById("pincodeCheckInput");
  const pinBtn = document.getElementById("pincodeCheckBtn");
  const resultMsg = document.getElementById("pincodeResultMsg");

  if (!pinBtn || !pinInput) return;

  function checkPincode() {
    const pin = pinInput.value.trim();
    if (!/^\d{6}$/.test(pin)) {
      resultMsg.innerHTML = `<span class="text-danger small"><i class="fa-solid fa-circle-exclamation me-1"></i> Please enter a valid 6-digit Indian PIN code.</span>`;
      return;
    }

    resultMsg.innerHTML = `<span class="spinner-border spinner-border-sm text-orange me-1"></span> Checking courier logistics...`;

    setTimeout(() => {
      AppState.selectedPincode = pin;
      localStorage.setItem("3dformx_pincode", pin);

      // Estimated logistics calculation
      const metroPrefixes = ["11", "12", "40", "41", "56", "57", "60", "50", "70", "38"];
      const isMetro = metroPrefixes.some(pref => pin.startsWith(pref));

      if (isMetro) {
        resultMsg.innerHTML = `
          <div class="p-2 mt-2 rounded bg-input border border-success-subtle text-success small">
            <i class="fa-solid fa-truck-fast me-1"></i> <strong>Express Delivery: Within 24-48 Hours</strong> to ${pin} via Bluedart Air Cargo.<br>
            <span class="text-muted-dark">Cash on Delivery & 0% EMI Available.</span>
          </div>
        `;
      } else {
        resultMsg.innerHTML = `
          <div class="p-2 mt-2 rounded bg-input border border-secondary text-white small">
            <i class="fa-solid fa-truck-fast text-orange me-1"></i> <strong>Standard Delivery: 3-4 Business Days</strong> to ${pin} via Delhivery Express.<br>
            <span class="text-muted-dark">Prepaid & COD options active.</span>
          </div>
        `;
      }
    }, 600);
  }

  pinBtn.addEventListener("click", checkPincode);
  pinInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkPincode();
  });
}

// -------------------------------------------------------------
// Indian E-Commerce Multi-Step Checkout Modal
// -------------------------------------------------------------
function initCheckoutEvents() {
  const checkoutBtn = document.getElementById("checkoutDrawerBtn");
  const modalEl = document.getElementById("indiaCheckoutModal");
  const nextBtn = document.getElementById("checkoutNextBtn");
  const prevBtn = document.getElementById("checkoutPrevBtn");
  const payBtn = document.getElementById("checkoutPayBtn");

  let currentStep = 1;

  if (checkoutBtn && modalEl) {
    checkoutBtn.addEventListener("click", () => {
      if (AppState.cart.length === 0) {
        showToast("Cart Empty", "Please add items to cart before proceeding.", "warning");
        return;
      }

      // Hide offcanvas
      const offcanvasEl = document.getElementById("reiseCartDrawer");
      if (offcanvasEl && typeof bootstrap !== "undefined") {
        bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();
      }

      // Show modal
      setCheckoutStep(1);
      updateCheckoutSummary();
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    });
  }

  function setCheckoutStep(step) {
    currentStep = step;
    document.querySelectorAll(".checkout-pane").forEach(pane => {
      pane.classList.toggle("d-none", parseInt(pane.getAttribute("data-step")) !== step);
    });

    document.querySelectorAll(".checkout-step-pill").forEach(pill => {
      const pStep = parseInt(pill.getAttribute("data-step"));
      pill.classList.toggle("active", pStep === step);
      pill.classList.toggle("completed", pStep < step);
    });

    if (prevBtn) prevBtn.classList.toggle("d-none", step === 1);
    if (nextBtn) nextBtn.classList.toggle("d-none", step === 3);
    if (payBtn) payBtn.classList.toggle("d-none", step !== 3);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentStep === 1) {
        const form = document.getElementById("checkoutContactForm");
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }
      } else if (currentStep === 2) {
        const form = document.getElementById("checkoutAddressForm");
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }
      }
      setCheckoutStep(currentStep + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      setCheckoutStep(currentStep - 1);
    });
  }

  if (payBtn) {
    payBtn.addEventListener("click", () => {
      payBtn.disabled = true;
      payBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Processing Payment via Gateway...`;

      setTimeout(() => {
        payBtn.disabled = false;
        payBtn.innerHTML = `Pay & Confirm Order`;

        const orderId = `FX-IN-${Math.floor(100000 + Math.random() * 900000)}`;
        const orderIdEl = document.getElementById("confirmedOrderId");
        if (orderIdEl) orderIdEl.textContent = orderId;

        document.querySelectorAll(".checkout-pane").forEach(p => p.classList.add("d-none"));
        const successPane = document.getElementById("checkoutSuccessPane");
        if (successPane) successPane.classList.remove("d-none");
        if (prevBtn) prevBtn.classList.add("d-none");
        if (payBtn) payBtn.classList.add("d-none");

        // Clear cart
        AppState.cart = [];
        saveCart();
        updateCartUI();

        if (typeof confetti === "function") {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ff6a00', '#ff9100', '#ffffff', '#ffd700']
          });
        }

        showToast("Order Placed!", `Order #${orderId} confirmed with 18% GST invoice.`, "success");
      }, 1400);
    });
  }
}

function updateCheckoutSummary() {
  const container = document.getElementById("checkoutSummaryItems");
  const subtotalEl = document.getElementById("checkoutSummarySubtotal");
  const shippingEl = document.getElementById("checkoutSummaryShipping");
  const totalEl = document.getElementById("checkoutSummaryTotal");

  if (!container) return;

  const subtotal = getCartSubtotal();
  const discount = getDiscountAmount(subtotal);
  const isFree = subtotal >= AppState.freeShippingThreshold || subtotal === 0;
  const shipping = isFree ? 0 : AppState.flatShippingRate;
  const grandTotal = Math.max(0, subtotal - discount + (subtotal > 0 ? shipping : 0));

  container.innerHTML = AppState.cart.map(item => `
    <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary small">
      <div>
        <span class="text-white fw-bold">${item.product.name}</span>
        <span class="text-muted-dark font-mono"> x${item.quantity}</span>
        <div class="text-muted-dark" style="font-size: 0.72rem;">${item.variant}</div>
      </div>
      <div class="text-orange font-mono fw-bold">${formatINR(item.product.price * item.quantity)}</div>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (shippingEl) shippingEl.textContent = isFree ? "FREE Pan-India" : formatINR(shipping);
  if (totalEl) totalEl.textContent = formatINR(grandTotal);
}

// -------------------------------------------------------------
// Toast Notification Engine
// -------------------------------------------------------------
function showToast(title, message, type = "info") {
  const container = document.getElementById("reiseToastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "reise-toast";

  let icon = "fa-solid fa-circle-info text-info";
  if (type === "cart") icon = "fa-solid fa-cart-shopping text-orange";
  if (type === "wishlist") icon = "fa-solid fa-heart text-danger";
  if (type === "success") icon = "fa-solid fa-circle-check text-success";
  if (type === "warning") icon = "fa-solid fa-triangle-exclamation text-warning";

  toast.innerHTML = `
    <i class="${icon} fa-lg"></i>
    <div class="flex-grow-1">
      <div class="fw-bold small text-white">${title}</div>
      <div class="small text-muted-dark">${message}</div>
    </div>
    <button type="button" class="btn-close btn-close-white btn-sm" onclick="this.parentElement.remove()"></button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// -------------------------------------------------------------
// Sticky Header & Newsletter
// -------------------------------------------------------------
function initStickyHeader() {
  const header = document.querySelector(".reise-header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("is-sticky");
    } else {
      header.classList.remove("is-sticky");
    }
  });
}

function initNewsletterForm() {
  const form = document.getElementById("reiseNewsletterForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Subscribed", "You have unlocked ₹ 500 Welcome Voucher. Code: DIWALI500", "success");
      form.reset();
    });
  }
}

// -------------------------------------------------------------
// Banner Slideshow (Reise Moto Style Auto Carousel)
// -------------------------------------------------------------
function initBannerSlideshow() {
  const carouselEl = document.getElementById("reiseHeroCarousel");
  if (carouselEl && typeof bootstrap !== "undefined") {
    new bootstrap.Carousel(carouselEl, {
      interval: 4500,
      ride: "carousel",
      pause: "hover"
    });
  }
}
