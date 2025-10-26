// src/store/cartStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Генерируем уникальный ключ для товара с учетом цены и веса
const generateItemKey = item => {
  return `${item.id}-${item.price}-${item.weight || ''}`
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // Добавление товара в корзину
      addToCart: (product, category) => {
        const itemKey = generateItemKey(product)
        const existingItem = get().cartItems.find(
          item =>
            generateItemKey(item) === itemKey && item.category === category
        )

        if (existingItem) {
          // Если товар с такой же ценой и весом уже есть, увеличиваем количество
          set({
            cartItems: get().cartItems.map(item =>
              generateItemKey(item) === itemKey && item.category === category
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          // Если товара с такой ценой и весом нет, добавляем как новый
          set({
            cartItems: [
              ...get().cartItems,
              { ...product, category, quantity: 1 }
            ]
          })
        }
      },

      // Удаление товара из корзины
      removeFromCart: (productId, category, price, weight) => {
        // Если переданы price и weight, удаляем конкретный вариант
        if (price && weight) {
          const itemKey = generateItemKey({ id: productId, price, weight })
          set({
            cartItems: get().cartItems.filter(
              item =>
                !(
                  generateItemKey(item) === itemKey &&
                  item.category === category
                )
            )
          })
        } else {
          // Если не переданы, удаляем все варианты этого товара (старая логика)
          set({
            cartItems: get().cartItems.filter(
              item => !(item.id === productId && item.category === category)
            )
          })
        }
      },

      // Обновление количества товара
      updateQuantity: (productId, category, newQuantity, price, weight) => {
        if (newQuantity < 1) {
          get().removeFromCart(productId, category, price, weight)
          return
        }

        // Если переданы price и weight, обновляем конкретный вариант
        if (price && weight) {
          const itemKey = generateItemKey({ id: productId, price, weight })
          set({
            cartItems: get().cartItems.map(item =>
              generateItemKey(item) === itemKey && item.category === category
                ? { ...item, quantity: newQuantity }
                : item
            )
          })
        } else {
          // Если не переданы, используем старую логику (для обратной совместимости)
          set({
            cartItems: get().cartItems.map(item =>
              item.id === productId && item.category === category
                ? { ...item, quantity: newQuantity }
                : item
            )
          })
        }
      },

      // Очистка корзины
      clearCart: () => set({ cartItems: [] }),

      // Вычисляемые значения
      totalPrice: () => {
        return get().cartItems.reduce((sum, item) => {
          const price = parseFloat(
            item.price.replace(' грн', '').replace(',', '.')
          )
          return sum + price * item.quantity
        }, 0)
      },

      cartCount: () => {
        return get().cartItems.reduce((sum, item) => sum + item.quantity, 0)
      },

      // Новая функция для получения сгруппированных товаров
      getGroupedItems: () => {
        const items = get().cartItems
        const grouped = {}

        items.forEach(item => {
          const key = generateItemKey(item)
          if (!grouped[key]) {
            grouped[key] = { ...item }
          } else {
            grouped[key].quantity += item.quantity
          }
        })

        return Object.values(grouped)
      }
    }),
    {
      name: 'cart-storage' // имя для localStorage
    }
  )
)
