const { RICE_OPTIONS, getInventory, getCart, saveCart, getProductById, beveragePrice, formatItemDetail } = CreuStore;

function showToast(messageText) {
  const toast = document.getElementById('toast');
  const message = document.getElementById('toast-message');
  if (!toast || !message) return;
  message.innerText = messageText;
  toast.classList.remove('translate-y-[200%]');
  toast.classList.add('translate-y-0');
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0');
    toast.classList.add('translate-y-[200%]');
  }, 3000);
}

function tagLabel(tag) {
  const map = { poultry: 'Poultry', seafood: 'Seafood', 'red-meat': 'Red Meat', beverages: 'Beverage' };
  return map[tag] || tag;
}

function renderMealCard(product) {
  const riceOpts = RICE_OPTIONS.map((r) => `<option value="${r}">${r}</option>`).join('');
  return `
  <div class="menu-item creu-card group product-card-hover bg-[#F0E6DF] overflow-hidden flex flex-col" data-category="${product.tag}" data-product-id="${product.id}">
    <div class="h-[240px] relative overflow-hidden">
      <img alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${product.image}"/>
      <div class="absolute top-4 left-4">
        <span class="bg-[#C84B16] text-white px-4 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider">${tagLabel(product.tag)}</span>
      </div>
    </div>
    <div class="p-md flex flex-col flex-grow justify-between">
      <div>
        <div class="flex justify-between items-start mb-xs gap-2">
          <h3 class="font-headline-md text-headline-md text-slate-800">${product.name}</h3>
          <span class="font-body-lg text-body-lg font-bold text-[#C84B16] shrink-0">₱${product.price}</span>
        </div>
        <p class="font-body-md text-body-md text-slate-600 mb-md">${product.description || ''}</p>
        <div class="mb-md">
          <label class="block font-label-sm text-label-sm text-slate-500 uppercase mb-1">Select Rice Option</label>
          <select class="rice-selector w-full rounded-lg border border-slate-300 bg-[#FAF6F0] px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#C84B16] focus:ring-1 focus:ring-[#C84B16]">${riceOpts}</select>
        </div>
      </div>
      <button class="w-full py-3 rounded-xl bg-[#C84B16] text-white font-label-lg text-label-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest" onclick="addMealToCart('${product.id}', this)" ${product.stock <= 0 ? 'disabled' : ''}>
        <span class="material-symbols-outlined text-sm">add_shopping_cart</span> ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  </div>`;
}

function renderShotCard(product) {
  return `
  <div class="menu-item creu-card group product-card-hover bg-[#F0E6DF] overflow-hidden flex flex-col" data-category="${product.tag}" data-product-id="${product.id}">
    <div class="h-[240px] relative overflow-hidden">
      <img alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${product.image}"/>
      <div class="absolute top-4 left-4">
        <span class="bg-[#1E293B] text-white px-4 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider">${tagLabel(product.tag)}</span>
      </div>
    </div>
    <div class="p-md flex flex-col flex-grow justify-between">
      <div>
        <div class="flex justify-between items-start mb-xs gap-2">
          <h3 class="font-headline-md text-headline-md text-slate-800">${product.name}</h3>
          <span class="font-body-lg text-body-lg font-bold text-[#C84B16] shrink-0">₱${product.price}</span>
        </div>
        <p class="font-body-md text-body-md text-slate-600 mb-md">${product.description || ''}</p>
      </div>
      <button class="w-full py-3 rounded-xl border border-[#C84B16] text-[#C84B16] font-label-lg text-label-lg hover:bg-[#C84B16]/5 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest mt-auto" onclick="addShotToCart('${product.id}', this)" ${product.stock <= 0 ? 'disabled' : ''}>
        <span class="material-symbols-outlined text-sm">add_shopping_cart</span> ${product.stock <= 0 ? 'Out of Stock' : 'Quick Add'}
      </button>
    </div>
  </div>`;
}

function renderBeverageCard(product) {
  const imgBlock = product.image
    ? `<img alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${product.image}"/>`
    : `<div class="w-full h-full flex items-center justify-center bg-[#1E293B]/5"><span class="material-symbols-outlined text-6xl text-[#C84B16]/40">local_cafe</span></div>`;
  return `
  <div class="menu-item creu-card group product-card-hover bg-[#F0E6DF] overflow-hidden flex flex-col" data-category="beverages" data-product-id="${product.id}">
    <div class="h-[200px] relative overflow-hidden">${imgBlock}</div>
    <div class="p-md flex flex-col flex-grow justify-between">
      <div>
        <h3 class="font-headline-md text-headline-md text-slate-800 mb-xs">${product.name}</h3>
        <p class="font-body-md text-body-md text-slate-600 mb-md">${product.description || ''}</p>
        <p class="font-label-sm text-label-sm text-slate-500 mb-2">Regular ₱${product.priceRegular} · Large ₱${product.priceLarge}</p>
        <label class="block font-label-sm text-label-sm text-slate-500 uppercase mb-1">Size</label>
        <select class="size-selector w-full rounded-lg border border-slate-300 bg-[#FAF6F0] px-3 py-2 text-sm text-slate-800 mb-md">
          <option value="regular">Regular — ₱${product.priceRegular}</option>
          <option value="large">Large — ₱${product.priceLarge}</option>
        </select>
      </div>
      <button class="w-full py-3 rounded-xl bg-[#C84B16] text-white font-label-lg text-label-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest" onclick="addBeverageToCart('${product.id}', this)" ${product.stock <= 0 ? 'disabled' : ''}>
        <span class="material-symbols-outlined text-sm">add_shopping_cart</span> Add to Cart
      </button>
    </div>
  </div>`;
}

function renderMenu() {
  const items = getInventory();
  const meals = items.filter((i) => i.category === 'meal');
  const shots = items.filter((i) => i.category === 'shots');
  const beverages = items.filter((i) => i.category === 'beverage');

  const mealsEl = document.getElementById('menu-meals-grid');
  const shotsEl = document.getElementById('menu-shots-grid');
  const bevEl = document.getElementById('menu-beverages-grid');
  if (mealsEl) mealsEl.innerHTML = meals.map(renderMealCard).join('');
  if (shotsEl) shotsEl.innerHTML = shots.map(renderShotCard).join('');
  if (bevEl) bevEl.innerHTML = beverages.map(renderBeverageCard).join('');
}

function addMealToCart(productId, buttonElement) {
  const product = CreuStore.getProductById(productId);
  if (!product || product.stock <= 0) return;
  const card = buttonElement.closest('.menu-item');
  const rice = card?.querySelector('.rice-selector')?.value || RICE_OPTIONS[0];
  
  let addonPrice = 0;
  if (rice === 'Yellow Rice') addonPrice = 30;
  else if (rice === 'Wild Rice Blend') addonPrice = 35;
  const price = product.price + addonPrice;

  addLineItem(product, { rice, price });
  showToast(`${product.name} (${rice}) added!`);
  flashButton(buttonElement);
}

function addShotToCart(productId, buttonElement) {
  const product = CreuStore.getProductById(productId);
  if (!product || product.stock <= 0) return;
  addLineItem(product, { price: product.price });
  showToast(`${product.name} added!`);
  flashButton(buttonElement);
}

function addBeverageToCart(productId, buttonElement) {
  const product = CreuStore.getProductById(productId);
  if (!product || product.stock <= 0) return;
  const card = buttonElement.closest('.menu-item');
  const size = card?.querySelector('.size-selector')?.value || 'regular';
  const price = beveragePrice(product, size);
  addLineItem(product, { size, price });
  showToast(`${product.name} (${size}) added!`);
  flashButton(buttonElement);
}

function addLineItem(product, opts) {
  const cart = getCart();
  const key = opts.rice
    ? `${product.id}-${opts.rice}`
    : opts.size
      ? `${product.id}-${opts.size}`
      : product.id;
  const existing = cart.find((i) => i.cartKey === key);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      cartKey: key,
      productId: product.id,
      name: product.name,
      price: opts.price,
      image: product.image || '',
      type: product.category,
      rice: opts.rice || null,
      size: opts.size || null,
      quantity: 1,
    });
  }
  saveCart(cart);
}

function flashButton(btn) {
  if (!btn) return;
  btn.classList.add('opacity-70');
  setTimeout(() => btn.classList.remove('opacity-70'), 600);
}

document.addEventListener('DOMContentLoaded', renderMenu);
