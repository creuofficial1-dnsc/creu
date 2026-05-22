/**
 * Creu Admin — single-page app (hash routing, no full reloads)
 */
(function (global) {
  const ROUTES = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', subtitle: 'Overview of sales, orders, and stock' },
    { id: 'orders', label: 'Orders', icon: 'shopping_bag', subtitle: 'Manage customer orders and status' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2', subtitle: 'Menu items, prices, and stock levels' },
    { id: 'customers', label: 'Customers', icon: 'group', subtitle: 'Registered customer accounts' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', subtitle: 'Alerts and activity feed' },
  ];

  const ORDER_STATUSES = ['Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function requireAdmin() {
    if (localStorage.getItem('creuAdminLoggedIn') !== 'true') {
      // Instead of redirecting, show a simple admin login prompt inside the admin content area
      renderAdminLogin();
      return false;
    }
    return true;
  }

  function renderAdminLogin() {
    const el = document.getElementById('admin-content');
    if (!el) return;
    el.innerHTML = `
      <div class="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
        <h2 class="text-2xl font-bold mb-4">Admin Login</h2>
        <p class="text-sm text-slate-600 mb-4">Enter your admin password to access the dashboard.</p>
        <input id="admin-pass" type="password" placeholder="Password" class="w-full px-3 py-2 border rounded mb-4" />
        <div class="flex gap-3 justify-center">
          <button id="admin-login-btn" class="px-4 py-2 bg-[#C84B16] text-white rounded">Login</button>
        </div>
        <p class="text-xs text-slate-500 mt-4">This is a local admin prompt for development. Use a secure setup in production.</p>
      </div>`;
    const btn = document.getElementById('admin-login-btn');
    if (btn) {
      btn.onclick = () => {
        const pass = document.getElementById('admin-pass')?.value || '';
        // Simple default password check; change as needed.
        if (pass === 'admin' || pass === 'CreuAdmin') {
          localStorage.setItem('creuAdminLoggedIn', 'true');
          render();
        } else {
          alert('Incorrect password');
        }
      };
    }
  }

  function getRoute() {
    const hash = (window.location.hash || '#dashboard').replace('#', '');
    return ROUTES.some((r) => r.id === hash) ? hash : 'dashboard';
  }

  function navigate(routeId) {
    window.location.hash = routeId;
    render();
  }

  function pageHeader(route) {
    return `
      <section class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span class="text-xs uppercase tracking-widest text-[#C84B16] font-semibold">Creu Management</span>
          <h2 class="text-2xl md:text-3xl font-bold text-[#1E293B] mt-1">${esc(route.label)}</h2>
          <p class="text-sm text-slate-600 mt-1">${esc(route.subtitle)}</p>
        </div>
      </section>`;
  }

  function buildSidebar(activeId) {
    const unread = CreuStore.getUnreadNotificationCount();

    const nav = ROUTES.map((p) => {
      const active = p.id === activeId;
      const cls = active
        ? 'admin-nav-btn flex items-center gap-3 px-4 py-3 bg-[#C84B16] text-white shadow-md'
        : 'admin-nav-btn flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5';
      const fill = active ? "style=\"font-variation-settings:'FILL' 1\"" : '';
      const badge = p.id === 'notifications' && unread > 0
        ? `<span class="ml-auto bg-white text-[#C84B16] text-[10px] font-bold px-2 py-0.5 rounded-full">${unread}</span>`
        : '';
      return `<button type="button" data-route="${p.id}" class="${cls}">
        <span class="material-symbols-outlined" ${fill}>${p.icon}</span>
        <span class="text-sm uppercase tracking-wider font-semibold">${p.label}</span>${badge}
      </button>`;
    }).join('');

    return `
      <aside id="admin-sidebar-el" class="admin-sidebar flex flex-col w-[260px] fixed h-screen top-0 bg-[#1E293B] border-r border-slate-700/50 p-4 gap-3 z-40">
        <div class="sidebar-brand flex flex-col items-center gap-3 mb-3 text-center">
          <img alt="Creu" class="h-9 w-auto rounded-lg" src="../assets/logo/crue-logo.png"/>
          <div class="sidebar-brand-text">
            <h1 class="text-lg font-bold text-[#C84B16] tracking-tight">Creu Admin</h1>
            <p class="text-xs text-slate-300">Management</p>
          </div>
        </div>
        ${nav}
        <div class="mt-auto pt-4">
          <button id="admin-logout-btn" class="admin-nav-btn flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5">
            <span class="material-symbols-outlined">logout</span>
            <span class="text-sm uppercase tracking-wider font-semibold">Logout</span>
          </button>
        </div>
      </aside>`;
  }

  function buildMobileNav(activeId) {
    const short = { dashboard: 'Home', orders: 'Orders', inventory: 'Stock', customers: 'Users', notifications: 'Alerts' };
    return ROUTES.map((p) => {
      const active = p.id === activeId;
      const cls = active
        ? 'flex flex-col items-center justify-center text-[#C84B16] bg-white/10 rounded-xl px-2 py-1.5'
        : 'flex flex-col items-center justify-center text-slate-300 px-2 py-1.5 hover:bg-white/5';
      const fill = active ? "style=\"font-variation-settings:'FILL' 1\"" : '';
      return `<button type="button" data-route="${p.id}" class="${cls}">
        <span class="material-symbols-outlined text-xl" ${fill}>${p.icon}</span>
        <span class="text-[9px] uppercase tracking-wider mt-0.5">${short[p.id]}</span>
      </button>`;
    }).join('');
  }

  function bindNav() {
    document.querySelectorAll('[data-route]').forEach((el) => {
      el.onclick = () => {
        navigate(el.dataset.route);
        document.getElementById('admin-sidebar-el')?.classList.remove('open');
      };
    });
    document.querySelectorAll('[data-goto]').forEach((el) => {
      el.onclick = (e) => {
        e.preventDefault();
        navigate(el.dataset.goto);
      };
    });
  }

  function renderDashboard() {
    const s = CreuStore.dashboardStats();
    const alerts = s.lowStockItems.length
      ? s.lowStockItems.map((item) => `
          <div class="flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50/50">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-[#1E293B] truncate">${esc(item.name)}</p>
              <p class="text-xs text-red-700 font-bold">${item.stock} units left</p>
            </div>
            <button type="button" data-goto="inventory" class="text-[#C84B16] text-sm font-semibold">Edit</button>
          </div>`).join('')
      : '<p class="text-sm text-slate-600">All items well stocked.</p>';

    const rows = s.recentOrders.length
      ? s.recentOrders.map((o) => {
          const first = o.items[0]?.name || '—';
          const extra = o.items.length > 1 ? ` +${o.items.length - 1}` : '';
          return `<tr>
            <td>#${esc(o.id)}</td>
            <td>${esc(o.customerName || 'Guest')}</td>
            <td class="max-w-[200px] truncate">${esc(first)}${extra}</td>
            <td><span class="px-3 py-1 bg-[#C84B16]/10 text-[#C84B16] rounded-full text-xs font-bold">${esc(o.status)}</span></td>
            <td class="font-bold">₱${o.total.toFixed(2)}</td>
            <td class="text-right"><button type="button" data-goto="orders" class="text-[#C84B16] text-sm font-semibold hover:underline">View</button></td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="6" class="py-10 text-center text-slate-500">No orders yet.</td></tr>';

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[0])}
        <section class="flex flex-wrap gap-3">
          <button type="button" data-goto="inventory" class="admin-btn-primary">Manage Inventory</button>
          <button type="button" data-goto="orders" class="admin-btn-secondary">View All Orders</button>
        </section>
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="admin-stat-card p-5">
            <span class="material-symbols-outlined text-[#C84B16] bg-[#C84B16]/10 p-2 rounded-xl">payments</span>
            <p class="text-xs uppercase tracking-widest text-slate-600 mt-3">Total Sales</p>
            <p class="text-2xl font-bold text-[#1E293B]">₱${s.totalSales.toFixed(2)}</p>
          </div>
          <div class="admin-stat-card p-5">
            <span class="material-symbols-outlined text-[#C84B16] bg-[#C84B16]/10 p-2 rounded-xl">shopping_cart</span>
            <p class="text-xs uppercase tracking-widest text-slate-600 mt-3">Orders Today</p>
            <p class="text-2xl font-bold text-[#1E293B]">${s.ordersToday}</p>
          </div>
          <div class="admin-stat-card p-5">
            <span class="material-symbols-outlined text-red-700 bg-red-100 p-2 rounded-xl">inventory_2</span>
            <p class="text-xs uppercase tracking-widest text-slate-600 mt-3">Low Stock</p>
            <p class="text-2xl font-bold text-[#1E293B]">${s.lowStockCount}</p>
          </div>
          <div class="admin-stat-card p-5">
            <span class="material-symbols-outlined text-[#C84B16] bg-[#C84B16]/10 p-2 rounded-xl" style="font-variation-settings:'FILL' 1">receipt_long</span>
            <p class="text-xs uppercase tracking-widest text-slate-600 mt-3">Total Orders</p>
            <p class="text-2xl font-bold text-[#1E293B]">${s.totalOrders}</p>
          </div>
        </section>
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div class="lg:col-span-4 admin-panel p-5 space-y-3">
            <h4 class="font-bold text-[#1E293B]">Inventory Alerts</h4>
            ${alerts}
            <button type="button" data-goto="inventory" class="w-full py-3 mt-2 text-sm font-semibold uppercase tracking-wider text-[#C84B16] border border-[#C84B16]/30 rounded-xl hover:bg-[#C84B16]/5">View Full Inventory</button>
          </div>
          <div class="lg:col-span-8 admin-panel p-5 admin-table-wrap">
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-bold text-[#1E293B]">Recent Orders</h4>
              <button type="button" data-goto="orders" class="text-[#C84B16] text-sm font-semibold hover:underline">View all</button>
            </div>
            <table><thead><tr>
              <th>Order ID</th><th>Customer</th><th>Items</th><th>Status</th><th>Amount</th><th class="text-right">Actions</th>
            </tr></thead><tbody>${rows}</tbody></table>
          </div>
        </section>
      </div>`;
  }

  function renderOrders() {
    const orders = CreuStore.getOrders();
    const rows = orders.length
      ? orders.map((o) => {
          const items = o.items.map((i) => `${esc(i.name)} ×${i.quantity}`).join('<br>');
          const opts = ORDER_STATUSES.map((st) =>
            `<option value="${st}" ${st === o.status ? 'selected' : ''}>${st}</option>`).join('');
          return `<tr>
            <td class="font-medium">#${esc(o.id)}</td>
            <td class="text-sm">${esc(o.date)}</td>
            <td>${esc(o.customerName || 'Guest')}<br><span class="text-xs text-slate-500">${esc(o.customerPhone || '')}</span></td>
            <td class="text-sm">${items}</td>
            <td class="font-bold">₱${o.total.toFixed(2)}</td>
            <td><select data-order-id="${esc(o.id)}" class="order-status-select admin-input text-sm px-2 py-1">${opts}</select></td>
          </tr>`;
        }).join('')
      : '';

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[1])}
        <div class="admin-panel admin-table-wrap p-4">
          <p id="orders-empty" class="${orders.length ? 'hidden' : ''} py-16 text-center text-slate-500">No customer orders yet.</p>
          <div class="overflow-x-auto ${orders.length ? '' : 'hidden'}">
            <table>
              <thead><tr>
                <th>ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th>
              </tr></thead>
              <tbody id="orders-table-body">${rows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  function bindOrders() {
    document.querySelectorAll('.order-status-select').forEach((sel) => {
      sel.onchange = () => {
        CreuStore.updateOrderStatus(sel.dataset.orderId, sel.value);
        CreuStore.addNotification({
          type: 'status',
          title: 'Order status updated',
          message: `Order #${sel.dataset.orderId} → ${sel.value}`,
          read: false,
        });
        renderShell();
      };
    });
  }

  function priceDisplay(item) {
    if (item.category === 'beverage') return `Reg ₱${item.priceRegular} / Lg ₱${item.priceLarge}`;
    return '₱' + item.price;
  }

  function renderInventory() {
    const items = CreuStore.getAllInventory();
    const rows = items.map((item, idx) => `
      <tr data-idx="${idx}">
        <td><input type="text" class="inv-name admin-input w-full px-2 py-1.5 text-sm" value="${esc(item.name)}"/></td>
        <td class="text-sm capitalize">${esc(item.category)}</td>
        <td class="text-sm">${priceDisplay(item)}</td>
        <td><input type="number" min="0" class="inv-stock admin-input w-20 px-2 py-1.5 text-sm" value="${item.stock ?? 0}"/></td>
        <td><label class="flex items-center gap-2 text-sm"><input type="checkbox" class="inv-enabled rounded" ${item.enabled !== false ? 'checked' : ''}/> On menu</label></td>
        <td>${item.category === 'meal' || item.category === 'beverage'
          ? `<button type="button" class="edit-price-btn text-[#C84B16] text-xs font-bold" data-idx="${idx}">Edit prices</button>`
          : `<input type="number" class="inv-price admin-input w-24 px-2 py-1.5 text-sm" value="${item.price}"/>`}
        </td>
      </tr>`).join('');

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[2])}
        <div class="flex justify-end">
          <button type="button" id="save-inventory-btn" class="admin-btn-primary">Save Changes</button>
        </div>
        <div class="admin-panel admin-table-wrap p-4 overflow-x-auto">
          <table>
            <thead><tr>
              <th>Item</th><th>Type</th><th>Price</th><th>Stock</th><th>Menu</th><th>Actions</th>
            </tr></thead>
            <tbody id="inventory-table-body">${rows}</tbody>
          </table>
        </div>
        <p class="text-sm text-slate-600">Meals include rice: Wild Rice Blend, Fried Rice, Plain Rice.</p>
      </div>`;
  }

  function bindInventory() {
    document.querySelectorAll('.edit-price-btn').forEach((btn) => {
      btn.onclick = () => {
        const all = CreuStore.getAllInventory();
        const item = all[+btn.dataset.idx];
        if (!item) return;
        if (item.category === 'beverage') {
          const reg = prompt('Regular price', item.priceRegular);
          const lg = prompt('Large price', item.priceLarge);
          if (reg != null) item.priceRegular = +reg;
          if (lg != null) item.priceLarge = +lg;
        } else {
          const p = prompt('Price', item.price);
          if (p != null) item.price = +p;
        }
        CreuStore.saveInventory(all);
        render();
      };
    });
    const saveBtn = document.getElementById('save-inventory-btn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const all = CreuStore.getAllInventory();
        document.querySelectorAll('#inventory-table-body tr').forEach((row, i) => {
          if (!all[i]) return;
          all[i].name = row.querySelector('.inv-name')?.value?.trim() || all[i].name;
          all[i].stock = parseInt(row.querySelector('.inv-stock')?.value, 10) || 0;
          all[i].enabled = row.querySelector('.inv-enabled')?.checked !== false;
          const priceInput = row.querySelector('.inv-price');
          if (priceInput) all[i].price = parseFloat(priceInput.value) || all[i].price;
        });
        CreuStore.saveInventory(all);
        CreuStore.addNotification({ type: 'inventory', title: 'Inventory updated', message: 'Menu and stock saved.', read: false });
        alert('Inventory saved.');
        render();
      };
    }
  }

  function renderCustomers() {
    const users = CreuStore.getUsers();
    const orders = CreuStore.getOrders();
    const rows = users.map((u) => {
      const userOrders = orders.filter((o) => o.userId === u.id || o.customerEmail === u.email);
      const spent = userOrders.reduce((s, o) => s + o.total, 0);
      const joined = new Date(u.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
      return `<tr>
        <td class="font-bold">${esc(u.name)}</td>
        <td class="text-sm">${esc(u.email)}</td>
        <td class="text-sm">${joined}</td>
        <td>${userOrders.length}</td>
        <td class="font-bold text-[#C84B16]">₱${spent.toFixed(2)}</td>
      </tr>`;
    }).join('');

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[3])}
        <div class="admin-panel admin-table-wrap p-4">
          <p id="customers-empty" class="${users.length ? 'hidden' : ''} py-16 text-center text-slate-500">No registered customers yet.</p>
          <div class="overflow-x-auto ${users.length ? '' : 'hidden'}">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Orders</th><th>Spent</th></tr></thead>
              <tbody id="customers-table-body">${rows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  function renderNotifications() {
    const notifications = CreuStore.getNotifications();
    const cards = notifications.map((n) => {
      const date = new Date(n.date).toLocaleString('en-PH');
      const unread = !n.read ? ' unread' : '';
      return `<div class="admin-notif-card p-4 flex justify-between gap-4 items-start bg-[#FAF6F0]${unread}">
        <div>
          <p class="font-bold text-[#1E293B]">${esc(n.title)}</p>
          <p class="text-sm text-slate-600 mt-1">${esc(n.message)}</p>
          <p class="text-xs text-slate-400 mt-2">${date}</p>
        </div>
        ${!n.read ? `<button type="button" data-notif-id="${esc(n.id)}" class="mark-read-btn text-[#C84B16] text-sm font-semibold whitespace-nowrap">Mark read</button>` : '<span class="text-xs text-slate-400">Read</span>'}
      </div>`;
    }).join('');

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[4])}
        <div class="flex justify-end">
          <button type="button" id="mark-all-read" class="admin-btn-secondary text-sm">Mark all read</button>
        </div>
        <p id="notifications-empty" class="${notifications.length ? 'hidden' : ''} text-center text-slate-500 py-16">No notifications yet.</p>
        <div id="notifications-list" class="space-y-3 max-w-3xl">${cards}</div>
      </div>`;
  }

  function bindNotifications() {
    document.querySelectorAll('.mark-read-btn').forEach((btn) => {
      btn.onclick = () => {
        CreuStore.markNotificationRead(btn.dataset.notifId);
        render();
      };
    });
    const markAll = document.getElementById('mark-all-read');
    if (markAll) {
      markAll.onclick = () => {
        CreuStore.markAllNotificationsRead();
        render();
      };
    }
  }

  const VIEW_RENDERERS = {
    dashboard: () => renderDashboard(),
    orders: () => renderOrders(),
    inventory: () => renderInventory(),
    customers: () => renderCustomers(),
    notifications: () => renderNotifications(),
  };

  function bindView() {
    const route = getRoute();
    if (route === 'orders') bindOrders();
    if (route === 'inventory') bindInventory();
    if (route === 'notifications') bindNotifications();
    bindNav();
  }

  function renderContent() {
    const route = getRoute();
    const el = document.getElementById('admin-content');
    if (!el) return;
    el.innerHTML = VIEW_RENDERERS[route]();
    bindView();
  }

  function renderShell() {
    const route = getRoute();
    const sidebarHost = document.getElementById('admin-sidebar');
    const mobileHost = document.getElementById('admin-mobile-nav');
    if (sidebarHost) sidebarHost.innerHTML = buildSidebar(route);
    if (mobileHost) mobileHost.innerHTML = buildMobileNav(route);
    bindNav();
  }

  function initLogout() {
    const logoutButton = document.getElementById('logoutButton') || document.getElementById('admin-logout-btn');
    const logoutModal = document.getElementById('logoutModal');
    const logoutCancel = document.getElementById('logoutCancel');
    const logoutConfirm = document.getElementById('logoutConfirm');
    if (logoutButton) logoutButton.onclick = () => logoutModal?.classList.remove('hidden');
    if (logoutCancel) logoutCancel.onclick = () => logoutModal?.classList.add('hidden');
    if (logoutConfirm) logoutConfirm.onclick = () => {
      localStorage.removeItem('creuAdminLoggedIn');
      window.location.href = 'index.html';
    };
  }

  function initMenuToggle() {
    const toggle = document.getElementById('admin-menu-toggle');
    const sidebar = document.getElementById('admin-sidebar-el');
    if (toggle && sidebar) {
      toggle.onclick = () => sidebar.classList.toggle('open');
    }
  }

  function render() {
    if (!requireAdmin()) return;
    renderShell();
    renderContent();
    initLogout();
    initMenuToggle();
    document.title = `Creu Admin | ${ROUTES.find((r) => r.id === getRoute())?.label || 'Dashboard'}`;
  }

  function init() {
    if (!requireAdmin()) return;
    if (!window.location.hash) window.location.hash = 'dashboard';
    window.addEventListener('hashchange', render);
    render();
  }

  global.AdminApp = { navigate, render, getRoute };
  document.addEventListener('DOMContentLoaded', init);
})(window);
