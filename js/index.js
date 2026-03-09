const API_BASE = "https://openapi.programming-hero.com/api";

// App state keeps everything in one place so UI always stays in sync.
const state = {
  allPlants: [],
  currentPlants: [],
  cart: {},
  activeCategory: "all",
};

const plantsContainer = document.getElementById("plants-card-container");
const categoriesContainer = document.getElementById("categories-container");
const plantsLoading = document.getElementById("plants-loading");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCountBadge = document.getElementById("cart-count-badge");
const navCartCount = document.getElementById("nav-cart-count");
const modal = document.getElementById("modal");

// Helper for currency output.
const formatCurrency = (value) => `$${Number(value).toLocaleString()}`;

// Toggle spinner while data is loading.
const setPlantsLoading = (isLoading) => {
  plantsLoading.classList.toggle("hidden", !isLoading);
  plantsLoading.classList.toggle("flex", isLoading);
};

// Render category list and mark active tab.
const renderCategories = (categories) => {
  categories.forEach((category) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <button data-category-id="${category.id}" class="category-button">
        ${category.category_name}
      </button>
    `;
    categoriesContainer.append(item);
  });

  updateActiveCategoryButton(state.activeCategory);
};

// Add/remove active visual state for category tabs.
const updateActiveCategoryButton = (activeId) => {
  const categoryButtons =
    categoriesContainer.querySelectorAll(".category-button");
  categoryButtons.forEach((button) => {
    button.classList.toggle(
      "category-active",
      button.dataset.categoryId === String(activeId),
    );
  });
};

// Draw plant cards for current list.
const renderPlants = (plants) => {
  plantsContainer.innerHTML = "";

  if (!plants.length) {
    plantsContainer.innerHTML = `
      <div class="md:col-span-2 xl:col-span-3 empty-state">
        <h3 class="font-bold text-lg mb-1">No Plants Found</h3>
        <p>Try another category. New trees will be available soon.</p>
      </div>
    `;
    return;
  }

  plants.forEach((plant) => {
    const card = document.createElement("article");
    card.className = "plant-card card bg-white p-3 rounded-2xl flex flex-col";
    card.innerHTML = `
      <div class="overflow-hidden rounded-xl">
        <img data-show-modal="${plant.id}" class="plant-image h-48 w-full object-cover cursor-pointer" title="${plant.name}" src="${plant.image}" alt="${plant.name}">
      </div>
      <div class="mt-4 space-y-2.5 grow">
        <h3 data-show-modal="${plant.id}" class="text-xl font-bold cursor-pointer hover:text-green-700 transition-colors duration-200">${plant.name}</h3>
        <p class="text-gray-600">${plant.description.slice(0, 115)}...</p>
        <div class="flex items-center justify-between">
          <span class="inline-block py-1 px-3 bg-green-100 text-green-700 rounded-full text-sm font-medium">${plant.category}</span>
          <h4 class="font-bold text-lg text-green-700">${formatCurrency(plant.price)}</h4>
        </div>
      </div>
      <button data-add-cart="${plant.id}" class="btn-add-cart mt-4 w-full py-2.5 px-4 bg-linear-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"><i class="fa-solid fa-plus mr-2"></i>Add to Cart</button>
    `;
    plantsContainer.append(card);
  });
};

// Render cart items, totals, and cart counters.
const renderCart = () => {
  const cartEntries = Object.values(state.cart);

  if (!cartEntries.length) {
    cartItems.innerHTML =
      '<div class="empty-state">Your cart is empty. Add your first tree.</div>';
    cartTotal.textContent = formatCurrency(0);
    cartCountBadge.textContent = "0 items";
    navCartCount.textContent = "0";
    return;
  }

  cartItems.innerHTML = "";
  let subtotal = 0;
  let count = 0;

  cartEntries.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    count += item.quantity;

    const row = document.createElement("div");
    row.className =
      "flex items-center justify-between bg-green-50 p-3 rounded-md";
    row.innerHTML = `
      <div>
        <h4 class="font-semibold text-base">${item.name}</h4>
        <p class="text-gray-600 text-sm">${formatCurrency(item.price)} x ${item.quantity} = <span class="font-semibold">${formatCurrency(itemTotal)}</span></p>
      </div>
      <button data-remove-cart="${item.id}" class="text-gray-500 hover:text-red-500 cursor-pointer transition-colors duration-200" title="Remove item">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    cartItems.append(row);
  });

  cartTotal.textContent = formatCurrency(subtotal);
  cartCountBadge.textContent = `${count} item${count > 1 ? "s" : ""}`;
  navCartCount.textContent = String(count);
};

// Add selected plant to cart or increase quantity.
const addToCart = (plantId) => {
  const plant = state.allPlants.find((item) => item.id === Number(plantId));
  if (!plant) return;

  if (state.cart[plant.id]) {
    state.cart[plant.id].quantity += 1;
  } else {
    state.cart[plant.id] = { ...plant, quantity: 1 };
  }

  renderCart();
};

// Remove a plant from cart fully.
const removeFromCart = (plantId) => {
  delete state.cart[plantId];
  renderCart();
};

// Load all plants once for fast rendering.
const loadAllPlants = async () => {
  setPlantsLoading(true);
  try {
    const response = await fetch(`${API_BASE}/plants`);
    const data = await response.json();
    state.allPlants = data.plants || [];
    state.currentPlants = [...state.allPlants];
    renderPlants(state.currentPlants);
  } catch (error) {
    plantsContainer.innerHTML =
      '<div class="empty-state">Unable to load plants. Please refresh and try again.</div>';
  } finally {
    setPlantsLoading(false);
  }
};

// Load categories dynamically.
const loadCategories = async () => {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    renderCategories(data.categories || []);
  } catch (error) {
    // Keep UI usable even if category API fails.
  }
};

// Filter plants and update active tab when category changes.
const applyCategoryFilter = async (categoryId) => {
  state.activeCategory = categoryId;
  updateActiveCategoryButton(categoryId);

  if (categoryId === "all") {
    state.currentPlants = [...state.allPlants];
    renderPlants(state.currentPlants);
    return;
  }

  setPlantsLoading(true);
  try {
    const response = await fetch(`${API_BASE}/category/${categoryId}`);
    const data = await response.json();
    state.currentPlants = data.plants || [];
    renderPlants(state.currentPlants);
  } catch (error) {
    plantsContainer.innerHTML =
      '<div class="empty-state">Could not filter this category. Please try again.</div>';
  } finally {
    setPlantsLoading(false);
  }
};

// Open improved modal with richer content and action buttons.
const showModal = async (plantId) => {
  modal.innerHTML = `
    <div class="modal-box w-11/12 max-w-3xl">
      <div class="h-40 flex items-center justify-center">
        <span class="loading loading-spinner loading-lg text-green-600"></span>
      </div>
    </div>
  `;
  modal.showModal();

  try {
    const response = await fetch(`${API_BASE}/plant/${plantId}`);
    const data = await response.json();
    const plant = data.plants;

    modal.innerHTML = `
      <div class="modal-box w-11/12 max-w-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2">
          <img src="${plant.image}" alt="${plant.name}" class="h-56 md:h-full md:min-h-64 w-full object-cover">
          <div class="p-4 md:p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xl md:text-2xl font-bold text-green-700">${plant.name}</h3>
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost" aria-label="Close modal">
                  <i class="fa-solid fa-x"></i>
                </button>
              </form>
            </div>
            <span class="inline-block py-1 px-3 bg-green-100 text-green-700 rounded-full text-sm font-medium">${plant.category}</span>
            <p class="text-sm md:text-base text-gray-600 leading-relaxed">${plant.description}</p>
            <p class="text-2xl md:text-3xl font-bold text-green-700">${formatCurrency(plant.price)}</p>
            <div class="modal-action mt-3 flex-wrap justify-start gap-2">
              <button data-modal-add="${plant.id}" class="w-full sm:w-auto py-2.5 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300">Add to Cart</button>
              <form method="dialog" class="w-full sm:w-auto">
                <button class="w-full sm:w-auto py-2.5 px-6 border border-green-600 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-all duration-300">Close</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    `;
  } catch (error) {
    modal.innerHTML = `
      <div class="modal-box">
        <h3 class="font-bold text-lg text-red-600">Failed to load details</h3>
        <p class="py-3">Please close and try again.</p>
        <div class="modal-action">
          <form method="dialog"><button class="btn">Close</button></form>
        </div>
      </div>
    `;
  }
};

// Navbar and hero buttons scroll users to useful sections.
const setupQuickNavButtons = () => {
  const goToServices = () => {
    document
      .getElementById("services")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document
    .getElementById("nav-plant-button")
    .addEventListener("click", goToServices);
  document
    .getElementById("hero-involved-button")
    .addEventListener("click", goToServices);

  document.getElementById("nav-cart-button").addEventListener("click", () => {
    const cartPanel = document.getElementById("cart-panel");
    const cartPanelCard = cartPanel.firstElementChild;
    cartPanel.scrollIntoView({ behavior: "smooth", block: "start" });

    // Subtle pulse effect with shadow only (no border/ring).
    cartPanelCard.classList.remove("cart-panel-focus");
    void cartPanelCard.offsetWidth;
    cartPanelCard.classList.add("cart-panel-focus");

    setTimeout(() => {
      cartPanelCard.classList.remove("cart-panel-focus");
    }, 900);
  });
};

// Highlight active nav link based on current section in viewport.
const setupActiveNavOnScroll = () => {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const linkId = link.getAttribute("href")?.replace("#", "");
      const isActive = linkId === id;
      link.classList.toggle("nav-link-active", isActive);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { threshold: 0.35 },
  );

  sections.forEach((section) => observer.observe(section));

  // Keep tab highlight responsive when user taps a nav item on small devices.
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      if (targetId) setActiveLink(targetId);
    });
  });
};

// Bind event delegation for dynamic plant/card/cart/modal buttons.
const setupEventDelegation = () => {
  categoriesContainer.addEventListener("click", (event) => {
    const target = event.target.closest(".category-button");
    if (!target) return;
    applyCategoryFilter(target.dataset.categoryId);
  });

  plantsContainer.addEventListener("click", (event) => {
    const showModalBtn = event.target.closest("[data-show-modal]");
    const addCartBtn = event.target.closest("[data-add-cart]");

    if (showModalBtn) {
      showModal(showModalBtn.dataset.showModal);
      return;
    }

    if (addCartBtn) {
      addToCart(addCartBtn.dataset.addCart);
    }
  });

  cartItems.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-cart]");
    if (removeBtn) {
      removeFromCart(removeBtn.dataset.removeCart);
    }
  });

  modal.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-modal-add]");
    if (addBtn) {
      addToCart(addBtn.dataset.modalAdd);
      modal.close();
    }
  });

  // Handle checkout button click - show confirmation and process order
  document.getElementById("checkout-button").addEventListener("click", () => {
    const cartEntries = Object.values(state.cart);
    if (!cartEntries.length) {
      showEmptyCartModal();
      return;
    }

    // Show checkout confirmation modal
    showCheckoutModal();
  });
};

// Show empty cart modal instead of browser alert.
const showEmptyCartModal = () => {
  const emptyCartModal = document.createElement("dialog");
  emptyCartModal.className = "modal";
  emptyCartModal.innerHTML = `
    <div class="modal-box w-11/12 max-w-md text-center space-y-4">
      <div class="inline-block p-4 bg-orange-100 rounded-full">
        <i class="fa-solid fa-basket-shopping text-orange-600 text-4xl"></i>
      </div>
      <div>
        <h3 class="font-bold text-2xl text-gray-800">Your Cart Is Empty</h3>
        <p class="text-gray-600 mt-2 leading-relaxed">Your cart is empty. Please add trees before checkout.</p>
      </div>
      <div class="modal-action gap-3 pt-2">
        <form method="dialog" class="w-full">
          <button class="w-full btn btn-success text-white">Explore Trees</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  `;

  document.body.appendChild(emptyCartModal);
  emptyCartModal.showModal();

  emptyCartModal.addEventListener("close", () => {
    document
      .getElementById("services")
      .scrollIntoView({ behavior: "smooth", block: "start" });
    if (document.body.contains(emptyCartModal)) {
      document.body.removeChild(emptyCartModal);
    }
  });
};

const showOrderSuccessModal = (total, itemCount) => {
  const successModal = document.createElement("dialog");
  successModal.className = "modal";
  successModal.innerHTML = `
    <div class="modal-box w-11/12 max-w-md text-center space-y-4">
      <div class="inline-block p-4 bg-green-100 rounded-full">
        <i class="fa-solid fa-check text-green-600 text-4xl"></i>
      </div>
      <h3 class="font-bold text-2xl text-green-700">Order Confirmed!</h3>
      <p class="text-gray-600">Thank you for planting ${itemCount} tree${itemCount > 1 ? "s" : ""}.</p>
      <p class="text-sm text-gray-500">Order Total: <span class="font-bold text-green-700">${formatCurrency(total)}</span></p>
      <p class="text-sm text-gray-500">We will send you a confirmation shortly.</p>
      <div class="modal-action gap-3 pt-4">
        <form method="dialog" class="w-full">
          <button class="w-full btn btn-success text-white">Close</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  `;

  document.body.appendChild(successModal);
  successModal.showModal();

  successModal.addEventListener("close", () => {
    state.cart = {};
    renderCart();
    if (document.body.contains(successModal)) {
      document.body.removeChild(successModal);
    }
  });
};

// Handle checkout process with confirmation modal.
const showCheckoutModal = () => {
  const cartEntries = Object.values(state.cart);
  let total = 0;
  cartEntries.forEach((item) => {
    total += item.price * item.quantity;
  });

  const itemCount = cartEntries.reduce((sum, item) => sum + item.quantity, 0);

  // Close any open modal first
  const existingModal = document.getElementById("modal");
  if (existingModal.open) {
    existingModal.close();
  }

  // Create checkout confirmation modal
  const checkoutModal = document.createElement("dialog");
  checkoutModal.className = "modal";
  checkoutModal.innerHTML = `
    <div class="modal-box w-11/12 max-w-md">
      <div class="text-center space-y-4">
        <div class="inline-block p-3 bg-green-100 rounded-full">
          <i class="fa-solid fa-leaf text-green-600 text-3xl"></i>
        </div>
        <div>
          <h3 class="font-bold text-2xl text-green-700">Order Summary</h3>
          <p class="text-gray-600 mt-2">You're about to plant ${itemCount} tree${itemCount > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div class="divider mt-6 mb-4"></div>

      <div class="space-y-3 mb-6">
        <div class="flex justify-between text-base">
          <span class="text-gray-700">Items:</span>
          <span class="font-semibold">${itemCount}</span>
        </div>
        <div class="flex justify-between text-lg font-bold text-green-700">
          <span>Total:</span>
          <span>${formatCurrency(total)}</span>
        </div>
      </div>

      <div class="modal-action gap-3">
        <button type="button" data-cancel-checkout class="btn btn-outline btn-green">Cancel</button>
        <button type="button" data-confirm-checkout class="btn btn-success text-white"><i class="fa-solid fa-check mr-2"></i>Confirm Order</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  `;

  document.body.appendChild(checkoutModal);
  checkoutModal.showModal();

  const cancelButton = checkoutModal.querySelector("[data-cancel-checkout]");
  const confirmButton = checkoutModal.querySelector("[data-confirm-checkout]");

  cancelButton.addEventListener("click", () => {
    checkoutModal.close();
  });

  confirmButton.addEventListener("click", () => {
    checkoutModal.close();
    showOrderSuccessModal(total, itemCount);
  });

  checkoutModal.addEventListener("close", () => {
    if (document.body.contains(checkoutModal)) {
      document.body.removeChild(checkoutModal);
    }
  });
};

// Initialize app.
const init = async () => {
  renderCart();
  setupQuickNavButtons();
  setupActiveNavOnScroll();
  setupEventDelegation();
  await Promise.all([loadCategories(), loadAllPlants()]);
};

init();
