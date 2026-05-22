(function () {
  function priceDisplay(item) {
    if (item.category === 'beverage') {
      return `Reg ₱${item.priceRegular} / Lg ₱${item.priceLarge}`;
    }
    return '₱' + item.price;
  }

  function render() {
    const items = CreuStore.getAllInventory();
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    tbody.innerHTML = items.map((item, idx) => `
      <tr class="border-t border-slate-300/20" data-idx="${idx}">
        <td class="py-3"><input type="text" class="inv-name w-full rounded border px-2 py-1 text-sm" value="${item.name}"/></td>
        <td class="py-3 text-sm capitalize">${item.category}</td>
        <td class="py-3 text-sm">${priceDisplay(item)}</td>
        <td class="py-3"><input type="number" min="0" class="inv-stock w-20 rounded border px-2 py-1 text-sm" value="${item.stock ?? 0}"/></td>
        <td class="py-3">
          <label class="flex items-center gap-1 text-sm">
            <input type="checkbox" class="inv-enabled" ${item.enabled !== false ? 'checked' : ''}/> On menu
          </label>
        </td>
        <td class="py-3">
          ${item.category === 'meal' || item.category === 'beverage'
            ? `<button type="button" class="edit-price-btn text-primary text-xs font-bold" data-idx="${idx}">Edit prices</button>`
            : `<input type="number" class="inv-price w-24 rounded border px-2 py-1 text-sm" value="${item.price}"/>`}
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('.edit-price-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const all = CreuStore.getAllInventory();
        const item = all[+btn.dataset.idx];
        if (!item) return;
        if (item.category === 'beverage') {
          const reg = prompt('Regular price', item.priceRegular);
          const lg = prompt('Large price', item.priceLarge);
          if (reg != null) item.priceRegular = +reg;
          if (lg != null) item.priceLarge = +lg;
        } else {
          const p = prompt('Meal price', item.price);
          if (p != null) item.price = +p;
        }
        CreuStore.saveInventory(all);
        render();
      });
    });
  }

  document.getElementById('save-inventory-btn')?.addEventListener('click', () => {
    const all = CreuStore.getAllInventory();
    const rows = document.querySelectorAll('#inventory-table-body tr');
    rows.forEach((row, i) => {
      if (!all[i]) return;
      all[i].name = row.querySelector('.inv-name')?.value?.trim() || all[i].name;
      all[i].stock = parseInt(row.querySelector('.inv-stock')?.value, 10) || 0;
      all[i].enabled = row.querySelector('.inv-enabled')?.checked !== false;
      const priceInput = row.querySelector('.inv-price');
      if (priceInput) all[i].price = parseFloat(priceInput.value) || all[i].price;
    });
    CreuStore.saveInventory(all);
    CreuStore.addNotification({ type: 'inventory', title: 'Inventory updated', message: 'Menu stock and settings saved.', read: false });
    alert('Inventory saved.');
    render();
  });

  document.addEventListener('DOMContentLoaded', render);
})();
