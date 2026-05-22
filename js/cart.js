function itemSubtitle(item) {
  return CreuStore.formatItemDetail(item) || (item.type === 'shots' ? 'Bite-sized crispy shots' : '');
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const cartPanel = document.getElementById('cart-panel');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const countEl = document.getElementById('cart-count-label');
  if (!container) return;

  const cart = CreuStore.getCart();

  if (cart.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (cartPanel) cartPanel.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (cartPanel) cartPanel.classList.remove('hidden');

  let subtotal = 0;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  if (countEl) countEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

  container.innerHTML = cart.map((item, idx) => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    const sub = itemSubtitle(item);
    return `
    <div class="creu-cart-item flex gap-md items-start bg-[#F0E6DF] p-md" data-idx="${idx}">
      <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200/20 bg-[#FAF6F0] flex items-center justify-center">
        ${item.image ? `<img alt="${item.name}" class="w-full h-full object-cover" src="${item.image}"/>` : '<span class="material-symbols-outlined text-4xl text-[#C84B16]/30">local_cafe</span>'}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start gap-2 mb-xs">
          <div>
            <h3 class="font-label-lg text-label-lg text-[#1E293B] uppercase leading-snug">${item.name}</h3>
            <p class="font-body-md text-body-md text-slate-500 text-sm mt-0.5">${sub}</p>
          </div>
          <button onclick="removeItem(${idx})" class="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 -mt-1">
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
        <div class="flex justify-between items-center mt-sm">
          <div class="flex items-center gap-xs bg-[#FAF6F0] rounded-full px-2 py-1 border border-slate-200/50">
            <button onclick="changeQty(${idx}, -1)" class="w-7 h-7 rounded-full flex items-center justify-center text-[#C84B16] hover:bg-[#C84B16]/10 transition-colors font-bold text-lg leading-none">−</button>
            <span class="font-label-lg text-label-lg text-[#1E293B] w-6 text-center">${item.quantity}</span>
            <button onclick="changeQty(${idx}, 1)" class="w-7 h-7 rounded-full flex items-center justify-center text-[#C84B16] hover:bg-[#C84B16]/10 transition-colors font-bold text-lg leading-none">+</button>
          </div>
          <span class="font-body-lg text-body-lg font-bold text-[#C84B16]">₱${lineTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₱${subtotal.toFixed(2)}`;
}

function changeQty(idx, delta) {
  const cart = CreuStore.getCart();
  if (!cart[idx]) return;
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  CreuStore.saveCart(cart);
  renderCart();
}

function removeItem(idx) {
  const cart = CreuStore.getCart();
  cart.splice(idx, 1);
  CreuStore.saveCart(cart);
  renderCart();
}

function clearCart() {
  if (!confirm('Clear all items from your cart?')) return;
  localStorage.removeItem('creu_cart');
  if (window.renderLayout) window.renderLayout();
  renderCart();
}

function proceedToCheckout() {
  if (CreuStore.getCart().length === 0) return;
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', renderCart);
