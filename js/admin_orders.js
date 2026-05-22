(function () {
  const STATUSES = ['Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

  function render() {
    const orders = CreuStore.getOrders();
    const tbody = document.getElementById('orders-table-body');
    const empty = document.getElementById('orders-empty');
    if (!tbody) return;

    if (orders.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    tbody.innerHTML = orders.map((o) => {
      const items = o.items.map((i) => `${i.name} ×${i.quantity}`).join('<br>');
      const opts = STATUSES.map((st) => `<option value="${st}" ${st === o.status ? 'selected' : ''}>${st}</option>`).join('');
      return `<tr class="border-t border-slate-300/20">
        <td class="py-4 font-body-md">#${o.id}</td>
        <td class="py-4 text-sm">${o.date}</td>
        <td class="py-4">${o.customerName || 'Guest'}<br><span class="text-xs text-secondary">${o.customerPhone || ''}</span></td>
        <td class="py-4 text-sm">${items}</td>
        <td class="py-4 font-bold">₱${o.total.toFixed(2)}</td>
        <td class="py-4">
          <select data-order-id="${o.id}" class="order-status-select rounded-lg border border-slate-300 bg-[#FAF6F0] px-2 py-1 text-sm">${opts}</select>
        </td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('.order-status-select').forEach((sel) => {
      sel.addEventListener('change', () => {
        CreuStore.updateOrderStatus(sel.dataset.orderId, sel.value);
        CreuStore.addNotification({
          type: 'status',
          title: 'Order status updated',
          message: `Order #${sel.dataset.orderId} → ${sel.value}`,
          read: false,
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
