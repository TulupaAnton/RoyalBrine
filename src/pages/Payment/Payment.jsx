import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCheckCircle,
  faCartShopping,
  faInfoCircle,
  faTruck,
  faWallet,
  faXmark
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

// ====== Константы ======
const FREE_DELIVERY_THRESHOLD = 800
const COURIER_DELIVERY_COST = 80

// ====== Хелперы ======
const nameRegex = /^[А-Яа-яЁёЇїІіЄєҐґA-Za-z\s'-]{2,}$/u
const phoneRegex = /^\+?\d{10,15}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Рандомний номер замовлення
const generateRandomOrder = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
  let res = ''
  for (let i = 0; i < 6; i++) {
    res += chars[Math.floor(Math.random() * chars.length)]
  }
  return `RB-${res}`
}

// ===== Supabase: запис замовлення =====
const sendToSupabase = async orderData => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    throw error
  }

  return data
}

const calculateItemTotal = item => {
  const numericPrice = parseFloat(
    item.price.replace(' грн', '').replace(',', '.')
  )
  return Number.isNaN(numericPrice)
    ? '0.00'
    : (numericPrice * item.quantity).toFixed(2)
}

const buildOrderDetailsText = cartItems =>
  cartItems
    .map(
      item => `${item.name} (${item.weight}) — ${item.price} × ${item.quantity}`
    )
    .join('\n')

export function Payment () {
  const { cartItems, clearCart } = useCartStore()
  const totalPrice = useCartStore(state => state.totalPrice())
  const cartCount = useCartStore(state => state.cartCount())

  const formRef = useRef()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isOtherCity, setIsOtherCity] = useState(false)
  const [deliveryType, setDeliveryType] = useState('courier')
  const [deliveryDayOption, setDeliveryDayOption] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [lastOrderNumber, setLastOrderNumber] = useState(null)

  // ===== Варіанти написання Запоріжжя =====
  const zaporizhzhiaVariants = [
    'запоріжжя',
    'запорожье',
    'зп',
    'zaporizhzhia',
    'zaporozhye',
    'zaporozhe',
    'zaporozhja',
    'запоріжя',
    'запоріжє',
    'запорожя',
    'запороже'
  ]

  // ===== Функція перевірки міста =====
  const handleCityChange = e => {
    const value = e.target.value.trim().toLowerCase()

    const isZaporizhzhia = zaporizhzhiaVariants.includes(value)

    if (isZaporizhzhia) {
      setIsOtherCity(false)
      setDeliveryType('courier')
    } else {
      setIsOtherCity(true)
      setDeliveryType('nova_poshta')
      setDeliveryDayOption('')
    }
  }

  let deliveryCost = 0
  let showFreeDeliveryHint = false

  if (!isOtherCity && deliveryType === 'courier') {
    if (totalPrice >= FREE_DELIVERY_THRESHOLD) {
      deliveryCost = 0
    } else {
      deliveryCost = COURIER_DELIVERY_COST
      showFreeDeliveryHint = true
    }
  }

  const totalWithDelivery =
    deliveryType === 'courier' ? totalPrice + deliveryCost : totalPrice

  // ====== Submit ======
  const handlePaymentSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = formRef.current

    const name = form['name'].value.trim()
    const phone = form['phone'].value.trim()
    const email = form['email'].value.trim()
    // нормалізація міста
    const cityRaw = form['city'].value.trim()
    const cityLower = cityRaw.toLowerCase()

    const normalizedCity = zaporizhzhiaVariants.includes(cityLower)
      ? 'Запоріжжя'
      : cityRaw

    const address = form['address'].value.trim()
    const wish = form['wish'].value.trim()
    const paymentMethod = form['payment'].value
    const npBranch =
      deliveryType === 'nova_poshta' ? form['npBranch']?.value.trim() : ''

    const currentDay = new Date().toLocaleDateString('uk-UA')

    // Валідація
    if (!nameRegex.test(name)) {
      setIsSubmitting(false)
      return toast.error('Ім’я має бути не коротше 2 символів')
    }
    if (!phoneRegex.test(phone)) {
      setIsSubmitting(false)
      return toast.error('Невірний номер телефону')
    }
    if (!emailRegex.test(email)) {
      setIsSubmitting(false)
      return toast.error('Email некоректний')
    }
    if (!address || address.length < 5) {
      setIsSubmitting(false)
      return toast.error('Адреса занадто коротка')
    }
    if (!isOtherCity && deliveryType === 'courier' && !deliveryDayOption) {
      setIsSubmitting(false)
      return toast.error('Виберіть день доставки: Субота')
    }
    if (deliveryType === 'nova_poshta' && !npBranch) {
      setIsSubmitting(false)
      return toast.error('Вкажіть відділення НП')
    }

    // ===== № замовлення =====
    const orderNumber = generateRandomOrder()
    setLastOrderNumber(orderNumber)

    const orderDetails = buildOrderDetailsText(cartItems)

    // ===== Текстові поля =====
    const deliveryTypeText =
      deliveryType === 'courier' ? 'Курʼєр по Запоріжжю' : 'Нова Пошта'

    const deliveryDayText =
      !isOtherCity && deliveryType === 'courier'
        ? deliveryDayOption
        : `Сьогодні (${currentDay})`

    // ===== Формуємо дані замовлення для бази =====
    const orderData = {
      order_number: orderNumber,
      // created_at у нас ставиться default now() в БД, можна не передавати
      name,
      phone,
      email,
      city: normalizedCity,
      address,
      delivery_type: deliveryTypeText,
      delivery_day: deliveryDayText,
      np_branch: npBranch || null,
      payment_method: paymentMethod,
      wish: wish || null,
      cart_items: cartItems
        .map(item => `${item.name} — ${item.weight} × ${item.quantity}`)
        .join('\n'),
      total_price: totalPrice,
      status: 'Новий'
    }

    try {
      // ===== Запис у Supabase =====
      await sendToSupabase(orderData)

      // ====== Telegram ======
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: `🛒 *Нове замовлення*\n
🔢 Номер: *${orderNumber}*

👤 ${name}
📞 ${phone}
📧 ${email}
🏙 ${normalizedCity}
🏠 ${address}

🚚 ${deliveryTypeText}
📅 ${deliveryDayText}
🏤 ${deliveryType === 'nova_poshta' ? npBranch : 'Не потрібно'}

📝 Коментар: ${wish || 'Без коментарів'}

🧾 Товари:
${orderDetails}

Разом: *${totalPrice} грн*
💳 Оплата: ${paymentMethod}`,
          parse_mode: 'Markdown'
        }
      )

      // Показ модалки
      setShowModal(true)
      clearCart()
      form.reset()
      setIsOtherCity(false)
      setDeliveryType('courier')
      setDeliveryDayOption('')
    } catch (err) {
      console.error(err)
      toast.error(
        'Сталася помилка при оформленні замовлення. Спробуйте ще раз.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== JSX =====
  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 via-amber-50 to-amber-100 py-8 md:py-12'>
      <Toaster position='top-center' />

      {/* ==== МОДАЛЬНЕ ВІКНО ПІДТВЕРДЖЕННЯ ==== */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 16, stiffness: 260 }}
            className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-amber-200'
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowModal(false)}
              className='absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition'
            >
              <FontAwesomeIcon icon={faXmark} size='lg' />
            </button>

            <div className='text-center pt-2'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-3'>
                <span className='text-3xl'>🧡</span>
              </div>

              <h2 className='text-2xl font-bold text-gray-900'>
                Дякуємо за замовлення!
              </h2>

              <p className='text-gray-700 mt-3 text-base'>
                Ваш номер замовлення:
              </p>

              <p className='text-2xl font-extrabold text-amber-600 mt-1 tracking-wide'>
                {lastOrderNumber}
              </p>

              <p className='text-gray-600 text-sm mt-4 leading-relaxed'>
                Наш менеджер звʼяжеться з вами найближчим часом для
                підтвердження.
              </p>

              <button
                onClick={() => setShowModal(false)}
                className='mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md hover:shadow-lg transition'
              >
                Закрити
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ==== MAIN CONTENT ==== */}
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          {/* BACK LINK */}
          <div className='mb-4 md:mb-6'>
            <Link
              to='/cart'
              className='inline-flex items-center text-amber-700 hover:text-amber-800 font-medium transition-colors text-sm md:text-base'
            >
              <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
              Повернутися до кошика
            </Link>
          </div>

          {/* HEADER + STEPS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-8 md:mb-10'
          >
            <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight'>
              Оформлення замовлення
            </h1>
            <p className='text-gray-600 text-sm md:text-base max-w-2xl'>
              Заповніть, будь ласка, контактні дані, оберіть спосіб доставки та
              оплати. Це займає менш ніж 1 хвилину.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-8 lg:gap-10'>
            {/* ========== LEFT COLUMN — FORM ========== */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden'
            >
              <div className='p-5 md:p-6 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200'>
                <h2 className='text-lg md:text-xl font-semibold text-gray-900 flex items-center'>
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
                className='p-5 md:p-6 space-y-7'
              >
                {/* БЛОК: Контактні дані */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold uppercase tracking-wide text-amber-700'>
                    1. Контактні дані
                  </h3>

                  {/* NAME */}
                  <div className='space-y-1'>
                    <label className='text-gray-700 font-medium text-sm block'>
                      Ім’я та прізвище *
                    </label>
                    <input
                      type='text'
                      name='name'
                      required
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg text-sm md:text-base bg-amber-50/40 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300 outline-none transition'
                      placeholder='Наприклад: Іван Петренко'
                    />
                  </div>

                  {/* PHONE */}
                  <div className='space-y-1'>
                    <label className='text-gray-700 font-medium text-sm block'>
                      Номер телефону *
                    </label>
                    <input
                      type='tel'
                      name='phone'
                      required
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg text-sm md:text-base bg-amber-50/40 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300 outline-none transition'
                      placeholder='+380XXXXXXXXX'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Вкажіть актуальний номер — ми зателефонуємо для
                      підтвердження.
                    </p>
                  </div>

                  {/* EMAIL */}
                  <div className='space-y-1'>
                    <label className='text-gray-700 font-medium text-sm block'>
                      Email *
                    </label>
                    <input
                      type='email'
                      name='email'
                      required
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg text-sm md:text-base bg-amber-50/40 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300 outline-none transition'
                      placeholder='you@email.com'
                    />
                  </div>
                </div>

                {/* БЛОК: Адреса */}
                <div className='space-y-4 pt-3 border-t border-amber-100'>
                  <h3 className='text-sm font-semibold uppercase tracking-wide text-amber-700'>
                    2. Адреса доставки
                  </h3>

                  {/* CITY */}
                  <div className='space-y-1'>
                    <label className='text-gray-700 font-medium text-sm block'>
                      Місто *
                    </label>
                    <input
                      type='text'
                      name='city'
                      onChange={handleCityChange}
                      required
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg text-sm md:text-base bg-amber-50/40 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300 outline-none transition'
                      placeholder='Запоріжжя'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Якщо ви не з Запоріжжя, буде доступна доставка лише Новою
                      Поштою.
                    </p>
                  </div>

                  {/* ADDRESS */}
                  <div className='space-y-1'>
                    <label className='text-gray-700 font-medium text-sm block'>
                      Адреса доставки *
                    </label>
                    <textarea
                      name='address'
                      rows='3'
                      required
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg text-sm md:text-base bg-amber-50/40 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300 outline-none transition resize-none'
                      placeholder='Вкажіть вулицю, будинок, під’їзд, квартиру тощо'
                    ></textarea>
                  </div>
                </div>

                {/* БЛОК: Спосіб доставки */}
                <div className='space-y-4 pt-3 border-t border-amber-100'>
                  <h3 className='text-sm font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-2'>
                    <FontAwesomeIcon
                      icon={faTruck}
                      className='text-amber-600'
                    />
                    3. Спосіб доставки
                  </h3>

                  <div className='space-y-3'>
                    {!isOtherCity && (
                      <label className='flex items-start space-x-3 p-3 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/60 transition'>
                        <input
                          type='radio'
                          name='deliveryType'
                          value='courier'
                          checked={deliveryType === 'courier'}
                          onChange={() => setDeliveryType('courier')}
                          className='h-5 w-5 mt-1 text-amber-600'
                        />
                        <div className='flex-1'>
                          <p className='font-semibold text-gray-900'>
                            Курʼєр по Запоріжжю
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            Доставка по місту. Безкоштовно від{' '}
                            {FREE_DELIVERY_THRESHOLD} грн, в іншому випадку —{' '}
                            {COURIER_DELIVERY_COST} грн.
                          </p>
                        </div>
                      </label>
                    )}

                    <label className='flex items-start space-x-3 p-3 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/60 transition'>
                      <input
                        type='radio'
                        name='deliveryType'
                        value='nova_poshta'
                        checked={deliveryType === 'nova_poshta'}
                        onChange={() => setDeliveryType('nova_poshta')}
                        className='h-5 w-5 mt-1 text-amber-600'
                      />
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900'>
                          Нова Пошта
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          Відправлення по всій Україні за тарифами Нової Пошти.
                        </p>
                      </div>
                    </label>

                    {isOtherCity && (
                      <p className='text-xs text-amber-700 mt-1'>
                        Для інших міст — доступна лише доставка Новою Поштою та
                        передоплата.
                      </p>
                    )}
                  </div>

                  {/* DELIVERY DAY */}
                  {!isOtherCity && deliveryType === 'courier' && (
                    <div className='mt-2 space-y-2'>
                      <label className='text-gray-700 font-medium text-sm block'>
                        День доставки *
                      </label>

                      <label className='flex items-start space-x-3 p-3 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/60 transition'>
                        <input
                          type='radio'
                          name='deliveryDayOption'
                          value='Субота'
                          checked={deliveryDayOption === 'Субота'}
                          onChange={() => setDeliveryDayOption('Субота')}
                          className='h-5 w-5 mt-1 text-amber-600'
                        />
                        <div>
                          <p className='font-semibold text-gray-900'>Субота</p>
                          <p className='text-xs text-gray-500 mt-1'>
                            Доставка у найближчу суботу після підтвердження
                            замовлення.
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* NP BRANCH */}
                  {deliveryType === 'nova_poshta' && (
                    <div className='space-y-1'>
                      <label className='text-gray-700 font-medium text-sm block'>
                        Відділення / Поштомат НП *
                      </label>
                      <input
                        type='text'
                        name='npBranch'
                        required
                        className='w-full px-4 py-3 border border-amber-200 rounded-lg text-sm md:text-base bg-amber-50/40 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300 outline-none transition'
                        placeholder='Наприклад: Відділення №5, вул. Прикладна, 10'
                      />
                    </div>
                  )}
                </div>

                {/* БЛОК: Коментар */}
                <div className='space-y-4 pt-3 border-t border-amber-100'>
                  <h3 className='text-sm font-semibold uppercase tracking-wide text-amber-700'>
                    4. Коментар до замовлення
                  </h3>

                  <div className='space-y-1'>
                    <label className='text-gray-700 font-medium text-sm block'>
                      Коментар
                    </label>
                    <textarea
                      name='wish'
                      rows='2'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg text-sm md:text-base bg-amber-50/40 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300 outline-none transition resize-none'
                      placeholder='Напишіть побажання до замовлення (необовʼязково)'
                    ></textarea>
                  </div>
                </div>

                {/* БЛОК: Оплата */}
                <div className='space-y-4 pt-3 border-t border-amber-100'>
                  <h3 className='text-sm font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-2'>
                    <FontAwesomeIcon
                      icon={faWallet}
                      className='text-amber-600'
                    />
                    5. Спосіб оплати
                  </h3>

                  <div className='space-y-3'>
                    {!isOtherCity && (
                      <label className='flex items-start space-x-3 p-3 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/60 transition'>
                        <input
                          type='radio'
                          name='payment'
                          value='Готівкою при отриманні'
                          defaultChecked
                          className='h-5 w-5 mt-1 text-amber-600'
                        />
                        <div>
                          <p className='font-semibold text-gray-900'>
                            Готівкою при отриманні
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            Оплата курʼєру при доставці по Запоріжжю.
                          </p>
                        </div>
                      </label>
                    )}

                    <label className='flex items-start space-x-3 p-3 border border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/60 transition'>
                      <input
                        type='radio'
                        name='payment'
                        value='Передоплата'
                        defaultChecked={isOtherCity}
                        className='h-5 w-5 mt-1 text-amber-600'
                      />
                      <div>
                        <p className='font-semibold text-gray-900'>
                          Передоплата
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          Реквізити для оплати ми надішлемо після підтвердження
                          замовлення.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* SUBMIT */}
                <div className='pt-2'>
                  <button
                    type='submit'
                    disabled={isSubmitting || cartItems.length === 0}
                    className={`w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 
                      hover:from-amber-600 hover:to-amber-700 text-white font-semibold 
                      rounded-xl flex items-center justify-center space-x-2 transition-all text-sm md:text-base
                      ${
                        isSubmitting || cartItems.length === 0
                          ? 'opacity-70 cursor-not-allowed'
                          : 'hover:shadow-lg hover:-translate-y-[1px]'
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
                        <span>Обробка…</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Підтвердити замовлення</span>
                      </>
                    )}
                  </button>

                  {cartItems.length === 0 && (
                    <p className='text-xs текст-center text-gray-500 mt-2'>
                      Додайте товари до кошика, щоб оформити замовлення.
                    </p>
                  )}
                </div>

                {/* INFO */}
                <div className='mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200'>
                  <div className='flex items-start gap-3'>
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className='text-amber-600 mt-1'
                    />
                    <p className='text-xs md:text-sm text-gray-700 leading-relaxed'>
                      Якщо виникли питання — телефонуйте:{' '}
                      <a
                        href='tel:+380500203693'
                        className='text-amber-700 hover:underline font-semibold'
                      >
                        +38 (050) 020 36 93
                      </a>
                      . Ми з радістю допоможемо.
                    </p>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* ========== RIGHT COLUMN — ORDER SUMMARY ========== */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='lg:sticky lg:top-24 h-fit'
            >
              <div className='bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden'>
                <div className='p-5 md:p-6 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm'>
                      <FontAwesomeIcon
                        icon={faCartShopping}
                        className='text-amber-600'
                      />
                    </div>
                    <div>
                      <h2 className='text-lg font-semibold text-gray-900'>
                        Ваше замовлення
                      </h2>
                      <p className='text-xs text-gray-600'>
                        Товарів у кошику: {cartCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='max-h-[400px] overflow-y-auto divide-y divide-amber-100'>
                  {cartItems.length === 0 ? (
                    <div className='p-8 text-center text-gray-500 text-sm'>
                      Кошик порожній
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                        className='p-4 hover:bg-amber-50/70 transition'
                      >
                        <div className='flex items-center gap-4'>
                          <div className='w-16 h-16 rounded-xl overflow-hidden border border-amber-100 flex-shrink-0 bg-amber-50'>
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
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-gray-900 truncate'>
                              {item.name}
                            </p>
                            <p className='text-xs text-gray-500 mt-0.5'>
                              {item.weight} · Кількість: {item.quantity}
                            </p>
                            <p className='text-xs text-gray-500 mt-0.5'>
                              Ціна за одиницю: {item.price}
                            </p>
                          </div>
                          <p className='font-semibold text-amber-600 text-sm text-right'>
                            {calculateItemTotal(item)} грн
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* TOTAL BLOCK */}
                <div className='p-5 md:p-6 bg-amber-50 border-t border-amber-200 space-y-4'>
                  {showFreeDeliveryHint && (
                    <div className='p-3 bg-amber-100 rounded-xl text-amber-900 text-xs flex items-start gap-2'>
                      <span className='mt-0.5'>✨</span>
                      <p>
                        До безкоштовної доставки залишилось{' '}
                        <span className='font-semibold'>
                          {(FREE_DELIVERY_THRESHOLD - totalPrice).toFixed(2)}{' '}
                          грн
                        </span>
                        .
                      </p>
                    </div>
                  )}

                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Товари:</span>
                      <span className='font-semibold'>
                        {totalPrice.toFixed(2)} грн
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Доставка:</span>
                      <span className='font-semibold'>
                        {deliveryType === 'nova_poshta'
                          ? 'За тарифами НП'
                          : deliveryCost === 0
                          ? 'Безкоштовно'
                          : `${COURIER_DELIVERY_COST} грн`}
                      </span>
                    </div>
                  </div>

                  <div className='pt-3 border-t border-amber-200'>
                    <div className='flex justify-between items-center'>
                      <div className='flex flex-col'>
                        <span className='text-xs uppercase tracking-wide text-gray-500'>
                          Разом до оплати
                        </span>
                        <span className='text-xs text-gray-500 mt-0.5'>
                          (з урахуванням доставки)
                        </span>
                      </div>
                      <span className='text-2xl font-extrabold text-amber-700'>
                        {deliveryType === 'courier'
                          ? totalWithDelivery.toFixed(2)
                          : totalPrice.toFixed(2)}{' '}
                        грн
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTNOTE */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className='mt-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 text-[11px] md:text-xs text-gray-600 leading-relaxed'
              >
                Натискаючи &quot;Підтвердити замовлення&quot;, ви погоджуєтесь з{' '}
                <Link
                  to='/Terms'
                  className='text-amber-700 hover:underline font-medium'
                >
                  умовами використання
                </Link>
                ,{' '}
                <Link
                  to='/Privacy'
                  className='text-amber-700 hover:underline font-medium'
                >
                  політикою конфіденційності
                </Link>{' '}
                та{' '}
                <Link
                  to='/Refund'
                  className='text-amber-700 hover:underline font-medium'
                >
                  правилами повернення коштів
                </Link>
                .
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
