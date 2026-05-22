function updateDeliveryUI() {
  const method = document.querySelector('input[name="delivery_method"]:checked')?.value || 'shipping';
  const addressGroup = document.getElementById('checkout-address-group');
  const branchGroup = document.getElementById('checkout-branch-group');
  const addressLabel = document.getElementById('checkout-address-label');

  if (method === 'pickup') {
    addressGroup?.classList.add('hidden');
    branchGroup?.classList.remove('hidden');
    if (addressLabel) addressLabel.textContent = 'Pickup details';
  } else {
    addressGroup?.classList.remove('hidden');
    branchGroup?.classList.add('hidden');
    if (addressLabel) addressLabel.textContent = 'Delivery Address';
  }
}

function renderCheckout() {
  const container = document.getElementById('checkout-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const totalEl = document.getElementById('checkout-total');
  if (!container) return;

  const cart = CreuStore.getCart();
  const user = CreuStore.getCurrentUser();
  const nameInput = document.getElementById('checkout-name');
  const emailInput = document.getElementById('checkout-email');
  const guestNote = document.getElementById('guest-checkout-note');

  if (user && nameInput) nameInput.value = user.name;
  if (user && emailInput) emailInput.value = user.email;
  if (guestNote) guestNote.classList.toggle('hidden', !!user);
  updateDeliveryUI();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-lg text-center">
        <span class="material-symbols-outlined text-5xl text-slate-300 mb-sm block">shopping_bag</span>
        <p class="font-body-md text-body-md text-slate-400 mb-md">Your cart is empty.</p>
        <a href="our_menu.html" class="text-[#C84B16] font-label-lg text-label-lg underline">Browse the Menu</a>
      </div>`;
    if (subtotalEl) subtotalEl.textContent = '₱0.00';
    if (totalEl) totalEl.textContent = '₱0.00';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item) => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    const sub = CreuStore.formatItemDetail(item) || (item.type === 'shots' ? 'Bite-sized crispy shots' : '');
    const img = item.image
      ? `<img alt="${item.name}" class="w-full h-full object-cover" src="${item.image}"/>`
      : '<span class="material-symbols-outlined text-4xl text-[#C84B16]/30 m-auto">local_cafe</span>';
    return `
      <div class="flex gap-md">
        <div class="w-24 h-28 bg-[#FAF6F0] rounded-lg overflow-hidden flex-shrink-0 border border-slate-200/20 flex items-center justify-center">${img}</div>
        <div class="flex-1 flex flex-col justify-between py-1">
          <div>
            <p class="font-label-lg text-label-lg text-on-surface uppercase leading-snug">${item.name}</p>
            <p class="font-body-md text-on-surface-variant text-sm mt-1">${sub}</p>
          </div>
          <div class="flex justify-between items-center">
            <p class="font-label-lg text-label-lg text-on-surface-variant">QTY: ${item.quantity}</p>
            <p class="font-body-lg text-body-lg font-bold text-on-surface">₱${lineTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>`;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₱${subtotal.toFixed(2)}`;
}

async function completeOrder() {
  const cart = CreuStore.getCart();
  if (cart.length === 0) {
    await window.CreuModal?.showAlert({
      title: 'Cart empty',
      message: 'Your cart is empty. Add some items before ordering!',
      confirmText: 'Back to menu'
    });
    return;
  }

  const method = document.querySelector('input[name="delivery_method"]:checked')?.value || 'shipping';
  const payment = document.querySelector('input[name="payment_method"]:checked')?.value || 'gcash';
  const name = document.getElementById('checkout-name')?.value?.trim() || 'Guest';
  const phone = document.getElementById('checkout-phone')?.value?.trim() || '';
  const user = CreuStore.getCurrentUser();
  const branch = document.getElementById('checkout-branch')?.value || 'Creu Central Branch';
  let address = document.getElementById('checkout-address')?.value?.trim() || '';

  if (method === 'shipping' && !address) {
    await window.CreuModal?.showAlert({
      title: 'Address required',
      message: 'Please enter a delivery address before completing your order.',
      confirmText: 'OK'
    });
    return;
  }

  if (method === 'pickup') {
    address = `Pick-up at ${branch}`;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const order = {
    id: 'CREU-' + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
    items: cart.map((i) => ({ ...i })),
    subtotal,
    total: subtotal,
    method,
    payment,
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    userId: user?.id || null,
    customerEmail: user?.email || document.getElementById('checkout-email')?.value?.trim() || null,
    status: 'Confirmed',
  };

  cart.forEach((item) => {
    if (item.productId) CreuStore.decrementStock(item.productId, item.quantity);
  });

  CreuStore.addOrder(order);
  localStorage.removeItem('creu_cart');
  if (window.renderLayout) window.renderLayout();

  const modal = document.getElementById('order-success-modal');
  const orderIdEl = document.getElementById('success-order-id');
  if (orderIdEl) orderIdEl.textContent = '#' + order.id;
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckout();
  document.querySelectorAll('input[name="delivery_method"]').forEach((input) => {
    input.addEventListener('change', updateDeliveryUI);
  });
});
