// 1. Данные товаров
const products = [
  { id: 1, name: "Книга: React для начинающих", category: "books", price: 500, description: "Простое введение в React", img: "https://via.placeholder.com/150" },
  { id: 2, name: "Игрушка: Мягкий медвежонок", category: "toys", price: 300, description: "Милый и пушистый", img: "https://via.placeholder.com/150" },
  { id: 3, name: "Сувенир: Брелок хомячок", category: "souvenirs", price: 150, description: "Чтобы помнить о пушистом друге 🐹", img: "https://via.placeholder.com/150" }
];

// 2. Элементы страницы
const productList = document.getElementById("product-list");
const cartList = document.getElementById("cart");
let cart = [];

// 3. Функция для отображения товаров
function showProducts(category = "all") {
  productList.innerHTML = "";
  const filtered = category === "all" ? products : products.filter(p => p.category === category);

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.price} ₽</p>
      <button class="details">Подробнее</button>
      <button class="add-to-cart">Добавить в корзину</button>
    `;
    productList.appendChild(card);

    // Подробнее
    card.querySelector(".details").addEventListener("click", () => {
      alert(`${p.description}\nЦена: ${p.price} ₽`);
    });

    // Добавить в корзину
    card.querySelector(".add-to-cart").addEventListener("click", () => {
      cart.push(p);
      updateCart();
    });
  });
}

// 4. Функция для обновления корзины
function updateCart() {
  cartList.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.price} ₽`;
    cartList.appendChild(li);
  });
}

// 5. Обработчик категорий
document.getElementById("categories").addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    showProducts(e.target.dataset.category);
  }
});

// 6. Инициализация
showProducts();
