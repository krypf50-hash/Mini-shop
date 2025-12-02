// ========== НАЧАЛО app.js ==========
console.log('app.js начал загружаться');

// Telegram инициализация
let tg = window.Telegram?.WebApp;

if (tg) {
    console.log('Telegram найден');
    try {
        tg.ready();
        tg.expand();
        console.log('Telegram WebApp инициализирован');
    } catch (e) {
        console.error('Ошибка Telegram:', e);
    }
} else {
    console.log('Telegram не найден, режим браузера');
    // Эмуляция для теста
    window.Telegram = {
        WebApp: {
            ready: () => console.log('Telegram ready (эмуляция)'),
            expand: () => console.log('Telegram expand (эмуляция)'),
            initDataUnsafe: {
                user: { 
                    id: 123456789, 
                    first_name: 'Тест',
                    username: 'test_user'
                }
            },
            sendData: (data) => {
                console.log('Отправка данных:', data);
                return true;
            }
        }
    };
    tg = window.Telegram.WebApp;
}

// ========== ДАННЫЕ ТОВАРОВ ==========
let products = [
    { id: 1, name: "Смартфон iPhone 14", category: "electronics", price: 79999, 
      description: "Новый iPhone 14, 128GB", img: "https://via.placeholder.com/150/4CAF50/FFFFFF?text=iPhone" },
    { id: 2, name: "Футболка Nike", category: "clothes", price: 2499, 
      description: "Хлопковая футболка", img: "https://via.placeholder.com/150/2196F3/FFFFFF?text=Nike" },
    { id: 3, name: "Книга 'Гарри Поттер'", category: "books", price: 899, 
      description: "Первая книга серии", img: "https://via.placeholder.com/150/FF9800/FFFFFF?text=Book" },
    { id: 4, name: "Наушники Sony", category: "electronics", price: 12999, 
      description: "Беспроводные наушники", img: "https://via.placeholder.com/150/607D8B/FFFFFF?text=Sony" },
    { id: 5, name: "Джинсы Levis", category: "clothes", price: 5999, 
      description: "Классические джинсы", img: "https://via.placeholder.com/150/3F51B5/FFFFFF?text=Levis" },
    { id: 6, name: "Кофемашина", category: "home", price: 34999, 
      description: "Автоматическая кофемашина", img: "https://via.placeholder.com/150/9C27B0/FFFFFF?text=Coffee" }
];

let cart = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentPriceFilter = 'all';

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========
function showProducts() {
    console.log('showProducts вызвана');
    const container = document.getElementById('product-list');
    if (!container) {
        console.error('Элемент product-list не найден!');
        return;
    }
    
    // Фильтрация
    let filteredProducts = products.filter(p => {
        if (currentCategory !== 'all' && p.category !== currentCategory) return false;
        if (currentSearch && !p.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
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
    
    // Отображение
    container.innerHTML = '';
    filteredProducts.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${p.img}" alt="${p.name}" loading="lazy">
            <h4>${p.name}</h4>
            <p class="description">${p.description}</p>
            <div class="price">${p.price.toLocaleString()} ₽</div>
            <button onclick="addToCart(${p.id})">🛒 В корзину</button>
        `;
        container.appendChild(div);
    });
    console.log(`Товары отображены: ${filteredProducts.length} шт`);
}

function addToCart(productId) {
    console.log('addToCart:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        updateCart();
        
        // Анимация добавления
        const btn = event?.target;
        if (btn) {
            btn.textContent = '✓ Добавлено';
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.textContent = '🛒 В корзину';
                btn.style.background = '';
            }, 1000);
        }
    }
}

function updateCart() {
    console.log('updateCart, товаров:', cart.length);
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('total-price');
    const itemsEl = document.getElementById('cart-items');
    
    // Счетчик
    if (countEl) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countEl.textContent = totalItems;
    }
    
    // Сумма
    if (totalEl) {
        const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        totalEl.textContent = total.toLocaleString();
    }
    
    // Список товаров
    if (itemsEl) {
        itemsEl.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    ${item.price} ₽ × ${item.quantity || 1}
                </div>
                <div>
                    ${(item.price * (item.quantity || 1)).toLocaleString()} ₽
                    <button onclick="removeFromCart(${item.id})" style="margin-left:10px; color:red;">×</button>
                </div>
            `;
            itemsEl.appendChild(div);
        });
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

function removeFromCart(productId) {
    console.log('removeFromCart:', productId);
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function searchProducts() {
    console.log('searchProducts');
    currentSearch = document.getElementById('search').value;
    showProducts();
}

function sortProducts() {
    console.log('sortProducts');
    currentSort = document.getElementById('sort').value;
    showProducts();
}

function filterByPrice() {
    console.log('filterByPrice');
    currentPriceFilter = document.getElementById('price-filter').value;
    // Здесь можно добавить фильтрацию по цене
    showProducts();
}

function openCart() {
    console.log('openCart');
    document.getElementById('cart-panel').classList.add('open');
}

function closeCart() {
    console.log('closeCart');
    document.getElementById('cart-panel').classList.remove('open');
}

function checkout() {
    console.log('checkout');
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const itemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    alert(`✅ Заказ оформлен!\n\nТоваров: ${itemsCount} шт\nСумма: ${total.toLocaleString()} ₽\n\nСпасибо за покупку!`);
    
    // Отправляем в Telegram если есть
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify({
            action: 'checkout',
            total: total,
            items: itemsCount,
            cart: cart
        }));
    }
    
    // Очищаем корзину
    cart = [];
    updateCart();
    closeCart();
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    
    // Загружаем корзину из localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log('Корзина загружена из localStorage:', cart.length, 'товаров');
    }
    
    // Инициализация категорий
    document.querySelectorAll('.categories button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.categories button').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            currentCategory = this.dataset.category;
            console.log('Категория изменена на:', currentCategory);
            showProducts();
        });
    });
    
    // Поиск по Enter
    document.getElementById('search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProducts();
    });
    
    // Показываем товары
    showProducts();
    updateCart();
    
    console.log('Инициализация завершена');
});

console.log('app.js загружен полностью');
// ========== КОНЕЦ app.js ==========