/**
 * Creu local data store (localStorage)
 */
(function (global) {
  const KEYS = {
    inventory: 'creu_inventory',
    orders: 'creu_orders',
    cart: 'creu_cart',
    users: 'creu_users',
    session: 'creu_session',
    notifications: 'creu_notifications',
    adminSession: 'creuAdminLoggedIn',
  };

  const RICE_OPTIONS = ['Wild Rice Blend', 'Fried Rice', 'Plain Rice'];

  const DEFAULT_INVENTORY = [
    { id: 'chicken-meal', name: 'Chicken Cordon Bleu Meal', category: 'meal', tag: 'poultry', price: 139, stock: 50, enabled: true, image: '../assets/pictures/chicken.png', hasRiceOption: true, description: 'Succulent chicken breast hand-rolled with premium ham and Gruyère, fried to golden crispiness. Served with rice.' },
    { id: 'beef-meal', name: 'Beef Cordon Bleu Meal', category: 'meal', tag: 'red-meat', price: 150, stock: 45, enabled: true, image: '../assets/pictures/beef.png', hasRiceOption: true, description: 'Premium tender beef roll stuffed with rich Swiss cheese and savory center, seared to perfection. Served with rice.' },
    { id: 'fish-meal', name: 'Fish Cordon Bleu Meal', category: 'meal', tag: 'seafood', price: 129, stock: 40, enabled: true, image: '../assets/pictures/fish.png', hasRiceOption: true, description: 'Delicate white fish fillet stuffed with fresh herbs and molten mozzarella, baked crispy. Served with rice.' },
    { id: 'chicken-shots', name: 'Chicken Cordon Bleu Shots', category: 'shots', tag: 'poultry', price: 89, stock: 60, enabled: true, image: '../assets/pictures/chicken poppers.jfif', hasRiceOption: false, description: 'Succulent chicken cordon bleu bites filled with rich cheese.' },
    { id: 'beef-shots', name: 'Beef Cordon Bleu Shots', category: 'shots', tag: 'red-meat', price: 99, stock: 55, enabled: true, image: '../assets/pictures/beef poppers.jfif', hasRiceOption: false, description: 'Hearty beef cordon bleu pops filled with molten cheese.' },
    { id: 'fish-shots', name: 'Fish Cordon Bleu Shots', category: 'shots', tag: 'seafood', price: 79, stock: 50, enabled: true, image: '../assets/pictures/fish poppers.jfif', hasRiceOption: false, description: 'Crispy bite-sized fish cordon bleu rolls stuffed with melted cheese.' },
    { id: 'coke', name: 'Coke', category: 'beverage', tag: 'beverages', priceRegular: 39, priceLarge: 49, stock: 120, enabled: true, image: '../assets/pictures/coke.jfif', hasRiceOption: false, description: 'Classic cola — choose regular or large.' },
    { id: 'ice-tea', name: 'Ice Tea', category: 'beverage', tag: 'beverages', priceRegular: 49, priceLarge: 59, stock: 80, enabled: true, image: '../assets/pictures/Ice tea.jfif', hasRiceOption: false, description: 'Refreshing iced tea — regular or large.' },
    { id: 'pineapple', name: 'Pineapple', category: 'beverage', tag: 'beverages', priceRegular: 49, priceLarge: 59, stock: 70, enabled: true, image: '../assets/pictures/pineapple.jpg', hasRiceOption: false, description: 'Tropical pineapple drink — regular or large.' },
  ];

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function mergeInventoryDefaults(existing) {
    const byId = {};
    (existing || []).forEach((item) => { byId[item.id] = item; });
    DEFAULT_INVENTORY.forEach((def) => {
      if (!byId[def.id]) byId[def.id] = { ...def };
      else {
        const cur = byId[def.id];
        if (cur.category === 'beverage' && cur.priceRegular == null) {
          cur.priceRegular = def.priceRegular;
          cur.priceLarge = def.priceLarge;
        }
        if (cur.hasRiceOption == null && def.hasRiceOption) cur.hasRiceOption = def.hasRiceOption;
        if (!cur.image && def.image) cur.image = def.image;
      }
    });
    return Object.values(byId);
  }

  function initInventory() {
    const existing = read(KEYS.inventory, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      write(KEYS.inventory, DEFAULT_INVENTORY);
      return DEFAULT_INVENTORY.slice();
    }
    const merged = mergeInventoryDefaults(existing);
    write(KEYS.inventory, merged);
    return merged;
  }

  function getInventory() {
    return initInventory().filter((i) => i.enabled !== false);
  }

  function getAllInventory() {
    return initInventory();
  }

  function saveInventory(items) {
    write(KEYS.inventory, items);
  }

  function getProductById(id) {
    return getAllInventory().find((p) => p.id === id);
  }

  function getProductByName(name) {
    return getAllInventory().find((p) => p.name === name);
  }

  function getMenuProducts(category) {
    const items = getInventory();
    if (!category || category === 'all') return items;
    if (category === 'beverages') return items.filter((i) => i.category === 'beverage');
    return items.filter((i) => i.tag === category);
  }

  function getCart() {
    return read(KEYS.cart, []);
  }

  function saveCart(cart) {
    localStorage.setItem(KEYS.cart, JSON.stringify(cart));
    if (global.renderLayout) global.renderLayout();
  }

  function getOrders() {
    return read(KEYS.orders, []);
  }

  function saveOrders(orders) {
    write(KEYS.orders, orders);
  }

  function addOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);
    addNotification({
      type: 'order',
      title: 'New order received',
      message: `Order #${order.id} from ${order.customerName} — ₱${order.total.toFixed(2)}`,
      read: false,
    });
    return order;
  }

  function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return false;
    orders[idx].status = status;
    saveOrders(orders);
    return true;
  }

  function getNotifications() {
    return read(KEYS.notifications, []);
  }

  function saveNotifications(list) {
    write(KEYS.notifications, list);
  }

  function addNotification(n) {
    const list = getNotifications();
    list.unshift({
      id: 'notif-' + Date.now(),
      date: new Date().toISOString(),
      read: false,
      ...n,
    });
    saveNotifications(list);
  }

  function markNotificationRead(id) {
    const list = getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) item.read = true;
    saveNotifications(list);
  }

  function markAllNotificationsRead() {
    const list = getNotifications().map((n) => ({ ...n, read: true }));
    saveNotifications(list);
  }

  function getUnreadNotificationCount() {
    return getNotifications().filter((n) => !n.read).length;
  }

  function getUsers() {
    return read(KEYS.users, []);
  }

  function saveUsers(users) {
    write(KEYS.users, users);
  }

  function hashPassword(pw) {
    return btoa(unescape(encodeURIComponent(pw)));
  }

  function getSession() {
    return read(KEYS.session, null);
  }

  function setSession(userId) {
    if (userId) write(KEYS.session, { userId });
    else localStorage.removeItem(KEYS.session);
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session?.userId) return null;
    return getUsers().find((u) => u.id === session.userId) || null;
  }

  function registerUser({ email, password, name }) {
    const users = getUsers();
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      return { ok: false, error: 'Email already registered.' };
    }
    const user = {
      id: 'user-' + Date.now(),
      email: normalized,
      name: name.trim(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    setSession(user.id);
    return { ok: true, user };
  }

  function loginUser(email, password) {
    const normalized = email.trim().toLowerCase();
    const user = getUsers().find((u) => u.email === normalized);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    setSession(user.id);
    return { ok: true, user };
  }

  function logoutUser() {
    setSession(null);
  }

  function updateUserProfile(userId, { name, email }) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, error: 'User not found.' };
    if (email) {
      const normalized = email.trim().toLowerCase();
      if (users.some((u) => u.email === normalized && u.id !== userId)) {
        return { ok: false, error: 'Email already in use.' };
      }
      users[idx].email = normalized;
    }
    if (name) users[idx].name = name.trim();
    saveUsers(users);
    return { ok: true, user: users[idx] };
  }

  function changeUserPassword(userId, currentPassword, newPassword) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, error: 'User not found.' };
    if (users[idx].passwordHash !== hashPassword(currentPassword)) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    users[idx].passwordHash = hashPassword(newPassword);
    saveUsers(users);
    return { ok: true };
  }

  function getOrdersForUser(userId) {
    return getOrders().filter((o) => o.userId === userId);
  }

  function formatItemDetail(item) {
    const parts = [];
    if (item.rice) parts.push('Rice: ' + item.rice);
    if (item.size) parts.push(item.size.charAt(0).toUpperCase() + item.size.slice(1));
    return parts.length ? parts.join(' · ') : '';
  }

  function beveragePrice(product, size) {
    return size === 'large' ? product.priceLarge : product.priceRegular;
  }

  function decrementStock(productId, qty) {
    const all = getAllInventory();
    const idx = all.findIndex((p) => p.id === productId);
    if (idx === -1) return;
    all[idx].stock = Math.max(0, (all[idx].stock || 0) - qty);
    saveInventory(all);
  }

  function dashboardStats() {
    const orders = getOrders();
    const inventory = getAllInventory();
    const today = new Date().toDateString();
    const ordersToday = orders.filter((o) => new Date(o.createdAt || o.date).toDateString() === today);
    const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);
    const lowStock = inventory.filter((i) => (i.stock ?? 0) <= 10);
    return {
      totalSales,
      ordersToday: ordersToday.length,
      totalOrders: orders.length,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock.slice(0, 5),
      recentOrders: orders.slice(0, 5),
    };
  }

  initInventory();

  global.CreuStore = {
    KEYS,
    RICE_OPTIONS,
    getInventory,
    getAllInventory,
    saveInventory,
    getProductById,
    getProductByName,
    getMenuProducts,
    getCart,
    saveCart,
    getOrders,
    saveOrders,
    addOrder,
    updateOrderStatus,
    getNotifications,
    saveNotifications,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    getUsers,
    saveUsers,
    getSession,
    setSession,
    getCurrentUser,
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    getOrdersForUser,
    formatItemDetail,
    beveragePrice,
    decrementStock,
    dashboardStats,
  };
})(window);
