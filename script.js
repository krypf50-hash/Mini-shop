// =================== ДАННЫЕ ===================
let products = [
    { 
        id: 1, 
        name: "Смартфон", 
        category: "electronics", 
        price: 19999, 
        description: "Новый смартфон с хорошей камерой", 
        img: "https://via.placeholder.com/200x150/4CAF50/FFFFFF?text=Phone",
        stock: 10
    },
    { 
        id: 2, 
        name: "Футболка", 
        category: "clothes", 
        price: 899, 
        description: "Хлопковая футболка", 
        img: "https://via.placeholder.com/200x150/2196F3/FFFFFF?text=T-Shirt",
        stock: 25
    },
    { 
        id: 3, 
        name: "Книга по программированию", 
        category: "books", 
        price: 1499, 
        description: "Учебник для начинающих", 
        img: "https://via.placeholder.com/200x150/FF9800/FFFFFF?text=Book",
        stock: 8
    },
    { 
        id: 4, 
        name: "Настольная лампа", 
        category: "home", 
        price: 1299, 
        description: "Светодиодная лампа", 
        img: "https://via.placeholder.com/200x150/9C27B0/FFFFFF?text=Lamp",
        stock: 15
    },
    { 
        id: 5, 
        name: "Наушники", 
        category: "electronics", 
        price: 4999, 
        description: "Беспроводные наушники", 
        img: "https://via.placeholder.com/200x150/607D8B/FFFFFF?text=Headphones",
        stock: 12
    },
    { 
        id: 6, 
        name: "Джинсы", 
        category: "clothes", 
        price: 2999, 
        description: "Синие джинсы", 
        img: "https://via.placeholder.com/200x150/3F51B5/FFFFFF?text=Jeans",
        stock: 7
    }
];

let cart = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentPriceFilter = 'all';

// =================== ФУНКЦИИ ===================

// 1. Показать товары
function showProducts() {
    const container = document.getElementById('product-list');
    container.innerHTML = '';
    
    // Фильтрация
    let filteredProducts = products.filter(p => {
        // По категории
        if (currentCategory !== 'all' && p.category !== currentCategory) return false;
        
        // По поиску
        if (currentSearch && !p.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
        
        // По цене
        if (currentPriceFilter !== 'all') {
            const [min, max] = currentPriceFilter.split('-');
            if (max === '+') {
                if (p.price < parseInt(min)) return false;
            } else {
                if (p.price < parseInt(min) || p.price > parseInt(max)) return false;
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
    
    // Показ
    filteredProducts.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <div class="price">${product.price.toLocaleString()} ₽</div>
            <button onclick="addToCart(${product.id})">В корзину</button>
        `;
        container.appendChild(div);
    });
}

// 2. Поиск
function searchProducts() {
    currentSearch = document.getElementById('search').value;
    showProducts();
}

// 3. Сортировка
function sortProducts() {
    currentSort = document.getElementById('sort').value;
    showProducts();
}

// 4. Фильтр по цене
function filterByPrice() {
    currentPriceFilter = document.getElementById('price-filter').value;
    showProducts();
}

// 5. Категории
document.addEventListener('DOMContentLoaded', () => {
    // Обработчики категорий
    document.querySelectorAll('.categories button').forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех
            document.querySelectorAll('.categories button').forEach(b => {
                b.classList.remove('active');
            });
            // Добавляем текущему
            this.classList.add('active');
            // Меняем категорию
            currentCategory = this.dataset.category;
            showProducts();
        });
    });
    
    // Загружаем товары
    showProducts();
    updateCart();
});

// =================== КОРЗИНА ===================

// 6. Добавить в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    alert(`Добавлено: ${product.name}`);
}

// 7. Обновить корзину
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPrice = document.getElementById('total-price');
    
    // Очищаем
    cartItems.innerHTML = '';
    
    // Считаем общее
    let total = 0;
    let count = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                ${item.price} ₽ × ${item.quantity}
            </div>
            <div>
                ${(item.price * item.quantity).toLocaleString()} ₽
                <button onclick="removeFromCart(${item.id})" style="margin-left:10px;">×</button>
            </div>
        `;
        cartItems.appendChild(div);
    });
    
    // Обновляем счетчик и сумму
    cartCount.textContent = count;
    totalPrice.textContent = total.toLocaleString();
    
    // Сохраняем в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// 8. Удалить из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// 9. Открыть/закрыть корзину
function openCart() {
    document.getElementById('cart-panel').classList.add('open');
}

function closeCart() {
    document.getElementById('cart-panel').classList.remove('open');
}

// 10. Оформить заказ
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderDetails = cart.map(item => 
        `${item.name} × ${item.quantity} = ${item.price * item.quantity} ₽`
    ).join('\n');
    
    const message = `📦 Ваш заказ:\n\n${orderDetails}\n\n💵 Итого: ${total.toLocaleString()} ₽\n\n✅ Заказ принят!`;
    
    // В реальности здесь отправка на сервер
    alert(message);
    
    // Очищаем корзину
    cart = [];
    updateCart();
    closeCart();
}

// 11. Загрузить корзину из localStorage
function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
    }
}

// Загружаем при старте
loadCart();
