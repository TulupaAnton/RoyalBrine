import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCheckCircle,
  faCartShopping,
  faInfoCircle,
  faTruck,
  faWallet
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

// ====== Хелперы ======

const nameRegex = /^[А-Яа-яЁёЇїІіЄєҐґA-Za-z\s'-]{2,}$/u
const phoneRegex = /^\+?\d{10,15}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const calculateItemTotal = item => {
  const numericPrice = parseFloat(
    item.price.replace(' грн', '').replace(',', '.')
  )
  if (Number.isNaN(numericPrice)) return '0.00'
  return (numericPrice * item.quantity).toFixed(2)
}

const buildOrderDetailsText = cartItems =>
  cartItems
    .map(
      item => `${item.name} (${item.weight}) — ${item.price} x ${item.quantity}`
    )
    .join('\n')

export function Payment () {
  const { cartItems, clearCart } = useCartStore()
  const totalPrice = useCartStore(state => state.totalPrice())
  const cartCount = useCartStore(state => state.cartCount())

  const formRef = useRef()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Чи місто не Запоріжжя
  const [isOtherCity, setIsOtherCity] = useState(false)

  // Спосіб доставки: 'courier' | 'nova_poshta'
  const [deliveryType, setDeliveryType] = useState('courier')

  // Выбор дня доставки по Запорожью
  const [deliveryDayOption, setDeliveryDayOption] = useState('')

  // ====== Обробка зміни міста ======

  const handleCityChange = e => {
    const value = e.target.value.trim().toLowerCase()

    if (value && value !== 'запоріжжя' && value !== 'запорожье') {
      // Інші міста — тільки Нова Пошта
      setIsOtherCity(true)
      setDeliveryType('nova_poshta')
      setDeliveryDayOption('')
    } else {
      // Запоріжжя — за замовчуванням курʼєр
      setIsOtherCity(false)
      setDeliveryType('courier')
    }
  }

  // ====== Розрахунок доставки ======

  let deliveryCost = 0
  let deliveryLabel = ''
  let showFreeDeliveryHint = false

  if (!isOtherCity && deliveryType === 'courier') {
    if (totalPrice >= 500) {
      deliveryCost = 0
      deliveryLabel = 'Безкоштовно'
    } else {
      deliveryCost = 80
      deliveryLabel = '80 грн'
      showFreeDeliveryHint = true
    }
  } else if (deliveryType === 'nova_poshta') {
    deliveryCost = 0
    deliveryLabel = 'За тарифами Нової Пошти'
  }

  const totalWithDelivery =
    deliveryType === 'courier' ? totalPrice + deliveryCost : totalPrice

  // ====== Сабміт форми ======

  const handlePaymentSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = formRef.current
    const name = form['name'].value.trim()
    const phone = form['phone'].value.trim()
    const email = form['email'].value.trim()
    const city = form['city'].value.trim()
    const address = form['address'].value.trim()
    const wish = form['wish'].value.trim()
    const paymentMethod = form['payment'].value
    const npBranch =
      deliveryType === 'nova_poshta' ? form['npBranch']?.value.trim() : ''

    // День доставки = сегодня только для других городов
    const currentDay = new Date().toLocaleDateString('uk-UA')

    // ====== Валидация ======
    if (!nameRegex.test(name)) {
      setIsSubmitting(false)
      return toast.error('Ім’я має бути не коротше 2 символів')
    }

    if (!phoneRegex.test(phone)) {
      setIsSubmitting(false)
      return toast.error('Введіть коректний номер телефону')
    }

    if (!emailRegex.test(email)) {
      setIsSubmitting(false)
      return toast.error('Введіть дійсний Email')
    }

    if (!address || address.length < 5) {
      setIsSubmitting(false)
      return toast.error('Адреса повинна містити більше 5 символів')
    }

    // Требуем выбрать день доставки по Запорожью
    if (!isOtherCity && deliveryType === 'courier' && !deliveryDayOption) {
      setIsSubmitting(false)
      return toast.error('Виберіть день доставки: Середа або Субота')
    }

    if (deliveryType === 'nova_poshta' && !npBranch) {
      setIsSubmitting(false)
      return toast.error('Вкажіть відділення Нової Пошти')
    }

    const orderDetails = buildOrderDetailsText(cartItems)

    const deliveryTypeText =
      deliveryType === 'courier' ? 'Курʼєр по Запоріжжю' : 'Нова Пошта'

    const deliveryCostText =
      deliveryType === 'courier'
        ? deliveryCost === 0
          ? 'Безкоштовно (по Запоріжжю)'
          : '80 грн (по Запоріжжю)'
        : 'За тарифами Нової Пошти'

    const deliveryDayText =
      !isOtherCity && deliveryType === 'courier'
        ? deliveryDayOption
        : `Сьогодні (${currentDay})`

    const totalText =
      deliveryType === 'courier'
        ? `${totalWithDelivery.toFixed(2)} грн`
        : `${totalPrice.toFixed(2)} грн (без вартості доставки Новою Поштою)`

    // ====== Telegram ======

    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: `🛒 *Нове замовлення!*\n
👤 Ім'я: ${name}
📞 Телефон: ${phone}
📧 Email: ${email}
🏙 Місто: ${city}
🏠 Адреса: ${address}

📝 Коментар: ${wish || 'Без коментарів'}

🚚 Спосіб доставки: ${deliveryTypeText}
📅 День доставки: ${deliveryDayText}
🏤 Відділення НП: ${deliveryType === 'nova_poshta' ? npBranch : 'Не потрібно'}

🧾 Замовлення:
${orderDetails}

💰 Сума товарів: ${totalPrice.toFixed(2)} грн
🚚 Доставка: ${deliveryCostText}
💳 Разом: ${totalText}`,
          parse_mode: 'Markdown'
        }
      )

      toast.success(
        <div>
          <p className='font-bold'>Замовлення успішно оформлено! 🎉</p>
          <p className='text-sm mt-1'>Очікуйте дзвінка для підтвердження</p>
        </div>
      )

      clearCart()
      form.reset()
      setIsOtherCity(false)
      setDeliveryType('courier')
      setDeliveryDayOption('')
    } catch (error) {
      toast.error('Сталася помилка, спробуйте знову 😢')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ====== JSX ======

  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 py-8 md:py-12'>
      <Toaster position='top-center' />

      <div className='container mx-auto px-4'>
        <div className='max-w-5xl mx-auto'>
          {/* Back link */}
          <Link
            to='/cart'
            className='inline-flex items-center text-amber-700 hover:text-amber-800 font-medium transition-colors mb-6'
          >
            <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
            Повернутися до кошика
          </Link>

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-8'
          >
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-3'>
              Оформлення замовлення
            </h1>
            <div className='w-24 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full'></div>
          </motion.div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* LEFT COLUMN – ORDER SUMMARY */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100'
            >
              <div className='p-6 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200'>
                <h2 className='text-xl font-semibold text-gray-800 flex items-center'>
                  <FontAwesomeIcon
                    icon={faCartShopping}
                    className='mr-3 text-amber-600'
                  />
                  Ваше замовлення ({cartCount})
                </h2>
              </div>

              <div className='divide-y divide-amber-100 max-h-[400px] overflow-y-auto'>
                {cartItems.length === 0 ? (
                  <div className='p-8 text-center'>
                    <p className='text-gray-500'>Ваш кошик порожній</p>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <motion.div
                      key={`${item.category}-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className='p-4 hover:bg-amber-50 transition-colors'
                    >
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 mr-4 w-16 h-16 rounded-lg overflow-hidden border border-amber-100'>
                          <img
                            src={
                              item.images?.[0]
                                ? new URL(
                                    `../../assets/products/${item.images[0]}`,
                                    import.meta.url
                                  ).href
                                : zaglushka
                            }
                            alt={item.name}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='flex-grow'>
                          <h3 className='font-medium text-gray-800'>
                            {item.name}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {item.price} × {item.weight}
                          </p>
                        </div>
                        <div className='font-medium text-amber-600'>
                          {calculateItemTotal(item)} грн
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className='p-6 bg-amber-50 border-t border-amber-200'>
                {/* FREE DELIVERY HINT */}
                {showFreeDeliveryHint && (
                  <div className='mb-4 p-3 bg-amber-100 rounded-lg flex items-start'>
                    <FontAwesomeIcon
                      icon={faTruck}
                      className='text-amber-700 mt-1 mr-3 flex-shrink-0'
                    />
                    <div>
                      <p className='font-medium text-amber-800'>
                        До безкоштовної доставки залишилось{' '}
                        {(500 - totalPrice).toFixed(2)} грн
                      </p>
                      <p className='text-sm text-amber-700 mt-1'>
                        При замовленні від 500 грн — безкоштовно
                      </p>
                    </div>
                  </div>
                )}

                <div className='space-y-3 mb-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Проміжний підсумок:</span>
                    <span className='font-medium'>
                      {totalPrice.toFixed(2)} грн
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Доставка:</span>
                    <span className='font-medium'>
                      {deliveryType === 'nova_poshta' ? (
                        'За тарифами Нової Пошти'
                      ) : deliveryCost === 0 ? (
                        <span className='text-green-600'>Безкоштовно</span>
                      ) : (
                        '80 грн'
                      )}
                    </span>
                  </div>
                </div>

                <div className='flex flex-col items-end pt-4 border-t border-amber-200'>
                  <div>
                    <span className='text-lg font-semibold mr-2'>Разом:</span>
                    <span className='text-xl font-bold text-amber-700'>
                      {deliveryType === 'courier'
                        ? totalWithDelivery.toFixed(2)
                        : totalPrice.toFixed(2)}{' '}
                      грн
                    </span>
                  </div>

                  {deliveryType === 'nova_poshta' && (
                    <p className='text-xs text-gray-500 mt-1 text-right'>
                      Вартість доставки сплачується окремо.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN – FORM */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100'
            >
              <div className='p-6 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200'>
                <h2 className='text-xl font-semibold text-gray-800 flex items-center'>
                  <FontAwesomeIcon
                    icon={faWallet}
                    className='mr-3 text-amber-600'
                  />
                  Дані для оплати та доставки
                </h2>
              </div>

              <form
                ref={formRef}
                onSubmit={handlePaymentSubmit}
                className='p-6'
              >
                <div className='space-y-6'>
                  {/* NAME */}
                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Ім’я та прізвище *
                    </label>
                    <input
                      type='text'
                      name='name'
                      required
                      placeholder="Введіть ваше ім'я"
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg 
                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                      outline-none transition'
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Номер телефону *
                    </label>
                    <input
                      type='tel'
                      name='phone'
                      required
                      placeholder='+380XXXXXXXXX'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg 
                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                      outline-none transition'
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Email *
                    </label>
                    <input
                      type='email'
                      name='email'
                      required
                      placeholder='your@email.com'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg 
                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                      outline-none transition'
                    />
                  </div>

                  {/* CITY */}
                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Місто *
                    </label>
                    <input
                      type='text'
                      name='city'
                      required
                      onChange={handleCityChange}
                      placeholder='Наприклад: Запоріжжя'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg 
                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                      outline-none transition'
                    />
                  </div>

                  {/* ADDRESS */}
                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Адреса доставки *
                    </label>
                    <textarea
                      name='address'
                      rows='3'
                      required
                      placeholder='Введіть повну адресу доставки'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg 
                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                      outline-none transition'
                    ></textarea>
                  </div>

                  {/* DELIVERY TYPE */}
                  <div className='border-t border-amber-200 pt-6'>
                    <h3 className='text-lg font-medium text-gray-800 mb-4 flex items-center'>
                      <FontAwesomeIcon
                        icon={faTruck}
                        className='mr-2 text-amber-600'
                      />
                      Спосіб доставки
                    </h3>

                    <div className='space-y-3'>
                      {!isOtherCity && (
                        <label
                          className={`flex items-start space-x-3 p-3 border border-amber-200 rounded-lg cursor-pointer transition-colors ${
                            deliveryType === 'courier'
                              ? 'bg-amber-50 border-amber-400'
                              : 'hover:bg-amber-50'
                          }`}
                        >
                          <input
                            type='radio'
                            name='deliveryType'
                            value='courier'
                            checked={deliveryType === 'courier'}
                            onChange={() => setDeliveryType('courier')}
                            className='h-5 w-5 mt-1 text-amber-600 focus:ring-amber-500'
                          />
                          <div>
                            <span className='font-medium'>
                              Курʼєр по Запоріжжю
                            </span>
                            <p className='text-sm text-gray-500 mt-1'>
                              Доставка курʼєром по місту. При замовленні від 500
                              грн — безкоштовно, інакше 80 грн.
                            </p>
                          </div>
                        </label>
                      )}

                      <label
                        className={`flex items-start space-x-3 p-3 border border-amber-200 rounded-lg cursor-pointer transition-colors ${
                          deliveryType === 'nova_poshta'
                            ? 'bg-amber-50 border-amber-400'
                            : 'hover:bg-amber-50'
                        }`}
                      >
                        <input
                          type='radio'
                          name='deliveryType'
                          value='nova_poshta'
                          checked={deliveryType === 'nova_poshta'}
                          onChange={() => setDeliveryType('nova_poshta')}
                          className='h-5 w-5 mt-1 text-amber-600 focus:ring-amber-500'
                        />
                        <div>
                          <span className='font-medium'>Нова Пошта</span>
                          <p className='text-sm text-gray-500 mt-1'>
                            Відправка по Україні. Вартість доставки — за
                            тарифами перевізника.
                          </p>
                        </div>
                      </label>
                    </div>

                    {isOtherCity && (
                      <p className='mt-3 text-sm text-amber-700'>
                        Ви обрали місто поза Запоріжжям — доступна тільки Нова
                        Пошта та передоплата.
                      </p>
                    )}
                  </div>

                  {/* DELIVERY DAY — ONLY FOR COURIER ZAPORIZHZHIA */}
                  {!isOtherCity && deliveryType === 'courier' && (
                    <div className='mt-6'>
                      <label className='block text-gray-700 mb-2 font-medium'>
                        Оберіть день доставки *
                      </label>

                      <div className='space-y-3'>
                        {/* WEDNESDAY */}
                        <label
                          className={`flex items-start space-x-3 p-3 border border-amber-200 rounded-lg cursor-pointer transition-colors ${
                            deliveryDayOption === 'Середа'
                              ? 'bg-amber-50 border-amber-400'
                              : 'hover:bg-amber-50'
                          }`}
                        >
                          <input
                            type='radio'
                            name='deliveryDayOption'
                            value='Середа'
                            checked={deliveryDayOption === 'Середа'}
                            onChange={() => setDeliveryDayOption('Середа')}
                            className='h-5 w-5 mt-1 text-amber-600'
                          />
                          <div>
                            <span className='font-medium'>Середа</span>
                            <p className='text-sm text-gray-500 mt-1'>
                              Доставка у середу (в той же день після
                              підтвердження).
                            </p>
                          </div>
                        </label>

                        {/* SATURDAY */}
                        <label
                          className={`flex items-start space-x-3 p-3 border border-amber-200 rounded-lg cursor-pointer transition-colors ${
                            deliveryDayOption === 'Субота'
                              ? 'bg-amber-50 border-amber-400'
                              : 'hover:bg-amber-50'
                          }`}
                        >
                          <input
                            type='radio'
                            name='deliveryDayOption'
                            value='Субота'
                            checked={deliveryDayOption === 'Субота'}
                            onChange={() => setDeliveryDayOption('Субота')}
                            className='h-5 w-5 mt-1 text-amber-600'
                          />
                          <div>
                            <span className='font-medium'>Субота</span>
                            <p className='text-sm text-gray-500 mt-1'>
                              Доставка у суботу (в той же день після
                              підтвердження).
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* NP BRANCH */}
                  {deliveryType === 'nova_poshta' && (
                    <div>
                      <label className='block text-gray-700 mb-2 font-medium'>
                        Відділення / поштомат НП *
                      </label>
                      <input
                        type='text'
                        name='npBranch'
                        required
                        placeholder='Наприклад: Відділення №5'
                        className='w-full px-4 py-3 border border-amber-200 rounded-lg 
                        focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                        outline-none transition'
                      />
                    </div>
                  )}

                  {/* COMMENT */}
                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Коментар до замовлення
                    </label>
                    <textarea
                      name='wish'
                      rows='3'
                      placeholder='Ваш коментар'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg 
                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                      outline-none transition'
                    ></textarea>
                  </div>

                  {/* PAYMENT METHOD */}
                  <div className='border-t border-amber-200 pt-6'>
                    <h3 className='text-lg font-medium text-gray-800 mb-4 flex items-center'>
                      <FontAwesomeIcon
                        icon={faWallet}
                        className='mr-2 text-amber-600'
                      />
                      Спосіб оплати
                    </h3>

                    <div className='space-y-3'>
                      {/* CASH ONLY FOR ZAPORIZHZHIA */}
                      {!isOtherCity && (
                        <label className='flex items-start space-x-3 p-3 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors'>
                          <input
                            type='radio'
                            name='payment'
                            value='Готівкою при отриманні'
                            defaultChecked
                            className='h-5 w-5 mt-1 text-amber-600'
                          />
                          <div>
                            <span className='font-medium'>
                              Готівкою при отриманні
                            </span>
                            <p className='text-sm text-gray-500 mt-1'>
                              Оплата готівкою при отриманні замовлення курʼєром.
                            </p>
                          </div>
                        </label>
                      )}

                      {/* PREPAID */}
                      <label className='flex items-start space-x-3 p-3 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors'>
                        <input
                          type='radio'
                          name='payment'
                          value='Передоплата'
                          defaultChecked={isOtherCity}
                          className='h-5 w-5 mt-1 text-amber-600'
                        />
                        <div>
                          <span className='font-medium'>Передоплата</span>
                          <p className='text-sm text-gray-500 mt-1'>
                            Для замовлень в інші міста — тільки передоплата.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <div className='pt-4'>
                    <button
                      type='submit'
                      disabled={isSubmitting || cartItems.length === 0}
                      className={`w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 
                      hover:from-amber-600 hover:to-amber-700 text-white font-medium 
                      rounded-lg flex items-center justify-center space-x-2 transition-all ${
                        isSubmitting || cartItems.length === 0
                          ? 'opacity-70 cursor-not-allowed'
                          : 'hover:shadow-lg'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                          </svg>
                          <span>Обробка...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheckCircle} />
                          <span>Підтвердити замовлення</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* INFO BLOCK */}
                <div className='mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200'>
                  <div className='flex items-start'>
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className='text-amber-600 mt-1 mr-3'
                    />
                    <p className='text-sm text-gray-700'>
                      Якщо виникли запитання — телефонуйте:{' '}
                      <a
                        href='tel:+380993523868'
                        className='text-amber-700 hover:underline font-medium'
                      >
                        +38 (099) 352 38 68
                      </a>
                    </p>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          {/* FOOTER */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className='mt-8 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5'
          >
            <p className='text-gray-700 text-center text-sm'>
              Натискаючи "Підтвердити замовлення", ви погоджуєтесь з{' '}
              <Link
                to='/Terms'
                className='text-amber-700 hover:underline font-medium'
              >
                умовами використання
              </Link>{' '}
              та{' '}
              <Link
                to='/Privacy'
                className='text-amber-700 hover:underline font-medium'
              >
                політикою конфіденційності
              </Link>{' '}
              а також{' '}
              <Link
                to='/Refund'
                className='text-amber-700 hover:underline font-medium'
              >
                правилами повернення коштів
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
