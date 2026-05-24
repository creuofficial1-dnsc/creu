/**
 * Creu Admin — single-page app (hash routing, no full reloads)
 */

/* ─── Toast Notification System ─────────────────────────────── */
(function () {
  let _container;
  function getContainer() {
    if (!_container) {
      _container = document.createElement('div');
      _container.id = 'admin-toast-container';
      _container.style.cssText = [
        'position:fixed', 'top:20px', 'right:20px',
        'z-index:9999', 'display:flex', 'flex-direction:column',
        'gap:10px', 'pointer-events:none'
      ].join(';');
      document.body.appendChild(_container);
    }
    return _container;
  }

  window.showAdminToast = function (message, type) {
    type = type || 'success';
    const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
    const colors = {
      success: { bg: '#1E293B', icon: '#4ade80', border: 'rgba(74,222,128,0.3)' },
      error:   { bg: '#1E293B', icon: '#f87171', border: 'rgba(248,113,113,0.3)' },
      info:    { bg: '#1E293B', icon: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
      warning: { bg: '#1E293B', icon: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    };
    const c = colors[type] || colors.success;
    const toast = document.createElement('div');
    toast.style.cssText = [
      `background:${c.bg}`, `border:1px solid ${c.border}`,
      'border-radius:14px', 'padding:14px 18px',
      'display:flex', 'align-items:center', 'gap:12px',
      'pointer-events:auto', 'min-width:280px', 'max-width:360px',
      'box-shadow:0 20px 50px rgba(0,0,0,0.35)',
      'transition:all 0.35s cubic-bezier(0.22,1,0.36,1)',
      'transform:translateX(120px)', 'opacity:0',
      'font-family:Plus Jakarta Sans,sans-serif'
    ].join(';');
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="color:${c.icon};font-size:22px;font-variation-settings:'FILL' 1;flex-shrink:0">${icons[type] || 'check_circle'}</span>
      <span style="color:#f1f5f9;font-size:14px;font-weight:500;line-height:1.4;flex:1">${message}</span>
      <button onclick="this.closest('div').remove()" style="color:#94a3b8;background:none;border:none;cursor:pointer;font-size:18px;line-height:1;padding:0;flex-shrink:0">&times;</button>`;
    getContainer().appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });
    setTimeout(() => {
      toast.style.transform = 'translateX(120px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 380);
    }, 3500);
  };
})();

/* ─── Price Edit Modal ───────────────────────────────────────── */
function showPriceModal(item, idx, onSave) {
  const existing = document.getElementById('price-edit-modal');
  if (existing) existing.remove();

  const isBev = item.category === 'beverage';
  const fields = isBev
    ? `<div class="pem-field">
        <label class="pem-label">Regular Price (₱)</label>
        <input id="pem-reg" type="number" class="pem-input" value="${item.priceRegular || 0}" step="0.01" min="0"/>
       </div>
       <div class="pem-field">
        <label class="pem-label">Large Price (₱)</label>
        <input id="pem-lg" type="number" class="pem-input" value="${item.priceLarge || 0}" step="0.01" min="0"/>
       </div>`
    : `<div class="pem-field">
        <label class="pem-label">Price (₱)</label>
        <input id="pem-price" type="number" class="pem-input" value="${item.price || 0}" step="0.01" min="0"/>
       </div>`;

  const overlay = document.createElement('div');
  overlay.id = 'price-edit-modal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);animation:pemFadeIn 0.2s ease';
  overlay.innerHTML = `
    <style>
      @keyframes pemFadeIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
      .pem-box { background:#fff; border-radius:20px; padding:28px; width:100%; max-width:380px; box-shadow:0 32px 80px rgba(0,0,0,0.25); font-family:'Plus Jakarta Sans',sans-serif; }
      .pem-title { font-size:18px; font-weight:700; color:#1E293B; margin-bottom:4px; }
      .pem-sub { font-size:13px; color:#64748b; margin-bottom:20px; }
      .pem-field { margin-bottom:16px; }
      .pem-label { display:block; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
      .pem-input { width:100%; padding:10px 14px; border:1.5px solid rgba(30,41,59,.15); border-radius:12px; font-size:15px; color:#1E293B; background:#faf6f0; outline:none; transition:border-color .2s; box-sizing:border-box; }
      .pem-input:focus { border-color:#C84B16; box-shadow:0 0 0 3px rgba(200,75,22,.12); }
      .pem-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:24px; }
      .pem-cancel { border-radius:9999px; border:1px solid rgba(30,41,59,.2); padding:9px 20px; background:transparent; font-weight:600; color:#64748b; cursor:pointer; font-size:14px; }
      .pem-save { border-radius:9999px; background:#C84B16; color:#fff; font-weight:700; padding:9px 22px; border:none; cursor:pointer; font-size:14px; transition:filter .2s; }
      .pem-save:hover { filter:brightness(1.08); }
    </style>
    <div class="pem-box">
      <p class="pem-title">Edit Price</p>
      <p class="pem-sub">${item.name}</p>
      ${fields}
      <div class="pem-actions">
        <button class="pem-cancel" id="pem-cancel">Cancel</button>
        <button class="pem-save" id="pem-save">Save</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.querySelector('.pem-input')?.focus();

  overlay.querySelector('#pem-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#pem-save').onclick = () => {
    const vals = {};
    if (isBev) {
      vals.priceRegular = parseFloat(overlay.querySelector('#pem-reg').value) || 0;
      vals.priceLarge = parseFloat(overlay.querySelector('#pem-lg').value) || 0;
    } else {
      vals.price = parseFloat(overlay.querySelector('#pem-price').value) || 0;
    }
    onSave(vals);
    overlay.remove();
  };
}
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
    const statusStyles = {
      Confirmed: { bg: 'rgba(200,75,22,.06)', text: '#C84B16', border: 'rgba(200,75,22,.2)' },
      Preparing: { bg: 'rgba(200,75,22,.06)', text: '#C84B16', border: 'rgba(200,75,22,.2)' },
      Ready:     { bg: 'rgba(200,75,22,.06)', text: '#C84B16', border: 'rgba(200,75,22,.2)' },
      Completed: { bg: 'rgba(30,41,59,.06)', text: '#1E293B', border: 'rgba(30,41,59,.15)' },
      Cancelled: { bg: '#F8FAFC', text: '#94a3b8', border: 'rgba(148,163,184,0.2)' }
    };

    const rows = orders.length
      ? orders.map((o) => {
          const items = o.items.map((i) => {
            const details = CreuStore.formatItemDetail(i);
            const detailStr = details ? ` <span style="font-size:11px;color:#64748b;font-weight:normal">(${esc(details)})</span>` : '';
            return `<div style="font-size:13px;font-weight:600;color:#1E293B;margin-bottom:2px">${esc(i.name)} <span style="color:#C84B16;font-weight:700">×${i.quantity}</span>${detailStr}</div>`;
          }).join('');

          const opts = ORDER_STATUSES.map((st) =>
            `<option value="${st}" ${st === o.status ? 'selected' : ''}>${st}</option>`).join('');

          const style = statusStyles[o.status] || { bg: '#F1F5F9', text: '#475569', border: 'rgba(71,85,105,0.2)' };

          let dateStr = o.date;
          try {
            if (o.createdAt) {
              dateStr = new Date(o.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            } else if (o.date) {
              dateStr = new Date(o.date).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) {}

          return `<tr>
            <td style="font-weight:700;color:#1E293B">#${esc(o.id)}</td>
            <td style="font-size:13px;color:#475569;font-weight:500">${esc(dateStr)}</td>
            <td>
              <div style="font-weight:600;color:#1E293B;font-size:14px">${esc(o.customerName || 'Guest')}</div>
              ${o.customerPhone ? `<div style="font-size:12px;color:#64748b;display:flex;align-items:center;gap:3px;margin-top:2px">
                <span class="material-symbols-outlined" style="font-size:12px">phone</span>${esc(o.customerPhone)}
              </div>` : ''}
            </td>
            <td>${items}</td>
            <td style="font-size:14px;font-weight:800;color:#C84B16">₱${o.total.toFixed(2)}</td>
            <td>
              <select data-order-id="${esc(o.id)}" class="order-status-select text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none transition-all" style="background:${style.bg};color:${style.text};border-color:${style.border}">
                ${opts}
              </select>
            </td>
          </tr>`;
        }).join('')
      : '';

    const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
    const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[1])}

        <!-- Summary bar -->
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">Total Orders</p>
            <p style="font-size:26px;font-weight:800;color:#1E293B;margin-top:2px">${orders.length}</p>
          </div>
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">Active Orders</p>
            <p style="font-size:26px;font-weight:800;color:#C84B16;margin-top:2px">${activeOrders}</p>
          </div>
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">Revenue</p>
            <p style="font-size:26px;font-weight:800;color:#1E293B;margin-top:2px">₱${revenue.toFixed(2)}</p>
          </div>
        </div>

        <!-- Table -->
        <div style="background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:20px;box-shadow:0 8px 30px rgba(30,41,59,.06);overflow:hidden">
          <div style="padding:18px 24px;border-bottom:1px solid rgba(30,41,59,.07);display:flex;align-items:center;gap:10px">
            <span class="material-symbols-outlined" style="color:#C84B16;font-size:20px;font-variation-settings:'FILL' 1">shopping_bag</span>
            <span style="font-size:15px;font-weight:700;color:#1E293B">Customer Orders</span>
            <span style="font-size:12px;color:#94a3b8;margin-left:4px">${orders.length} orders</span>
          </div>
          <p id="orders-empty" class="${orders.length ? 'hidden' : ''} py-16 text-center text-slate-500">No customer orders yet.</p>
          <div class="overflow-x-auto ${orders.length ? '' : 'hidden'}">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#faf6f0">
                  <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">ID</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Date</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Customer</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8">Items</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Total</th>
                  <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Status</th>
                </tr>
              </thead>
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
        showAdminToast(`Order status updated to <strong>${sel.value}</strong>`, 'success');
        render();
      };
    });
  }

  function priceDisplay(item) {
    if (item.category === 'beverage') return `Reg ₱${item.priceRegular} / Lg ₱${item.priceLarge}`;
    return '₱' + item.price;
  }

  function stockBadge(stock) {
    if (stock === 0) return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:#fee2e2;color:#b91c1c"><span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:\"FILL\" 1">cancel</span>Out</span>';
    if (stock <= 5) return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:#fef9c3;color:#92400e"><span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:\"FILL\" 1">warning</span>${stock} left</span>`;
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:#dcfce7;color:#15803d"><span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:\"FILL\" 1">check_circle</span>${stock}</span>`;
  }

  function categoryPill(cat) {
    const map = { meal: ['#FFF3ED','#C84B16'], beverage: ['#EFF6FF','#2563EB'], snack: ['#F5F3FF','#7C3AED'], dessert: ['#FDF2F8','#BE185D'] };
    const [bg, color] = map[cat] || ['#F1F5F9','#475569'];
    return `<span style="display:inline-block;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:capitalize;background:${bg};color:${color}">${cat}</span>`;
  }

  function renderInventory() {
    const items = CreuStore.getAllInventory();
    const rows = items.map((item, idx) => {
      return `
      <tr class="inv-row" data-idx="${idx}" style="transition:background .15s">
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:10px;background:rgba(200,75,22,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <span class="material-symbols-outlined" style="font-size:18px;color:#C84B16;font-variation-settings:'FILL' 1">restaurant</span>
            </div>
            <input type="text" class="inv-name" value="${esc(item.name)}" style="border:none;background:transparent;font-size:14px;font-weight:600;color:#1E293B;width:100%;outline:none;font-family:inherit"/>
          </div>
        </td>
        <td>${categoryPill(item.category)}</td>
        <td style="font-size:13px;color:#475569;font-weight:500">${priceDisplay(item)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="number" min="0" class="inv-stock" value="${item.stock ?? 0}" style="width:64px;padding:6px 10px;border:1.5px solid rgba(30,41,59,.15);border-radius:10px;font-size:13px;font-weight:600;text-align:center;background:#faf6f0;color:#1E293B;outline:none;font-family:inherit"/>
            ${stockBadge(item.stock ?? 0)}
          </div>
        </td>
        <td>
          <label class="inv-toggle-label" style="display:inline-flex;align-items:center;cursor:pointer">
            <div class="inv-toggle-wrap" style="position:relative;width:40px;height:22px;flex-shrink:0">
              <input type="checkbox" class="inv-enabled" ${item.enabled !== false ? 'checked' : ''} style="opacity:0;width:0;height:0;position:absolute"/>
              <span class="inv-toggle-track" style="position:absolute;inset:0;border-radius:9999px;background:${item.enabled !== false ? '#C84B16' : '#CBD5E1'};transition:background .25s"></span>
              <span class="inv-toggle-thumb" style="position:absolute;top:3px;left:${item.enabled !== false ? '21px' : '3px'};width:16px;height:16px;border-radius:9999px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:left .25s"></span>
            </div>
          </label>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <button type="button" class="edit-price-btn" data-idx="${idx}" style="display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:9999px;border:1.5px solid rgba(200,75,22,.35);color:#C84B16;font-size:12px;font-weight:700;background:rgba(200,75,22,.06);cursor:pointer;transition:all .2s;font-family:inherit">
              <span class="material-symbols-outlined" style="font-size:15px">sell</span>Edit Price
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[2])}

        <!-- Summary bar -->
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">Total Items</p>
            <p style="font-size:26px;font-weight:800;color:#1E293B;margin-top:2px">${items.length}</p>
          </div>
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">On Menu</p>
            <p style="font-size:26px;font-weight:800;color:#C84B16;margin-top:2px">${items.filter(i => i.enabled !== false).length}</p>
          </div>
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">Low / Out</p>
            <p style="font-size:26px;font-weight:800;color:#b91c1c;margin-top:2px">${items.filter(i => (i.stock ?? 0) <= 5).length}</p>
          </div>
          <div style="display:flex;align-items:center">
            <button type="button" id="save-inventory-btn" style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:9999px;background:#C84B16;color:#fff;font-weight:700;font-size:14px;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(200,75,22,.3);transition:all .25s;font-family:inherit">
              <span class="material-symbols-outlined" style="font-size:18px;font-variation-settings:'FILL' 1">save</span>
              Save Changes
            </button>
          </div>
        </div>

        <!-- Table -->
        <div style="background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:20px;box-shadow:0 8px 30px rgba(30,41,59,.06);overflow:hidden">
          <div style="padding:18px 24px;border-bottom:1px solid rgba(30,41,59,.07);display:flex;align-items:center;gap:10px">
            <span class="material-symbols-outlined" style="color:#C84B16;font-size:20px;font-variation-settings:'FILL' 1">inventory_2</span>
            <span style="font-size:15px;font-weight:700;color:#1E293B">Menu Inventory</span>
            <span style="font-size:12px;color:#94a3b8;margin-left:4px">${items.length} items</span>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#faf6f0">
                  <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Item Name</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8">Type</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8">Current Price</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8">Stock</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8">On Menu</th>
                  <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8">Actions</th>
                </tr>
              </thead>
              <tbody id="inventory-table-body">${rows}</tbody>
            </table>
          </div>
        </div>

        <p style="font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:6px">
          <span class="material-symbols-outlined" style="font-size:15px">info</span>
          Meals include rice options: Plain Rice, Yellow Rice, Wild Rice Blend.
        </p>
      </div>`;
  }

  function bindInventory() {
    /* Toggle switch live feedback */
    document.querySelectorAll('#inventory-table-body .inv-toggle-label').forEach((label) => {
      const checkbox = label.querySelector('.inv-enabled');
      const track = label.querySelector('.inv-toggle-track');
      const thumb = label.querySelector('.inv-toggle-thumb');
      checkbox.addEventListener('change', () => {
        track.style.background = checkbox.checked ? '#C84B16' : '#CBD5E1';
        thumb.style.left = checkbox.checked ? '21px' : '3px';
      });
    });

    /* Stock input live badge update */
    document.querySelectorAll('#inventory-table-body .inv-stock').forEach((input) => {
      input.addEventListener('input', () => {
        const wrap = input.closest('div');
        const badgeEl = wrap.querySelector('span[style*="border-radius:9999px"]');
        if (!badgeEl) return;
        const v = parseInt(input.value, 10) || 0;
        if (v === 0) {
          badgeEl.style.background = '#fee2e2'; badgeEl.style.color = '#b91c1c';
          badgeEl.innerHTML = '<span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:\'FILL\' 1">cancel</span>Out';
        } else if (v <= 5) {
          badgeEl.style.background = '#fef9c3'; badgeEl.style.color = '#92400e';
          badgeEl.innerHTML = `<span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:\'FILL\' 1">warning</span>${v} left`;
        } else {
          badgeEl.style.background = '#dcfce7'; badgeEl.style.color = '#15803d';
          badgeEl.innerHTML = `<span class="material-symbols-outlined" style="font-size:13px;font-variation-settings:\'FILL\' 1">check_circle</span>${v}`;
        }
      });
      input.addEventListener('focus', () => { input.style.borderColor = '#C84B16'; input.style.boxShadow = '0 0 0 3px rgba(200,75,22,.12)'; });
      input.addEventListener('blur',  () => { input.style.borderColor = 'rgba(30,41,59,.15)'; input.style.boxShadow = 'none'; });
    });

    /* Edit price buttons — open modal instead of prompt */
    document.querySelectorAll('.edit-price-btn').forEach((btn) => {
      btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(200,75,22,.12)'; btn.style.borderColor = '#C84B16'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(200,75,22,.06)'; btn.style.borderColor = 'rgba(200,75,22,.35)'; });
      btn.onclick = () => {
        const all = CreuStore.getAllInventory();
        const item = all[+btn.dataset.idx];
        if (!item) return;
        showPriceModal(item, +btn.dataset.idx, (vals) => {
          Object.assign(item, vals);
          CreuStore.saveInventory(all);
          showAdminToast(`Price updated for <strong>${item.name}</strong>`, 'success');
          render();
        });
      };
    });

    /* Save button */
    const saveBtn = document.getElementById('save-inventory-btn');
    if (saveBtn) {
      saveBtn.addEventListener('mouseenter', () => { saveBtn.style.filter = 'brightness(1.08)'; saveBtn.style.transform = 'translateY(-1px)'; });
      saveBtn.addEventListener('mouseleave', () => { saveBtn.style.filter = ''; saveBtn.style.transform = ''; });
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
        showAdminToast('Inventory saved successfully!', 'success');
        render();
      };
    }
  }

  function renderCustomers() {
    const users = CreuStore.getUsers();
    const orders = CreuStore.getOrders();
    
    const totalSpent = users.reduce((sum, u) => {
      const userOrders = orders.filter((o) => o.userId === u.id || o.customerEmail === u.email);
      return sum + userOrders.reduce((s, o) => s + o.total, 0);
    }, 0);
    
    const avgSpent = users.length ? totalSpent / users.length : 0;

    const rows = users.length
      ? users.map((u) => {
          const userOrders = orders.filter((o) => o.userId === u.id || o.customerEmail === u.email);
          const spent = userOrders.reduce((s, o) => s + o.total, 0);
          const joined = new Date(u.createdAt || Date.now()).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
          const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

          return `<tr>
            <td>
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:36px;height:36px;border-radius:50%;background:rgba(30,41,59,.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#1E293B;font-size:13px;font-weight:700;letter-spacing:.05em;border:1px solid rgba(30,41,59,.05)">
                  ${esc(initials)}
                </div>
                <div style="font-weight:600;color:#1E293B;font-size:14px">${esc(u.name)}</div>
              </div>
            </td>
            <td style="font-size:13px;color:#475569;font-weight:500">${esc(u.email)}</td>
            <td style="font-size:13px;color:#475569;font-weight:500">${esc(joined)}</td>
            <td>
              <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:#F1F5F9;color:#475569">
                <span class="material-symbols-outlined" style="font-size:13px">shopping_bag</span>${userOrders.length}
              </span>
            </td>
            <td style="font-size:14px;font-weight:800;color:#1E293B">₱${spent.toFixed(2)}</td>
          </tr>`;
        }).join('')
      : '';

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[3])}

        <!-- Summary bar -->
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">Total Customers</p>
            <p style="font-size:26px;font-weight:800;color:#1E293B;margin-top:2px">${users.length}</p>
          </div>
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">Registered Spent</p>
            <p style="font-size:26px;font-weight:800;color:#C84B16;margin-top:2px">₱${totalSpent.toFixed(2)}</p>
          </div>
          <div style="flex:1;min-width:140px;background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:16px;padding:16px 20px;box-shadow:0 4px 16px rgba(30,41,59,.06)">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600">Avg Value / User</p>
            <p style="font-size:26px;font-weight:800;color:#1E293B;margin-top:2px">₱${avgSpent.toFixed(2)}</p>
          </div>
        </div>

        <!-- Table -->
        <div style="background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:20px;box-shadow:0 8px 30px rgba(30,41,59,.06);overflow:hidden">
          <div style="padding:18px 24px;border-bottom:1px solid rgba(30,41,59,.07);display:flex;align-items:center;gap:10px">
            <span class="material-symbols-outlined" style="color:#C84B16;font-size:20px;font-variation-settings:'FILL' 1">group</span>
            <span style="font-size:15px;font-weight:700;color:#1E293B">Customer Directory</span>
            <span style="font-size:12px;color:#94a3b8;margin-left:4px">${users.length} users</span>
          </div>
          <p id="customers-empty" class="${users.length ? 'hidden' : ''} py-16 text-center text-slate-500">No registered customers yet.</p>
          <div class="overflow-x-auto ${users.length ? '' : 'hidden'}">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#faf6f0">
                  <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Name</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Email</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Joined</th>
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Orders</th>
                  <th style="padding:12px 20px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;white-space:nowrap">Spent</th>
                </tr>
              </thead>
              <tbody id="customers-table-body">${rows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  function renderNotifications() {
    const notifications = CreuStore.getNotifications();
    const cards = notifications.length
      ? notifications.map((n) => {
          let dateStr = n.date;
          try {
            dateStr = new Date(n.date).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          } catch (e) {}
          
          const isUnread = !n.read;
          
          // Icon configuration based on type
          const iconMap = {
            order: { name: 'shopping_bag', color: '#C84B16', bg: 'rgba(200,75,22,.06)' },
            status: { name: 'rule', color: '#1E293B', bg: 'rgba(30,41,59,.06)' },
            inventory: { name: 'inventory_2', color: '#C84B16', bg: 'rgba(200,75,22,.06)' }
          };
          const icon = iconMap[n.type] || { name: 'notifications', color: '#1E293B', bg: 'rgba(30,41,59,.06)' };
          
          // Dynamic card styles - no heavy color clutter
          const cardBg = isUnread ? 'rgba(200, 75, 22, 0.02)' : 'transparent';
          const borderLeft = isUnread ? '4px solid #C84B16' : '4px solid transparent';
          
          return `
            <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(30,41,59,.06);background:${cardBg};border-left:${borderLeft};transition:background .2s">
              <div style="display:flex;gap:14px;align-items:start;flex:1">
                <div style="width:38px;height:38px;border-radius:12px;background:${icon.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${icon.color}">
                  <span class="material-symbols-outlined" style="font-size:18px">${icon.name}</span>
                </div>
                <div>
                  <p style="font-weight:700;color:#1E293B;font-size:14px;margin:0">${esc(n.title)}</p>
                  <p style="font-size:13px;color:#475569;margin:3px 0 0 0;line-height:1.4">${esc(n.message)}</p>
                  <p style="font-size:11px;color:#94a3b8;margin:6px 0 0 0;display:flex;align-items:center;gap:4px">
                    <span class="material-symbols-outlined" style="font-size:13px">schedule</span>${esc(dateStr)}
                  </p>
                </div>
              </div>
              <div style="flex-shrink:0">
                ${isUnread 
                  ? `<button type="button" data-notif-id="${esc(n.id)}" class="mark-read-btn text-xs font-bold px-3 py-1.5 rounded-full border border-[rgba(200,75,22,0.2)] text-[#C84B16] bg-[rgba(200,75,22,0.04)] hover:bg-[rgba(200,75,22,0.1)] cursor-pointer transition-all" style="outline:none;font-family:inherit">Mark read</button>` 
                  : '<span style="font-size:11px;color:#94a3b8;font-weight:600;padding-right:8px">Read</span>'
                }
              </div>
            </div>`;
        }).join('')
      : '';

    const unreadCount = notifications.filter(n => !n.read).length;

    return `
      <div class="admin-view space-y-6">
        ${pageHeader(ROUTES[4])}

        <!-- Unified Feed Panel -->
        <div style="background:#fff;border:1px solid rgba(30,41,59,.08);border-radius:20px;box-shadow:0 8px 30px rgba(30,41,59,.06);overflow:hidden;max-width:800px">
          <div style="padding:18px 24px;border-bottom:1px solid rgba(30,41,59,.07);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div style="display:flex;align-items:center;gap:10px">
              <span class="material-symbols-outlined" style="color:#C84B16;font-size:20px;font-variation-settings:'FILL' 1">notifications</span>
              <span style="font-size:15px;font-weight:700;color:#1E293B">Activity Feed</span>
              <span style="font-size:12px;color:#94a3b8;margin-left:4px">${unreadCount} unread</span>
            </div>
            <div>
              <button type="button" id="mark-all-read" style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:9999px;border:1.5px solid rgba(30,41,59,.15);color:#475569;font-size:12px;font-weight:700;background:transparent;cursor:pointer;transition:all .2s;font-family:inherit">
                Mark all read
              </button>
            </div>
          </div>
          <p id="notifications-empty" class="${notifications.length ? 'hidden' : ''} text-center text-slate-500 py-16">No notifications yet.</p>
          <div id="notifications-list" class="${notifications.length ? '' : 'hidden'}">${cards}</div>
        </div>
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
