
"use strict";

/* =========================================
   MYNTRA-INSPIRED FASHION STORE
   HTML + CSS + VANILLA JAVASCRIPT
   ========================================= */

const products = [
    {
        id: 1,
        brand: "STYLE STUDIO",
        name: "Elegant Everyday Dress",
        price: 899,
        originalPrice: 1499,
        category: "women",
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        brand: "URBAN BASICS",
        name: "Classic Cotton T-Shirt",
        price: 699,
        originalPrice: 999,
        category: "men",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        brand: "PRETTY PICKS",
        name: "Summer Style Dress",
        price: 1299,
        originalPrice: 1999,
        category: "women",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        brand: "TREND THEORY",
        name: "Everyday Casual Wear",
        price: 1499,
        originalPrice: 1999,
        category: "men",
        image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        brand: "CHIC AVENUE",
        name: "Modern Fashion Outfit",
        price: 799,
        originalPrice: 999,
        category: "women",
        image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        brand: "STREET MODE",
        name: "Men's Casual Shirt",
        price: 1049,
        originalPrice: 1499,
        category: "men",
        image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        brand: "LITTLE LOOKS",
        name: "Little Everyday Outfit",
        price: 599,
        originalPrice: 799,
        category: "kids",
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        brand: "GLOW ESSENTIALS",
        name: "Beauty Essentials",
        price: 849,
        originalPrice: 999,
        category: "beauty",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80"
    }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const productGrid = $("#productGrid");
const searchInput = $("#searchInput");
const clearSearch = $("#clearSearch");
const sortSelect = $("#sortSelect");
const filterBar = $("#filterBar");
const resultText = $("#resultText");
const emptyState = $("#emptyState");
const bagCount = $("#bagCount");
const bagItems = $("#bagItems");
const bagTotal = $("#bagTotal");
const drawerCount = $("#drawerCount");
const wishlistItems = $("#wishlistItems");
const wishlistCount = $("#wishlistCount");
const overlay = $("#overlay");
const bagDrawer = $("#bagDrawer");
const wishlistDrawer = $("#wishlistDrawer");
const toast = $("#toast");

let activeCategory = "all";
let wishlistOnly = false;
let toastTimer;

/* Safe browser storage helpers */

function readStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
    } catch (error) {
        console.warn("Could not read saved data:", error);
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Could not save data:", error);
        showToast("Browser storage is unavailable.");
    }
}

let bag = readStorage("fashionBag", []);
let wishlist = readStorage("fashionWishlist", []);

if (!Array.isArray(bag)) bag = [];
if (!Array.isArray(wishlist)) wishlist = [];

/* Validate saved product IDs and quantities */

bag = bag
    .filter(item =>
        item &&
        products.some(product => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    )
    .map(item => ({
        id: item.id,
        quantity: Math.min(item.quantity, 99)
    }));

wishlist = [...new Set(wishlist.filter(id =>
    Number.isInteger(id) && products.some(p => p.id === id)
))];

/* Helpers */

function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function getProduct(id) {
    return products.find(product => product.id === id);
}

function getDiscount(product) {
    return Math.round(
        (1 - product.price / product.originalPrice) * 100
    );
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}

function saveBag() {
    writeStorage("fashionBag", bag);
}

function saveWishlist() {
    writeStorage("fashionWishlist", wishlist);
}

/* Render product cards */

function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();

    let visibleProducts = products.filter(product => {
        const matchesCategory =
            activeCategory === "all" ||
            product.category === activeCategory;

        const matchesSearch = [
            product.name,
            product.brand,
            product.category
        ].some(value => value.toLowerCase().includes(query));

        const matchesWishlist =
            !wishlistOnly || wishlist.includes(product.id);

        return matchesCategory && matchesSearch && matchesWishlist;
    });

    switch (sortSelect.value) {
        case "low":
            visibleProducts.sort((a, b) => a.price - b.price);
            break;

        case "high":
            visibleProducts.sort((a, b) => b.price - a.price);
            break;

        case "discount":
            visibleProducts.sort(
                (a, b) => getDiscount(b) - getDiscount(a)
            );
            break;
    }

    productGrid.innerHTML = visibleProducts.map(product => {
        const saved = wishlist.includes(product.id);

        return `
            <article class="product-card">
                <div class="product-image">
                    <span class="discount">
                        ${getDiscount(product)}% OFF
                    </span>

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                    >

                    <button
                        class="wishlist-btn ${saved ? "is-saved" : ""}"
                        data-action="wishlist"
                        data-id="${product.id}"
                        aria-label="${saved ? "Remove from" : "Add to"} wishlist"
                        aria-pressed="${saved}"
                        type="button"
                    >${saved ? "♥" : "♡"}</button>
                </div>

                <div class="product-info">
                    <p class="brand">${product.brand}</p>
                    <p class="product-name">${product.name}</p>

                    <div class="price">
                        <span>${formatPrice(product.price)}</span>
                        <del>${formatPrice(product.originalPrice)}</del>
                        <span class="discount-text">
                            (${getDiscount(product)}% off)
                        </span>
                    </div>

                    <button
                        class="bag-button"
                        data-action="add-bag"
                        data-id="${product.id}"
                        type="button"
                    >ADD TO BAG +</button>
                </div>
            </article>
        `;
    }).join("");

    emptyState.hidden = visibleProducts.length !== 0;
    productGrid.hidden = visibleProducts.length === 0;

    resultText.textContent = wishlistOnly
        ? `${visibleProducts.length} saved favourite${visibleProducts.length === 1 ? "" : "s"}`
        : `${visibleProducts.length} product${visibleProducts.length === 1 ? "" : "s"} to explore`;

    $$(".filter-chip").forEach(button => {
        const active =
            !wishlistOnly &&
            button.dataset.category === activeCategory;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });

    clearSearch.hidden = !searchInput.value;
}

/* Category filtering */

function setCategory(category) {
    activeCategory = category;
    wishlistOnly = false;

    renderProducts();
}

filterBar.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    setCategory(button.dataset.category);
});

$$(".category-card").forEach(button => {
    button.addEventListener("click", () => {
        setCategory(button.dataset.category);

        $("#products").scrollIntoView({
            behavior: "smooth"
        });
    });
});

/* Navigation category links */

$$(".nav-links [data-filter], .footer-column [data-filter]").forEach(link => {
    link.addEventListener("click", () => {
        setCategory(link.dataset.filter);

        $$(".nav-links a").forEach(navLink => {
            navLink.classList.toggle(
                "active",
                navLink.dataset.filter === link.dataset.filter
            );
        });
    });
});

/* Search and sorting */

searchInput.addEventListener("input", () => {
    wishlistOnly = false;
    renderProducts();
});

clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    renderProducts();
    searchInput.focus();
});

sortSelect.addEventListener("change", renderProducts);

$("#resetFilters").addEventListener("click", () => {
    searchInput.value = "";
    sortSelect.value = "featured";
    activeCategory = "all";
    wishlistOnly = false;
    renderProducts();
});

/* Wishlist */

function toggleWishlist(id) {
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(itemId => itemId !== id);
        showToast("Removed from your wishlist.");
    } else {
        wishlist.push(id);
        showToast("Added to your wishlist ♡");
    }

    saveWishlist();
    renderProducts();
    renderWishlist();
}

productGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "wishlist") {
        toggleWishlist(id);
    }

    if (button.dataset.action === "add-bag") {
        addToBag(id);
    }
});

/* Shopping bag */

function addToBag(id) {
    const existing = bag.find(item => item.id === id);

    if (existing) {
        if (existing.quantity >= 99) {
            showToast("Maximum quantity reached.");
            return;
        }

        existing.quantity += 1;
    } else {
        bag.push({ id, quantity: 1 });
    }

    saveBag();
    updateBagCount();
    renderBag();
    showToast("Added to your shopping bag!");
}

function updateQuantity(id, change) {
    const item = bag.find(product => product.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        bag = bag.filter(product => product.id !== id);
    } else if (item.quantity > 99) {
        item.quantity = 99;
        showToast("Maximum quantity reached.");
    }

    saveBag();
    updateBagCount();
    renderBag();
}

function removeFromBag(id) {
    bag = bag.filter(item => item.id !== id);

    saveBag();
    updateBagCount();
    renderBag();
    showToast("Item removed from your bag.");
}

function updateBagCount() {
    const count = bag.reduce((sum, item) => sum + item.quantity, 0);

    bagCount.textContent = count;
    bagCount.hidden = count === 0;
    drawerCount.textContent = `(${count})`;
}

function renderBag() {
    const total = bag.reduce((sum, item) => {
        const product = getProduct(item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    bagTotal.textContent = formatPrice(total);

    if (bag.length === 0) {
        bagItems.innerHTML = `
            <div class="drawer-empty">
                <span>♧</span>
                <h3>Your bag is waiting</h3>
                <p>Find something you love and add it here.</p>
                <button class="primary-btn" data-close type="button">
                    EXPLORE PRODUCTS →
                </button>
            </div>
        `;
        return;
    }

    bagItems.innerHTML = bag.map(item => {
        const product = getProduct(item.id);

        if (!product) return "";

        return `
            <article class="drawer-product">
                <img src="${product.image}" alt="${product.name}">

                <div>
                    <h3>${product.brand}</h3>
                    <p>${product.name}</p>
                    <strong>${formatPrice(product.price)}</strong>

                    <div class="quantity-controls">
                        <button
                            data-action="decrease"
                            data-id="${product.id}"
                            aria-label="Decrease quantity"
                            type="button">−</button>

                        <span>${item.quantity}</span>

                        <button
                            data-action="increase"
                            data-id="${product.id}"
                            aria-label="Increase quantity"
                            type="button">+</button>
                    </div>
                </div>

                <button
                    data-action="remove"
                    data-id="${product.id}"
                    type="button">Remove</button>
            </article>
        `;
    }).join("");
}

bagItems.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    switch (button.dataset.action) {
        case "increase":
            updateQuantity(id, 1);
            break;
        case "decrease":
            updateQuantity(id, -1);
            break;
        case "remove":
            removeFromBag(id);
            break;
    }
});

/* Wishlist drawer */

function renderWishlist() {
    const savedProducts = wishlist
        .map(id => getProduct(id))
        .filter(Boolean);

    wishlistCount.textContent = `(${savedProducts.length})`;

    if (savedProducts.length === 0) {
        wishlistItems.innerHTML = `
            <div class="drawer-empty">
                <span>♡</span>
                <h3>No saved favourites yet</h3>
                <p>Tap the heart on a product to save it here.</p>
                <button class="primary-btn" data-close type="button">
                    DISCOVER STYLES →
                </button>
            </div>
        `;
        return;
    }

    wishlistItems.innerHTML = savedProducts.map(product => `
        <article class="drawer-product">
            <img src="${product.image}" alt="${product.name}">

            <div>
                <h3>${product.brand}</h3>
                <p>${product.name}</p>
                <strong>${formatPrice(product.price)}</strong>

                <button
                    data-action="wishlist-remove"
                    data-id="${product.id}"
                    type="button">Remove from wishlist</button>

                <button
                    data-action="wishlist-bag"
                    data-id="${product.id}"
                    type="button">ADD TO BAG +</button>
            </div>
        </article>
    `).join("");
}

wishlistItems.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "wishlist-remove") {
        toggleWishlist(id);
    }

    if (button.dataset.action === "wishlist-bag") {
        addToBag(id);
    }
});

/* Drawer controls */

function openDrawer(drawer) {
    bagDrawer.classList.remove("open");
    wishlistDrawer.classList.remove("open");

    drawer.classList.add("open");
    overlay.classList.add("visible");
    document.body.classList.add("drawer-open");

    bagDrawer.setAttribute(
        "aria-hidden",
        String(drawer !== bagDrawer)
    );

    wishlistDrawer.setAttribute(
        "aria-hidden",
        String(drawer !== wishlistDrawer)
    );

    const closeButton = drawer.querySelector("[data-close]");
    if (closeButton) closeButton.focus();
}

function closeDrawers() {
    bagDrawer.classList.remove("open");
    wishlistDrawer.classList.remove("open");
    overlay.classList.remove("visible");
    document.body.classList.remove("drawer-open");

    bagDrawer.setAttribute("aria-hidden", "true");
    wishlistDrawer.setAttribute("aria-hidden", "true");
}

$("#bagNav").addEventListener("click", () => {
    renderBag();
    openDrawer(bagDrawer);
});

$("#wishlistNav").addEventListener("click", () => {
    renderWishlist();
    openDrawer(wishlistDrawer);
});

$("#footerBag").addEventListener("click", () => {
    renderBag();
    openDrawer(bagDrawer);
});

$("#footerWishlist").addEventListener("click", () => {
    renderWishlist();
    openDrawer(wishlistDrawer);
});

overlay.addEventListener("click", closeDrawers);

$$("[data-close]").forEach(button => {
    button.addEventListener("click", event => {
        closeDrawers();

        if (event.currentTarget.closest(".drawer-empty")) {
            $("#products").scrollIntoView({ behavior: "smooth" });
        }
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDrawers();
});

/* Mobile navigation */

$("#mobileMenu").addEventListener("click", () => {
    const nav = $(".nav-links");
    const expanded = nav.classList.toggle("mobile-open");

    $("#mobileMenu").setAttribute("aria-expanded", String(expanded));
});

/* Profile demo */

$("#profileBtn").addEventListener("click", () => {
    showToast("Welcome! Profile login is not enabled in this demo.");
});

/* Demo checkout */

$("#checkoutBtn").addEventListener("click", () => {
    if (bag.length === 0) {
        showToast("Your shopping bag is empty.");
        return;
    }

    showToast("Demo checkout only — no real order was placed.");
});

/* Demo newsletter */

$("#newsletterForm").addEventListener("submit", event => {
    event.preventDefault();

    const emailInput = $("#emailInput");
    const message = $("#newsletterMessage");

    if (!emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
    }

    message.textContent = "Thanks! This demo does not send or store emails.";
    emailInput.value = "";
});

/* Back to top */

$("#backToTop").addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

/* Initial page setup */

updateBagCount();
renderBag();
renderWishlist();
renderProducts();
