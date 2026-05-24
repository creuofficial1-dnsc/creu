function updateDeliveryUI() {
  const method = document.querySelector('input[name="delivery_method"]:checked')?.value || 'delivery';
  const addressGroup = document.getElementById('checkout-address-group');
  const branchGroup = document.getElementById('checkout-branch-group');
  const addressLabel = document.getElementById('checkout-address-label');
  const methodLabel = document.getElementById('checkout-method-label');
  const methodDisplay = method === 'pickup' ? 'Pick up' : 'Delivery';

  if (method === 'pickup') {
    addressGroup?.classList.add('hidden');
    branchGroup?.classList.remove('hidden');
    if (addressLabel) addressLabel.textContent = 'Pickup details';
  } else {
    addressGroup?.classList.remove('hidden');
    branchGroup?.classList.add('hidden');
    if (addressLabel) addressLabel.textContent = 'Delivery Address';
  }

  if (methodLabel) methodLabel.textContent = methodDisplay;
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

// Initialize EmailJS public key on script load
if (typeof emailjs !== 'undefined') {
  emailjs.init("jhrXmcPpA4t_z-aOg");
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

  const name = document.getElementById('checkout-name')?.value?.trim();
  const email = document.getElementById('checkout-email')?.value?.trim();
  const phone = document.getElementById('checkout-phone')?.value?.trim();
  const method = document.querySelector('input[name="delivery_method"]:checked')?.value || 'delivery';
  const payment = document.querySelector('input[name="payment_method"]:checked')?.value || 'gcash';
  const branch = document.getElementById('checkout-branch')?.value || 'Creu Central Branch';
  let address = document.getElementById('checkout-address')?.value?.trim() || '';

  // Input Validation
  if (!name) {
    await window.CreuModal?.showAlert({
      title: 'Name required',
      message: 'Please enter your full name before completing your order.',
      confirmText: 'OK'
    });
    return;
  }

  if (!email) {
    await window.CreuModal?.showAlert({
      title: 'Email required',
      message: 'Please enter your email address to receive your order receipt.',
      confirmText: 'OK'
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    await window.CreuModal?.showAlert({
      title: 'Invalid Email',
      message: 'Please enter a valid email address.',
      confirmText: 'OK'
    });
    return;
  }

  if (!phone) {
    await window.CreuModal?.showAlert({
      title: 'Phone required',
      message: 'Please enter your phone number so we can contact you regarding your order.',
      confirmText: 'OK'
    });
    return;
  }

  if (method === 'delivery' && !address) {
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
  const orderId = 'CREU-' + Date.now().toString().slice(-6);
  const orderDate = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

  // Visual feedback: Disable button and show processing spinner
  const orderBtn = document.getElementById('complete-order-btn');
  const originalBtnContent = orderBtn ? orderBtn.innerHTML : 'Complete Order';
  if (orderBtn) {
    orderBtn.disabled = true;
    orderBtn.innerHTML = `
      <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
      Processing Order...
    `;
  }

  // Send email receipt via EmailJS
  if (typeof emailjs !== 'undefined') {
    try {
      // Build a beautifully formatted plain text items list
      const itemsListText = cart.map(item => {
        const detail = CreuStore.formatItemDetail(item) || '';
        const detailStr = detail ? ` (${detail})` : '';
        return `• ${item.name}${detailStr} (x${item.quantity}) - ₱${(item.price * item.quantity).toFixed(2)}`;
      }).join('\n');

      // Build a premium HTML table format for rich templates
      const itemsListHtml = cart.map(item => {
        const detail = CreuStore.formatItemDetail(item) || '';
        const detailStr = detail ? `<div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">${detail}</div>` : '';
        return `
          <tr>
            <td class="item-name" style="padding: 12px; border-bottom: 1px solid #f1f2f6; text-align: left; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #2c3e50;">
              <span style="font-weight: 600; text-transform: uppercase;">${item.name}</span>
              ${detailStr}
            </td>
            <td class="item-qty" style="padding: 12px 8px; border-bottom: 1px solid #f1f2f6; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #2c3e50;">${item.quantity}</td>
            <td class="item-price" style="padding: 12px; border-bottom: 1px solid #f1f2f6; text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #C84B16;">₱${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      }).join('');

      const templateParams = {
        // Standard parameters
        to_name: name,
        to_email: email,
        
        // Custom customer parameters
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_address: address,

        // Order parameters
        order_id: orderId,
        order_date: orderDate,
        items_list: itemsListText,
        items_list_html: itemsListHtml,
        subtotal: `₱${subtotal.toFixed(2)}`,
        total: `₱${subtotal.toFixed(2)}`,
        delivery_method: method === 'pickup' ? 'Pick Up' : 'Delivery',
        payment_method: payment.toUpperCase(),
        reply_to: 'creuofficial1@gmail.com'
      };

      await emailjs.send('service_xn47s3k', 'template_v2h7lj9', templateParams);
    } catch (error) {
      console.error('EmailJS receipt send failure:', error);
      // We log but proceed with order placement so the checkout isn't completely blocked by an email failure
    }
  }

  const user = CreuStore.getCurrentUser();
  const order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    date: orderDate,
    items: cart.map((i) => ({ ...i })),
    subtotal,
    total: subtotal,
    method,
    payment,
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    userId: user?.id || null,
    customerEmail: email,
    status: 'Confirmed',
  };

  cart.forEach((item) => {
    if (item.productId) CreuStore.decrementStock(item.productId, item.quantity);
  });

  CreuStore.addOrder(order);
  localStorage.removeItem('creu_cart');
  clearCheckoutInfo();
  if (window.renderLayout) window.renderLayout();

  // Reset button state
  if (orderBtn) {
    orderBtn.disabled = false;
    orderBtn.innerHTML = originalBtnContent;
  }

  const modal = document.getElementById('order-success-modal');
  const orderIdEl = document.getElementById('success-order-id');
  if (orderIdEl) orderIdEl.textContent = '#' + order.id;
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

// ── Customer Information Persistence (localStorage) ──────────────────────
const CHECKOUT_STORAGE_KEY = 'creu_checkout_info';

function saveCheckoutInfo() {
  const data = {
    name: document.getElementById('checkout-name')?.value || '',
    email: document.getElementById('checkout-email')?.value || '',
    address: document.getElementById('checkout-address')?.value || '',
    phone: document.getElementById('checkout-phone')?.value || '',
    branch: document.getElementById('checkout-branch')?.value || '',
    delivery_method: document.querySelector('input[name="delivery_method"]:checked')?.value || 'delivery',
    payment_method: document.querySelector('input[name="payment_method"]:checked')?.value || 'gcash',
  };
  try { localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* quota full – ignore */ }
}

function restoreCheckoutInfo() {
  try {
    const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    // Only restore text fields if a logged-in user hasn't already filled them
    const user = CreuStore.getCurrentUser();
    const nameEl = document.getElementById('checkout-name');
    const emailEl = document.getElementById('checkout-email');
    if (nameEl && !nameEl.value && !user) nameEl.value = data.name || '';
    if (emailEl && !emailEl.value && !user) emailEl.value = data.email || '';

    const addrEl = document.getElementById('checkout-address');
    const phoneEl = document.getElementById('checkout-phone');
    const branchEl = document.getElementById('checkout-branch');
    if (addrEl && !addrEl.value) addrEl.value = data.address || '';
    if (phoneEl && !phoneEl.value) phoneEl.value = data.phone || '';
    if (branchEl && data.branch) branchEl.value = data.branch;

    // Restore radio selections
    if (data.delivery_method) {
      const radio = document.querySelector(`input[name="delivery_method"][value="${data.delivery_method}"]`);
      if (radio) { radio.checked = true; updateDeliveryUI(); }
    }
    if (data.payment_method) {
      const radio = document.querySelector(`input[name="payment_method"][value="${data.payment_method}"]`);
      if (radio) radio.checked = true;
    }
  } catch (e) { /* corrupted data – ignore */ }
}

function clearCheckoutInfo() {
  try { localStorage.removeItem(CHECKOUT_STORAGE_KEY); } catch (e) { /* ignore */ }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckout();
  restoreCheckoutInfo();

  document.querySelectorAll('input[name="delivery_method"]').forEach((input) => {
    input.addEventListener('change', () => { updateDeliveryUI(); saveCheckoutInfo(); });
  });

  // Auto-save on every input change
  ['checkout-name', 'checkout-email', 'checkout-address', 'checkout-phone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', saveCheckoutInfo);
  });
  const branchEl = document.getElementById('checkout-branch');
  if (branchEl) branchEl.addEventListener('change', saveCheckoutInfo);

  document.querySelectorAll('input[name="payment_method"]').forEach(input => {
    input.addEventListener('change', saveCheckoutInfo);
  });
});
