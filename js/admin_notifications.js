(function () {
  function render() {
    const list = document.getElementById('notifications-list');
    const empty = document.getElementById('notifications-empty');
    if (!list) return;

    const notifications = CreuStore.getNotifications();
    if (notifications.length === 0) {
      list.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    list.innerHTML = notifications.map((n) => {
      const date = new Date(n.date).toLocaleString('en-PH');
      const unread = !n.read ? 'border-l-4 border-primary bg-primary/5' : '';
      return `<div class="p-md rounded-xl border border-slate-200/50 bg-[#FAF6F0] ${unread} flex justify-between gap-md items-start">
        <div>
          <p class="font-label-lg text-label-lg font-bold text-[#1E293B]">${n.title}</p>
          <p class="font-body-md text-sm text-secondary mt-1">${n.message}</p>
          <p class="font-label-sm text-xs text-slate-400 mt-2">${date}</p>
        </div>
        ${!n.read ? `<button type="button" data-id="${n.id}" class="mark-read-btn text-primary text-sm font-label-lg whitespace-nowrap">Mark read</button>` : '<span class="text-xs text-slate-400">Read</span>'}
      </div>`;
    }).join('');

    list.querySelectorAll('.mark-read-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        CreuStore.markNotificationRead(btn.dataset.id);
        render();
        if (window.renderAdminLayout) renderAdminLayout();
      });
    });
  }

  document.getElementById('mark-all-read')?.addEventListener('click', () => {
    CreuStore.markAllNotificationsRead();
    render();
    if (window.renderAdminLayout) renderAdminLayout();
  });

  document.addEventListener('DOMContentLoaded', render);
})();
