(function () {
  function render() {
    const s = CreuStore.dashboardStats();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-sales', '₱' + s.totalSales.toFixed(2));
    set('stat-orders-today', String(s.ordersToday));
    set('stat-low-stock', String(s.lowStockCount));
    set('stat-total-orders', String(s.totalOrders));

    const alertsEl = document.getElementById('inventory-alerts');
    if (alertsEl) {
      if (s.lowStockItems.length === 0) {
        alertsEl.innerHTML = '<p class="text-secondary text-sm">All items well stocked.</p>';
      } else {
        alertsEl.innerHTML = s.lowStockItems.map((item) => `
          <div class="flex items-center gap-sm p-sm rounded-xl border border-error/20 bg-error/5">
            <div class="flex-1 min-w-0">
              <p class="font-label-lg text-on-surface truncate">${item.name}</p>
              <p class="font-label-sm text-error font-bold">${item.stock} units left</p>
            </div>
            <a href="admin_inventory.html" class="text-primary text-sm font-label-lg">Edit</a>
          </div>`).join('');
      }
    }

    const tbody = document.getElementById('recent-orders-body');
    if (tbody) {
      if (s.recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-secondary">No orders yet.</td></tr>';
      } else {
        tbody.innerHTML = s.recentOrders.map((o) => {
          const first = o.items[0]?.name || '—';
          const extra = o.items.length > 1 ? ` +${o.items.length - 1}` : '';
          return `<tr>
            <td class="py-5 font-body-md text-[#1E293B]">#${o.id}</td>
            <td class="py-5 font-body-md">${o.customerName || 'Guest'}</td>
            <td class="py-5 font-body-md truncate max-w-[200px]">${first}${extra}</td>
            <td class="py-5"><span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">${o.status}</span></td>
            <td class="py-5 font-body-md font-bold">₱${o.total.toFixed(2)}</td>
            <td class="py-5 text-right"><a href="admin_orders.html" class="text-primary text-sm hover:underline">View</a></td>
          </tr>`;
        }).join('');
      }
    }
  }

  document.addEventListener('DOMContentLoaded', render);
})();
