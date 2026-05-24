function showAuthMsg(elId, text, isError) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text || '';
  el.className = 'text-sm mt-2 ' + (isError ? 'text-red-600' : 'text-green-700');
}

function renderAccount() {
  const user = CreuStore.getCurrentUser();
  const authPanel = document.getElementById('auth-panel');
  const profilePanel = document.getElementById('profile-panel');
  if (!authPanel || !profilePanel) return;

  if (user) {
    authPanel.classList.add('hidden');
    profilePanel.classList.remove('hidden');
    document.getElementById('profile-name-display').textContent = user.name;
    document.getElementById('profile-email-display').textContent = user.email;
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-email').value = user.email;
    const statsEl = document.getElementById('account-stats');
    if (statsEl) statsEl.style.display = '';
    renderOrderHistory(user);
  } else {
    authPanel.classList.remove('hidden');
    profilePanel.classList.add('hidden');
    const statsEl = document.getElementById('account-stats');
    if (statsEl) statsEl.style.display = 'none';
    const list = document.getElementById('order-history-list');
    if (list) {
      list.innerHTML = '<div class="p-md text-center text-secondary font-body-md">Sign in to see orders linked to your account, or check out as a guest.</div>';
    }
    const countEl = document.getElementById('orders-count');
    if (countEl) countEl.textContent = '0';
  }
}

function renderOrderHistory(user) {
  const list = document.getElementById('order-history-list');
  const countEl = document.getElementById('orders-count');
  if (!list) return;

  const orders = user
    ? CreuStore.getOrders().filter((o) => o.userId === user.id || o.customerEmail === user.email)
    : CreuStore.getOrders();

  if (countEl) countEl.textContent = orders.length;

  if (orders.length === 0) {
    list.innerHTML = '<div class="p-md text-center text-secondary font-body-md">No orders yet. <a href="our_menu.html" class="text-primary underline">Browse the menu!</a></div>';
    return;
  }

  list.innerHTML = orders.map((order) => {
    const itemNames = order.items.map((i) => i.name).join(', ');
    const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
    const paymentLabel = order.payment === 'gcash' ? 'GCash' : 'Cash on Delivery';
    const methodLabel = order.method === 'pickup' ? 'Pick Up' : 'Delivery';
    return `
    <div class="p-md flex flex-col sm:flex-row gap-md items-start border-b border-outline-variant/10">
      <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-[#C84B16]/10 flex items-center justify-center">
        <span class="material-symbols-outlined text-[#C84B16] text-3xl" style="font-variation-settings:'FILL' 1;">receipt_long</span>
      </div>
      <div class="flex-grow min-w-0">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-xs">
          <div>
            <span class="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Order #${order.id}</span>
            <h4 class="font-body-lg text-body-lg font-bold text-[#1E293B] truncate max-w-md">${itemNames}</h4>
          </div>
          <span class="font-label-lg text-label-lg px-3 py-1 bg-green-100 text-green-700 rounded-full self-start">${order.status}</span>
        </div>
        <div class="mt-xs flex flex-wrap gap-x-md gap-y-1 text-sm text-secondary">
          <span>${order.date}</span><span>•</span><span>${totalItems} item(s)</span><span>•</span>
          <span class="font-bold text-[#C84B16]">₱${order.total.toFixed(2)}</span><span>•</span>
          <span>${paymentLabel}</span><span>•</span><span>${methodLabel}</span>
        </div>
        <a href="our_menu.html" class="mt-sm inline-flex items-center gap-1 text-[#C84B16] font-label-lg text-sm hover:underline">
          <span class="material-symbols-outlined text-[16px]">refresh</span> Order again
        </a>
      </div>
    </div>`;
  }).join('');
}

function switchAuthTab(tab) {
  document.getElementById('login-form-wrap')?.classList.toggle('hidden', tab !== 'login');
  document.getElementById('signup-form-wrap')?.classList.toggle('hidden', tab !== 'signup');
  document.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    const active = btn.dataset.authTab === tab;
    btn.classList.toggle('bg-primary', active);
    btn.classList.toggle('text-white', active);
    btn.classList.toggle('bg-[#F0E6DF]', !active);
    btn.classList.toggle('text-slate-700', !active);
  });
}

document.getElementById('tab-login')?.addEventListener('click', () => switchAuthTab('login'));
document.getElementById('tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));

document.getElementById('login-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const res = CreuStore.loginUser(email, password);
  if (!res.ok) {
    showAuthMsg('login-msg', res.error, true);
    return;
  }
  showAuthMsg('login-msg', 'Welcome back!', false);
  renderAccount();
});

document.getElementById('signup-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  if (password !== confirm) {
    showAuthMsg('signup-msg', 'Passwords do not match.', true);
    return;
  }
  if (password.length < 4) {
    showAuthMsg('signup-msg', 'Password must be at least 4 characters.', true);
    return;
  }
  const res = CreuStore.registerUser({ email, password, name });
  if (!res.ok) {
    showAuthMsg('signup-msg', res.error, true);
    return;
  }
  showAuthMsg('signup-msg', 'Account created!', false);
  renderAccount();
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  CreuStore.logoutUser();
  renderAccount();
});

document.getElementById('profile-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = CreuStore.getCurrentUser();
  if (!user) return;
  const res = CreuStore.updateUserProfile(user.id, {
    name: document.getElementById('edit-name').value,
    email: document.getElementById('edit-email').value,
  });
  const msg = document.getElementById('profile-msg');
  if (!res.ok) {
    if (msg) { msg.textContent = res.error; msg.className = 'text-sm text-red-600'; }
    return;
  }
  if (msg) { msg.textContent = 'Profile updated.'; msg.className = 'text-sm text-green-700'; }
  renderAccount();
});

document.getElementById('password-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = CreuStore.getCurrentUser();
  if (!user) return;
  const res = CreuStore.changeUserPassword(
    user.id,
    document.getElementById('current-password').value,
    document.getElementById('new-password').value
  );
  const msg = document.getElementById('password-msg');
  if (!res.ok) {
    if (msg) { msg.textContent = res.error; msg.className = 'text-sm text-red-600'; }
    return;
  }
  if (msg) { msg.textContent = 'Password changed.'; msg.className = 'text-sm text-green-700'; }
  document.getElementById('password-form').reset();
});

function initPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.previousElementSibling;
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = isPassword ? 'visibility_off' : 'visibility';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  switchAuthTab('login');
  renderAccount();
  initPasswordToggles();
});
