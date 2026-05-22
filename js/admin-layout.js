(function () {
  const PAGES = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'admin_dashboard.html' },
    { id: 'orders', label: 'Orders', icon: 'shopping_bag', href: 'admin_orders.html' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2', href: 'admin_inventory.html' },
    { id: 'customers', label: 'Customers', icon: 'group', href: 'admin_customers.html' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', href: 'admin_notifications.html' },
  ];

  function requireAdmin() {
    if (localStorage.getItem('creuAdminLoggedIn') !== 'true') {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  function getActivePage() {
    const file = window.location.pathname.split('/').pop() || 'admin_dashboard.html';
    const match = PAGES.find((p) => p.href === file);
    return match ? match.id : 'dashboard';
  }

  function buildSidebar(activeId) {
    const unread = window.CreuStore ? CreuStore.getUnreadNotificationCount() : 0;
    const nav = PAGES.map((p) => {
      const active = p.id === activeId;
      const cls = active
        ? 'flex items-center gap-3 px-4 py-3 bg-[#C84B16] text-white rounded-xl shadow-md'
        : 'flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all';
      const fill = active ? "style=\"font-variation-settings: 'FILL' 1;\"" : '';
      const badge = p.id === 'notifications' && unread > 0
        ? `<span class="ml-auto bg-white text-[#C84B16] text-[10px] font-bold px-2 py-0.5 rounded-full">${unread}</span>`
        : '';
      return `<a href="${p.href}" class="${cls}"><span class="material-symbols-outlined" ${fill}>${p.icon}</span><span class="font-label-lg text-label-lg uppercase tracking-wider">${p.label}</span>${badge}</a>`;
    }).join('');

    const stats = window.CreuStore ? CreuStore.dashboardStats() : { lowStockCount: 0 };
    const inv = CreuStore.getAllInventory();
    const totalStock = inv.reduce((s, i) => s + (i.stock || 0), 0);
    const maxCap = inv.length * 100;
    const pct = maxCap ? Math.min(100, Math.round((totalStock / maxCap) * 100)) : 0;

    return `
<aside class="hidden md:flex flex-col w-[260px] fixed h-[calc(100vh-64px)] top-[64px] bg-[#1E293B] border-r border-slate-700/50 p-md gap-xs z-40">
  ${nav}
  <div class="mt-auto pt-lg">
    <div class="p-sm bg-white/5 rounded-xl border border-white/10">
      <p class="font-label-sm text-label-sm text-[#C84B16] mb-2 font-bold uppercase tracking-wider">Inventory Status</p>
      <div class="flex justify-between items-end">
        <span class="font-headline-md text-headline-md text-slate-200">${pct}%</span>
        <span class="text-[10px] font-bold text-slate-400">${stats.lowStockCount} low</span>
      </div>
      <div class="w-full bg-slate-700 h-1.5 rounded-full mt-2">
        <div class="bg-[#C84B16] h-full rounded-full" style="width:${pct}%"></div>
      </div>
    </div>
  </div>
</aside>`;
  }

  function buildMobileNav(activeId) {
    const icons = { dashboard: 'dashboard', orders: 'shopping_bag', inventory: 'inventory_2', customers: 'group', notifications: 'notifications' };
    const short = { dashboard: 'Home', orders: 'Orders', inventory: 'Stock', customers: 'Users', notifications: 'Alerts' };
    return PAGES.map((p) => {
      const active = p.id === activeId;
      const cls = active
        ? 'flex flex-col items-center justify-center text-[#C84B16] bg-white/10 rounded-xl px-3 py-2 translate-y-[-2px]'
        : 'flex flex-col items-center justify-center text-slate-300 px-3 py-2 hover:bg-white/5';
      const fill = active ? "style=\"font-variation-settings: 'FILL' 1;\"" : '';
      return `<a href="${p.href}" class="${cls}"><span class="material-symbols-outlined" ${fill}>${icons[p.id]}</span><span class="font-label-sm text-[9px] uppercase tracking-wider mt-0.5">${short[p.id]}</span></a>`;
    }).join('');
  }

  function renderAdminLayout() {
    if (!requireAdmin()) return;
    const active = getActivePage();
    const sidebar = document.getElementById('admin-sidebar');
    const mobile = document.getElementById('admin-mobile-nav');
    if (sidebar) sidebar.innerHTML = buildSidebar(active);
    if (mobile) mobile.innerHTML = buildMobileNav(active);
    initLogout();
  }

  function initLogout() {
    const logoutButton = document.getElementById('logoutButton');
    const logoutModal = document.getElementById('logoutModal');
    const logoutCancel = document.getElementById('logoutCancel');
    const logoutConfirm = document.getElementById('logoutConfirm');
    if (logoutButton) {
      logoutButton.onclick = () => logoutModal?.classList.remove('hidden');
    }
    if (logoutCancel) {
      logoutCancel.onclick = () => logoutModal?.classList.add('hidden');
    }
    if (logoutConfirm) {
      logoutConfirm.onclick = () => {
        localStorage.removeItem('creuAdminLoggedIn');
        window.location.href = 'index.html';
      };
    }
  }

  window.renderAdminLayout = renderAdminLayout;
  document.addEventListener('DOMContentLoaded', renderAdminLayout);
})();
