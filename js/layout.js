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
    ? `<span class="absolute -top-1 -right-1 bg-[#C84B16] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-sm">${cartCount}</span>`
    : '';

  return `
<header class="creu-header fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-[64px] bg-[#1E293B]/95 backdrop-blur-md">
  <div class="flex items-center gap-4">
    <img alt="Creu Brand Logo" class="h-10 w-auto animate-fade-in" src="${rootPrefix}assets/logo/crue-logo.png" />
    <div>
      <h1 class="font-headline-md text-headline-md font-bold tracking-tight text-[#C84B16]">Creu</h1>
    </div>
  </div>
  <nav class="hidden lg:flex items-center gap-xl">
    ${buildNavItem('Home', lookbookHref, currentPage === 'index.html')}
    ${buildNavItem('Menu', menuHref, currentPage === 'our_menu.html')}
    ${buildNavItem('Order', ordersHref, currentPage === 'checkout.html')}
    ${buildNavItem('Account', accountHref, currentPage === 'my_account_creu.html')}
  </nav>
  <div class="flex items-center gap-sm">
    <a href="${cartHref}" class="material-symbols-outlined text-slate-300 hover:text-white transition-colors relative flex items-center justify-center w-8 h-8">
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

function renderLayout() {
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
