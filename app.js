// ========== TELEGRAM MINI APP КОНФИГУРАЦИЯ ==========
console.log('🛍️ Telegram Mini App запускается...');

// Глобальные переменные
let tg = null;
let isTelegramApp = false;
let telegramUser = null;

// ========== ИНИЦИАЛИЗАЦИЯ TELEGRAM ==========
function initTelegram() {
    console.log('🔍 Проверка Telegram WebApp...');
    
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        isTelegramApp = true;
        
        console.log('✅ Telegram WebApp обнаружен');
        console.log('Платформа:', tg.platform);
        console.log('Версия:', tg.version);
        
        // Инициализация
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
        
        // Получаем данные пользователя
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            telegramUser = tg.initDataUnsafe.user;
            console.log('👤 Пользователь Telegram:', telegramUser);
        }
        
        // Настраиваем главную кнопку
        setupTelegramMainButton();
        
        // Применяем тему
        applyTelegramTheme();
        
    } else {
        console.log('⚠️ Не в Telegram Mini App. Режим браузера.');
        isTelegramApp = false;
        
        // Эмуляция для разработки
        tg = {
            ready: (callback) => callback && setTimeout(callback, 100),
            expand: () => console.log('[DEV] Telegram expand'),
            showAlert: (msg) => alert(msg),
            showConfirm: (msg) => confirm(msg),
            close: () => console.log('[DEV] Telegram close'),
            MainButton: {
                show: () => console.log('[DEV] MainButton show'),
                hide: () => console.log('[DEV] MainButton hide'),
                setText: (text) => console.log('[DEV] MainButton text:', text),
                onClick: (callback) => {
                    document.getElementById('checkout-btn')?.addEventListener('click', callback);
                },
                showProgress: () => console.log('[DEV] MainButton progress'),
                hideProgress: () => console.log('[DEV] MainButton hideProgress')
            }
        };
    }
}

// ========== НАСТРОЙКА ГЛАВНОЙ КНОПКИ TELEGRAM ==========
function setupTelegramMainButton() {
    if (!isTelegramApp || !tg) return;
    
    tg.MainButton.hide();
    tg.MainButton.color = '#4CAF50';
    tg.MainButton.textColor = '#FFFFFF';
    
    tg.MainButton.onClick(() => {
        console.log('🟢 Нажата главная кнопка Telegram');
        checkout();
    });
}

// Обновление кнопки Telegram
function updateTelegramButton() {
    if (!isTelegramApp || !tg) return;
    
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    if (totalItems > 0 && cart.length > 0) {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        tg.MainButton.setText(`🛒 Оформить заказ (${totalPrice.toLocaleString()} ₽)`);
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// ========== ПРИМЕНЕНИЕ ТЕМЫ TELEGRAM ==========
function applyTelegramTheme() {
    if (!isTelegramApp || !tg || !tg.themeParams) return;
    
    const root = document.documentElement;
    
    if (tg.themeParams.bg_color) {
        root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
        document.body.style.backgroundColor = tg.themeParams.bg_color;
    }
    
    if (tg.themeParams.text_color) {
        root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
        document.body.style.color = tg.themeParams.text_color;
    }
}

// ========== TELEGRAM УВЕДОМЛЕНИЯ ==========
function showTelegramAlert(message) {
    if (isTelegramApp && tg && tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

function showTelegramConfirm(message) {
    if (isTelegramApp && tg && tg.showConfirm) {
        return new Promise((resolve) => {
            const result = confirm(message);
            resolve(result);
        });
    } else {
        return Promise.resolve(confirm(message));
    }
}

// ========== ОТПРАВКА ДАННЫХ В TELEGRAM ==========
async function sendToTelegram(data) {
    if (!isTelegramApp || !tg) {
        console.log('📤 Данные для отправки в Telegram:', data);
        return { ok: false, error: 'Not in Telegram' };
    }
    
    try {
        if (tg.sendData) {
            tg.sendData(JSON.stringify(data));
            console.log('✅ Данные отправлены в Telegram:', data);
            return { ok: true };
        }
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error);
        return { ok: false, error: error.message };
    }
    
    return { ok: false, error: 'sendData not available' };
}

// ========== ОБНОВЛЕННАЯ ФУНКЦИЯ CHECKOUT ==========
async function checkout() {
    console.log('💳 Начало оформления заказа...');
    
    if (cart.length === 0) {
        showTelegramAlert('🛒 Корзина пуста! Добавьте товары.');
        return;
    }
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Подтверждение
    const confirmMessage = `Подтвердить заказ на ${totalPrice.toLocaleString()} ₽?\n\nТоваров: ${totalItems} шт`;
    const confirmed = await showTelegramConfirm(confirmMessage);
    
    if (!confirmed) {
        console.log('❌ Пользователь отменил заказ');
        return;
    }
    
    // Показываем прогресс
    if (isTelegramApp && tg && tg.MainButton.showProgress) {
        tg.MainButton.showProgress();
    }
    
    try {
        // Данные заказа
        const orderData = {
            action: 'checkout',
            order_id: 'ORD-' + Date.now(),
            user: telegramUser,
            items: cart,
            total: totalPrice,
            total_items: totalItems,
            timestamp: new Date().toISOString(),
            platform: isTelegramApp ? 'telegram' : 'web'
        };
        
        console.log('📦 Данные заказа:', orderData);
        
        // Отправляем в Telegram
        const telegramResult = await sendToTelegram(orderData);
        
        if (telegramResult.ok) {
            showTelegramAlert(`✅ Заказ #${orderData.order_id} оформлен!\n\nСумма: ${totalPrice.toLocaleString()} ₽\nТоваров: ${totalItems} шт\n\nМы свяжемся с вами!`);
            
            // Сохраняем в историю
            saveOrderHistory(orderData);
            
            // Закрываем Mini App
            if (isTelegramApp && tg && tg.close) {
                setTimeout(() => tg.close(), 2000);
            }
            
        } else {
            console.error('Ошибка Telegram:', telegramResult.error);
            showTelegramAlert(`⚠️ Заказ #${orderData.order_id} сохранен!\n\nОшибка связи. Мы получили ваш заказ и свяжемся позже.`);
            saveOrderLocally(orderData);
        }
        
    } catch (error) {
        console.error('❌ Ошибка оформления заказа:', error);
        showTelegramAlert('❌ Ошибка при оформлении заказа. Попробуйте еще раз.');
        
    } finally {
        // Скрываем прогресс
        if (isTelegramApp && tg && tg.MainButton.hideProgress) {
            tg.MainButton.hideProgress();
        }
        
        // Очищаем корзину
        cart = [];
        updateCart();
        updateTelegramButton();
        closeCart();
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function saveOrderHistory(order) {
    const history = JSON.parse(localStorage.getItem('telegram_orders') || '[]');
    history.push({ ...order, saved_at: new Date().toISOString() });
    localStorage.setItem('telegram_orders', JSON.stringify(history));
    console.log('💾 Заказ сохранен в историю');
}

function saveOrderLocally(order) {
    const pending = JSON.parse(localStorage.getItem('pending_orders') || '[]');
    pending.push(order);
    localStorage.setItem('pending_orders', JSON.stringify(pending));
    console.log('💾 Заказ сохранен локально:', pending.length);
}

// ========== ДАННЫЕ ТОВАРОВ ==========
let products = [
    { 
        id: 1, 
        name: "Смартфон iPhone 15 Pro", 
        category: "electronics", 
        price: 109999, 
        description: "Титановый корпус, камера 48Мп, 5G",
        img: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        stock: 8,
        rating: 4.9
    },
    { 
        id: 2, 
        name: "Футболка Oversize", 
        category: "clothes", 
        price: 2499, 
        description: "Свободный крой, 100% хлопок",
        img: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        stock: 32,
        rating: 4.6
    },
    { 
        id: 3, 
        name: "Книга 'Гарри Поттер'", 
        category: "books", 
        price: 899, 
        description: "Коллекционное издание, твердый переплет",
        img: "https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        stock: 18,
        rating: 4.8
    },
    { 
        id: 4, 
        name: "Наушники Sony WH-1000XM5", 
        category: "electronics", 
        price: 34999, 
        description: "Шумоподавление, 30 часов работы",
        img: "https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        stock: 6,
        rating: 4.9
    },
    { 
        id: 5, 
        name: "Джинсы Slim Fit", 
        category: "clothes", 
        price: 5499, 
        description: "Облегающие, стрейч, синий деним",
        img: "https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        stock: 24,
        rating: 4.5
    },
    { 
        id: 6, 
        name: "Кофемашина De'Longhi", 
        category: "home", 
        price: 48999, 
        description: "Автоматическая, сенсорный экран",
        img: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        stock: 4,
        rating: 4.8
    },
    { 
        id: 7, 
        name: "Часы Apple Watch Ultra", 
        category: "electronics", 
        price: 69999, 
        description: "Водонепроницаемые, GPS, пульсометр",
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
        stock: 11,
        rating: 4.7
    },
    { 
        id: 8, 
        name: "Кроссовки Nike Air Force", 
        category: "clothes", 
        price: 12999, 
        description: "Кожаные, белые, платформа 3 см",
        img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        stock: 19,
        rating: 4.6
    }
];

let cart = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentPriceFilter = 'all';

// ========== ФУНКЦИИ ПОКАЗА ТОВАРОВ ==========
function showProducts() {
    console.log('📦 Загрузка товаров...');
    const container = document.getElementById('product-list');
    if (!container) {
        console.error('❌ Контейнер товаров не найден!');
        return;
    }
    
    // Фильтрация
    let filteredProducts = products.filter(p => {
        if (currentCategory !== 'all' && p.category !== currentCategory) return false;
        
        if (currentSearch) {
            const searchTerm = currentSearch.toLowerCase();
            if (!p.name.toLowerCase().includes(searchTerm) && 
                !p.description.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }
        
        if (currentPriceFilter !== 'all') {
            const price = p.price;
            switch(currentPriceFilter) {
                case '0-1000': if (price > 1000) return false; break;
                case '1001-5000': if (price < 1001 || price > 5000) return false; break;
                case '5001+': if (price < 5001) return false; break;
            }
        }
        
        return true;
    });
    
    // Сортировка
    filteredProducts.sort((a, b) => {
        switch(currentSort) {
            case 'cheap': return a.price - b.price;
            case 'expensive': return b.price - a.price;
            case 'name': return a.name.localeCompare(b.name);
            default: return 0;
        }
    });
    
    // Очистка и отображение
    container.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <p>😔 Товары не найдены</p>
                <button onclick="clearFilters()">Сбросить фильтры</button>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="product-image">
                <img src="${p.img}" alt="${p.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwYXRoIGQ9Ik0yMSAxNWwtNS01LTUgNSIvPjwvc3ZnPg=='; this.alt='Изображение'">
                ${p.stock < 3 ? '<span class="low-stock">⏳ Осталось мало</span>' : ''}
            </div>
            <div class="product-info">
                <h4 class="product-title">${p.name}</h4>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}
                    <span>${p.rating}</span>
                </div>
                <p class="product-description">${p.description}</p>
                <div class="product-footer">
                    <div class="product-price">${formatPrice(p.price)} ₽</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${p.id}, event)">
                        ${isInCart(p.id) ? '✓ В корзине' : '🛒 В корзину'}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    
    console.log(`✅ Показано товаров: ${filteredProducts.length}`);
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ========== ФУНКЦИИ КОРЗИНЫ ==========
function addToCart(productId, event = null) {
    console.log('➕ Добавление в корзину:', productId);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        console.error('❌ Товар не найден');
        return;
    }
    
    const existingIndex = cart.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    
    if (event && event.target) {
        const btn = event.target;
        const originalText = btn.innerHTML;
        const originalBg = btn.style.background;
        
        btn.innerHTML = '✓ Добавлено';
        btn.style.background = '#4CAF50';
        btn.style.color = 'white';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = originalBg;
            btn.style.color = '';
        }, 1500);
    }
    
    if (tg && tg.showAlert) {
        tg.showAlert(`✅ ${product.name} добавлен в корзину!`);
    }
}

function removeFromCart(productId) {
    console.log('➖ Удаление из корзины:', productId);
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCart();
        }
    }
}

function updateCart() {
    console.log('🔄 Обновление корзины...');
    
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('total-price');
    const itemsEl = document.getElementById('cart-items');
    const countBigEl = document.getElementById('cart-count-big');
    
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    if (countEl) {
        countEl.textContent = totalItems;
        countEl.style.display = totalItems > 0 ? 'inline' : 'none';
    }
    
    if (countBigEl) {
        countBigEl.textContent = totalItems;
    }
    
    if (totalEl) {
        totalEl.textContent = formatPrice(totalPrice);
    }
    
    if (itemsEl) {
        itemsEl.innerHTML = '';
        
        if (cart.length === 0) {
            itemsEl.innerHTML = `
                <div class="empty-cart">
                    <p>🛒 Корзина пуста</p>
                    <p>Добавьте товары из каталога</p>
                </div>
            `;
        } else {
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <div class="cart-item-left">
                        <img src="${item.img}" alt="${item.name}" 
                             onerror="this.style.display='none'">
                        <div class="cart-item-info">
                            <strong>${item.name}</strong>
                            <div class="cart-item-price">${formatPrice(item.price)} ₽</div>
                        </div>
                    </div>
                    <div class="cart-item-right">
                        <div class="quantity-controls">
                            <button class="qty-btn minus" onclick="updateCartQuantity(${item.id}, ${(item.quantity || 1) - 1})">-</button>
                            <span class="qty-value">${item.quantity || 1}</span>
                            <button class="qty-btn plus" onclick="updateCartQuantity(${item.id}, ${(item.quantity || 1) + 1})">+</button>
                        </div>
                        <div class="cart-item-total">${formatPrice(item.price * (item.quantity || 1))} ₽</div>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
                    </div>
                `;
                itemsEl.appendChild(itemDiv);
            });
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // ОБНОВЛЯЕМ КНОПКУ TELEGRAM
    updateTelegramButton();
    
    console.log(`✅ Корзина обновлена: ${totalItems} товаров на ${totalPrice} ₽`);
}

function isInCart(productId) {
    return cart.some(item => item.id === productId);
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Очистить всю корзину?')) {
        cart = [];
        updateCart();
        console.log('🗑️ Корзина очищена');
    }
}

// ========== ФИЛЬТРЫ И ПОИСК ==========
function searchProducts() {
    currentSearch = document.getElementById('search').value.trim();
    console.log('🔍 Поиск:', currentSearch);
    showProducts();
}

function sortProducts() {
    currentSort = document.getElementById('sort').value;
    console.log('📊 Сортировка:', currentSort);
    showProducts();
}

function filterByPrice() {
    currentPriceFilter = document.getElementById('price-filter').value;
    console.log('💰 Фильтр по цене:', currentPriceFilter);
    showProducts();
}

function clearFilters() {
    currentCategory = 'all';
    currentSearch = '';
    currentSort = 'default';
    currentPriceFilter = 'all';
    
    document.getElementById('search').value = '';
    document.getElementById('sort').value = 'default';
    document.getElementById('price-filter').value = 'all';
    
    document.querySelectorAll('.categories button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'all');
    });
    
    console.log('♻️ Фильтры сброшены');
    showProducts();
}

// ========== КОРЗИНА UI ==========
function openCart() {
    console.log('📦 Открытие корзины');
    document.getElementById('cart-panel').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    console.log('📦 Закрытие корзины');
    document.getElementById('cart-panel').classList.remove('open');
    document.body.style.overflow = 'auto';
}

// ========== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ==========
function initApp() {
    console.log('🚀 Инициализация приложения...');
    
    initTelegram();
    
    // Загружаем корзину
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log(`📁 Корзина загружена: ${cart.length} товаров`);
        }
    } catch (e) {
        console.error('❌ Ошибка загрузки корзины:', e);
        cart = [];
    }
    
    // Настройка категорий
    document.querySelectorAll('.categories button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.categories button').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            currentCategory = this.dataset.category;
            console.log('🏷️ Категория:', currentCategory);
            showProducts();
        });
    });
    
    // Поиск по Enter
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchProducts();
        });
    }
    
    // Закрытие корзины при клике вне её
    document.addEventListener('click', (e) => {
        const cartPanel = document.getElementById('cart-panel');
        const cartBtn = document.querySelector('.cart-btn');
        
        if (cartPanel && cartPanel.classList.contains('open') &&
            !cartPanel.contains(e.target) && 
            !cartBtn.contains(e.target)) {
            closeCart();
        }
    });
    
    // Показываем товары
    showProducts();
    updateCart();
    
    console.log('✅ Приложение инициализировано');
    console.log('📊 Режим:', isTelegramApp ? 'Telegram Mini App' : 'Браузер');
    console.log('🛒 Товаров в корзине:', cart.length);
}

// ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен');
    setTimeout(initApp, 100);
});

// Экспортируем функции
window.initApp = initApp;
window.checkout = checkout;
window.updateTelegramButton = updateTelegramButton;
window.searchProducts = searchProducts;
window.sortProducts = sortProducts;
window.filterByPrice = filterByPrice;
window.openCart = openCart;
window.closeCart = closeCart;
window.clearFilters = clearFilters;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;

console.log('✅ app.js полностью загружен и готов к работе');
