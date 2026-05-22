(function () {
  function render() {
    const users = CreuStore.getUsers();
    const orders = CreuStore.getOrders();
    const tbody = document.getElementById('customers-table-body');
    const empty = document.getElementById('customers-empty');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    tbody.innerHTML = users.map((u) => {
      const userOrders = orders.filter((o) => o.userId === u.id || o.customerEmail === u.email);
      const spent = userOrders.reduce((s, o) => s + o.total, 0);
      const joined = new Date(u.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
      return `<tr class="border-t border-slate-300/20">
        <td class="py-4 font-body-md font-bold">${u.name}</td>
        <td class="py-4 text-sm">${u.email}</td>
        <td class="py-4 text-sm">${joined}</td>
        <td class="py-4">${userOrders.length}</td>
        <td class="py-4 font-bold text-primary">₱${spent.toFixed(2)}</td>
      </tr>`;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', render);
})();
