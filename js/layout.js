function getPathInfo() {
  const path = window.location.pathname;
  const inScreens = path.includes('/screens/');
  const inAdmin = path.includes('/admin/');

  return {
    inScreens,
    inAdmin,
    rootPrefix: inScreens || inAdmin ? '../' : '',
    screenPrefix: inScreens ? '' : 'screens/',
    currentPage: path.substring(path.lastIndexOf('/') + 1) || 'index.html'
  };
}

function getCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('creu_cart') || '[]');
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  } catch (e) {
    return 0;
  }
}

function buildNavItem(label, href, isActive) {
  const activeClass = isActive
    ? 'font-label-lg text-label-lg text-[#C84B16] font-bold border-b-2 border-[#C84B16] pb-1'
    : 'font-label-lg text-label-lg text-slate-300 hover:text-white transition-colors';

  return `<a class="${activeClass}" href="${href}">${label}</a>`;
}

function buildHeader({ rootPrefix, screenPrefix, currentPage }) {
  const lookbookHref = `${rootPrefix}index.html`;
  const menuHref = `${screenPrefix}our_menu.html`;
  const ordersHref = `${screenPrefix}checkout.html`;
  const accountHref = `${screenPrefix}my_account_creu.html`;
  const cartHref = `${screenPrefix}cart.html`;

  const cartCount = getCartCount();
  const badgeHtml = cartCount > 0
    ? `<span class="absolute -top-1 -right-1 bg-[#C84B16] text-white text-[10px] min-w-[18px] h-[18px] rounded-full px-1.5 flex items-center justify-center font-bold shadow-sm">${cartCount}</span>`
    : '';

  return `
<header class="creu-header fixed top-0 left-0 w-full z-50 flex flex-wrap items-center justify-between gap-3 px-margin-mobile md:px-margin-desktop h-[64px] bg-[#1E293B]/95 backdrop-blur-md">
  <div class="flex items-center gap-3">
    <img alt="Creu Brand Logo" class="h-10 w-auto animate-fade-in" src="${rootPrefix}assets/logo/crue-logo.png" />
    <div>
      <h1 class="font-headline-md text-headline-md font-bold tracking-tight text-[#C84B16]">Creu</h1>
    </div>
  </div>
  <div class="hidden lg:flex items-center gap-6">
    ${buildNavItem('Home', lookbookHref, currentPage === 'index.html')}
    ${buildNavItem('Menu', menuHref, currentPage === 'our_menu.html')}
    ${buildNavItem('Order', ordersHref, currentPage === 'checkout.html')}
    ${buildNavItem('Account', accountHref, currentPage === 'my_account_creu.html')}
  </div>
  <div class="flex items-center gap-3">
    <a href="${cartHref}" class="material-symbols-outlined text-slate-300 hover:text-white transition-colors relative flex items-center justify-center w-9 h-9">
      shopping_bag
      ${badgeHtml}
    </a>
  </div>
</header>
`;
}

function buildBottomNav({ rootPrefix, screenPrefix, currentPage }) {
  const lookbookHref = `${rootPrefix}index.html`;
  const menuHref = `${screenPrefix}our_menu.html`;
  const ordersHref = `${screenPrefix}checkout.html`;
  const accountHref = `${screenPrefix}my_account_creu.html`;

  const button = (label, icon, href, active) => {
    const activeClasses = active
      ? 'text-[#C84B16] bg-white/10 rounded-xl px-2.5 py-1.5 translate-y-[-2px] transition-all duration-200'
      : 'text-slate-300 px-2.5 py-1.5 hover:bg-white/5 transition-all';

    const fill = active ? "style=\"font-variation-settings: 'FILL' 1;\"" : '';
    return `
  <a class="flex flex-col items-center justify-center ${activeClasses}" href="${href}">
    <span class="material-symbols-outlined text-xl" ${fill}>${icon}</span>
    <span class="font-label-sm text-[10px] uppercase tracking-wider mt-0.5">${label}</span>
  </a>`;
  };

  return `
<nav class="creu-bottom-nav lg:hidden fixed z-50 flex justify-around items-center px-2 h-[80px] bg-[#1E293B]/95 backdrop-blur-md">
    ${button('Home', 'auto_awesome', lookbookHref, currentPage === 'index.html')}
    ${button('Menu', 'restaurant_menu', menuHref, currentPage === 'our_menu.html')}
    ${button('Order', 'payments', ordersHref, currentPage === 'checkout.html')}
    ${button('Account', 'person', accountHref, currentPage === 'my_account_creu.html')}
</nav>
`;
}

function ensureModal() {
  if (document.getElementById('creu-modal')) return;

  const modalHtml = `
<div id="creu-modal" class="hidden fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 p-4">
  <div class="w-full max-w-lg rounded-[1.5rem] bg-white shadow-2xl overflow-hidden">
    <div class="p-6">
      <div id="creu-modal-title" class="text-xl font-semibold text-[#1E293B] mb-2"></div>
      <div id="creu-modal-message" class="text-sm text-slate-600 mb-5"></div>
      <div id="creu-modal-input-container" class="hidden mb-4">
        <label id="creu-modal-input-label" class="block text-sm text-slate-500 mb-2"></label>
        <input id="creu-modal-input" class="w-full rounded-2xl border border-slate-300 bg-[#F8F6F3] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#C84B16] focus:ring-2 focus:ring-[#C84B16]/20" />
      </div>
      <div class="flex justify-end gap-3">
        <button id="creu-modal-cancel" class="hidden rounded-full border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 transition">Cancel</button>
        <button id="creu-modal-confirm" class="rounded-full bg-[#C84B16] px-4 py-2 text-white hover:brightness-110 transition">OK</button>
      </div>
    </div>
  </div>
</div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('creu-modal');
  const confirmBtn = document.getElementById('creu-modal-confirm');
  const cancelBtn = document.getElementById('creu-modal-cancel');
  const inputEl = document.getElementById('creu-modal-input');

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal(null);
  });

  confirmBtn.addEventListener('click', () => closeModal(true));
  cancelBtn.addEventListener('click', () => closeModal(false));

  function closeModal(result) {
    modal.classList.add('hidden');
    modal.dataset.showInput = 'false';
    cancelBtn.classList.add('hidden');
    inputEl.value = '';
    inputEl.placeholder = '';
    inputEl.removeAttribute('aria-label');
    if (typeof modal._resolve === 'function') {
      const resolve = modal._resolve;
      modal._resolve = null;
      if (modal.dataset.inputMode === 'true') {
        resolve(result ? inputEl.value : null);
      } else {
        resolve(result);
      }
    }
  }

  window.CreuModal = {
    showAlert(options) {
      return new Promise((resolve) => {
        const title = options.title || 'Notice';
        const message = options.message || '';
        const confirmText = options.confirmText || 'OK';
        document.getElementById('creu-modal-title').textContent = title;
        document.getElementById('creu-modal-message').textContent = message;
        cancelBtn.classList.add('hidden');
        confirmBtn.textContent = confirmText;
        inputEl.parentElement.classList.add('hidden');
        modal.dataset.inputMode = 'false';
        modal._resolve = resolve;
        modal.classList.remove('hidden');
      });
    },
    showConfirm(options) {
      return new Promise((resolve) => {
        const title = options.title || 'Confirm';
        const message = options.message || '';
        const confirmText = options.confirmText || 'Yes';
        const cancelText = options.cancelText || 'No';
        document.getElementById('creu-modal-title').textContent = title;
        document.getElementById('creu-modal-message').textContent = message;
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;
        cancelBtn.classList.remove('hidden');
        inputEl.parentElement.classList.add('hidden');
        modal.dataset.inputMode = 'false';
        modal._resolve = resolve;
        modal.classList.remove('hidden');
      });
    },
    showPrompt(options) {
      return new Promise((resolve) => {
        const title = options.title || 'Enter value';
        const message = options.message || '';
        const label = options.label || 'Value';
        const defaultValue = options.defaultValue || '';
        const placeholder = options.placeholder || '';
        const confirmText = options.confirmText || 'Confirm';
        const cancelText = options.cancelText || 'Cancel';
        document.getElementById('creu-modal-title').textContent = title;
        document.getElementById('creu-modal-message').textContent = message;
        document.getElementById('creu-modal-input-label').textContent = label;
        inputEl.value = defaultValue;
        inputEl.placeholder = placeholder;
        inputEl.setAttribute('aria-label', label);
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;
        cancelBtn.classList.remove('hidden');
        inputEl.parentElement.classList.remove('hidden');
        modal.dataset.inputMode = 'true';
        modal._resolve = resolve;
        modal.classList.remove('hidden');
        inputEl.focus();
      });
    }
  };
}

function renderLayout() {
  ensureModal();
  const pathInfo = getPathInfo();
  const headerTarget = document.getElementById('site-header');
  const bottomTarget = document.getElementById('site-bottom-nav');

  if (headerTarget) {
    headerTarget.innerHTML = buildHeader(pathInfo);
  }

  if (bottomTarget) {
    bottomTarget.innerHTML = buildBottomNav(pathInfo);
  }
}

window.renderLayout = renderLayout;
document.addEventListener('DOMContentLoaded', renderLayout);
window.addEventListener('storage', () => {
  renderLayout();
  if (window.AdminApp && typeof window.AdminApp.render === 'function') {
    window.AdminApp.render();
  }
});
