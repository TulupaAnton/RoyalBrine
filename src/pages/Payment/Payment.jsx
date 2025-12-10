import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCheckCircle,
  faCartShopping,
  faInfoCircle,
  faTruck,
  faWallet,
  faXmark,
  faGift,
  faTree,
  faStar,
  faSnowflake,
  faUser,
  faHome,
  faCalendar,
  faMapMarkerAlt,
  faCreditCard,
  faCommentDots,
  faChevronRight,
  faChevronLeft,
  faPhone
} from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

// ====== Константы ======
const FREE_DELIVERY_THRESHOLD = 800

// ===== Райони Запоріжжя =====
const zapDistricts = [
  { id: 'shev', name: 'Шевченківський', price: 60 },
  { id: 'olex', name: 'Олександрівський', price: 70 },
  { id: 'voz', name: 'Вознесенівський', price: 70 },
  { id: 'hort', name: 'Хортицький', price: 80 },
  { id: 'dnipro', name: 'Дніпровський', price: 75 },
  { id: 'zavod', name: 'Заводський', price: 85 },
  { id: 'komun', name: 'Комунарський', price: 65 }
]

// ====== Хелперы ======
const nameRegex = /^[А-Яа-яЁёЇїІіЄєҐґA-Za-z\s'-]{2,}$/u
const phoneRegex = /^\+?\d{10,15}$/

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

// ===== Шаги формы =====
const FORM_STEPS = [
  {
    id: 'contact',
    title: 'Контакти',
    icon: faUser,
    color: 'from-red-500 to-yellow-500'
  },
  {
    id: 'address',
    title: 'Адреса',
    icon: faHome,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'delivery',
    title: 'Доставка',
    icon: faTruck,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'payment',
    title: 'Оплата',
    icon: faCreditCard,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'comment',
    title: 'Коментар',
    icon: faCommentDots,
    color: 'from-purple-500 to-pink-500'
  }
]

export function Payment () {
  const { cartItems, clearCart } = useCartStore()
  const totalPrice = useCartStore(state => state.totalPrice())
  const cartCount = useCartStore(state => state.cartCount())

  const formRef = useRef()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    deliveryType: 'courier',
    district: '',
    deliveryDayOption: '',
    npBranch: '',
    payment: '',
    wish: ''
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isOtherCity, setIsOtherCity] = useState(false)
  const [districtPrice, setDistrictPrice] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [lastOrderNumber, setLastOrderNumber] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

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

  // Обработчик изменения полей
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Особая логика для города
    if (field === 'city') {
      const cityLower = value.trim().toLowerCase()
      const isZaporizhzhia = zaporizhzhiaVariants.includes(cityLower)

      setIsOtherCity(!isZaporizhzhia)

      if (!isZaporizhzhia) {
        setFormData(prev => ({
          ...prev,
          deliveryType: 'nova_poshta',
          district: '',
          deliveryDayOption: ''
        }))
        setDistrictPrice(0)
      } else {
        setFormData(prev => ({
          ...prev,
          city: 'Запоріжжя'
        }))
      }
    }

    // Для района устанавливаем цену
    if (field === 'district') {
      const selected = zapDistricts.find(d => d.id === value)
      setDistrictPrice(selected ? selected.price : 0)
    }
  }

  // Расчет стоимости доставки
  let deliveryCost = 0
  let showFreeDeliveryHint = false

  if (!isOtherCity && formData.deliveryType === 'courier') {
    if (totalPrice >= FREE_DELIVERY_THRESHOLD) {
      deliveryCost = 0
    } else if (districtPrice > 0) {
      deliveryCost = districtPrice
      showFreeDeliveryHint = true
    } else {
      deliveryCost = 0
      showFreeDeliveryHint = true
    }
  }

  const totalWithDelivery =
    formData.deliveryType === 'courier' ? totalPrice + deliveryCost : totalPrice

  // Валидация шага
  const validateStep = step => {
    switch (step) {
      case 0: // Контактные данные
        if (!nameRegex.test(formData.name)) {
          toast.error('Імʼя має бути не коротше 2 символів')
          return false
        }
        if (!phoneRegex.test(formData.phone)) {
          toast.error('Невірний номер телефону')
          return false
        }
        return true

      case 1: // Адрес
        if (!formData.city || formData.city.length < 2) {
          toast.error('Вкажіть місто')
          return false
        }

        // Адрес обязательный только для Запорожья
        const isZaporizhzhia = zaporizhzhiaVariants.includes(
          formData.city.trim().toLowerCase()
        )
        if (
          isZaporizhzhia &&
          (!formData.address || formData.address.length < 5)
        ) {
          toast.error('Для доставки по Запоріжжю вкажіть адресу')
          return false
        }
        return true

      case 2: // Доставка
        if (!isOtherCity && formData.deliveryType === 'courier') {
          if (!formData.deliveryDayOption) {
            toast.error('Виберіть день доставки')
            return false
          }
          if (!formData.district) {
            toast.error('Оберіть район доставки')
            return false
          }
        }
        if (formData.deliveryType === 'nova_poshta' && !formData.npBranch) {
          toast.error('Вкажіть відділення НП')
          return false
        }
        return true

      case 3: // Оплата
        if (!formData.payment) {
          toast.error('Виберіть спосіб оплати')
          return false
        }
        return true

      default:
        return true
    }
  }

  // Переход к шагу
  const goToStep = stepIndex => {
    // Можно перейти только на уже пройденные шаги или следующий
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex)
    }
  }

  // Переход к следующему шагу
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      // Добавляем текущий шаг в завершенные
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep])
      }

      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  // Переход к предыдущему шагу
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Проверка завершенности всех обязательных шагов
  const areAllStepsValid = () => {
    for (let i = 0; i < 4; i++) {
      // Шаги 0-3 обязательные
      if (!validateStep(i)) {
        return false
      }
    }
    return true
  }

  // Новогодние снежинки для фона
  const snowflakes = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 3,
    delay: Math.random() * 3
  }))

  const handlePaymentSubmit = async e => {
    e.preventDefault()

    // Проверяем все обязательные шаги
    if (!areAllStepsValid()) {
      toast.error(
        'Будь ласка, заповніть всі обовʼязкові поля перед підтвердженням'
      )
      return
    }

    // Проверяем что есть товары в корзине
    if (cartItems.length === 0) {
      toast.error('Додайте товари до кошика')
      return
    }

    setIsSubmitting(true)

    const currentDay = new Date().toLocaleDateString('uk-UA')
    const selectedDistrict = zapDistricts.find(d => d.id === formData.district)
    const isZaporizhzhia = zaporizhzhiaVariants.includes(
      formData.city.trim().toLowerCase()
    )

    const orderNumber = generateRandomOrder()
    setLastOrderNumber(orderNumber)

    const orderDetails = buildOrderDetailsText(cartItems)
    const deliveryTypeText =
      !isOtherCity && formData.deliveryType === 'courier'
        ? 'Курʼєр по Запоріжжю'
        : 'Нова Пошта'
    const deliveryDayText =
      !isOtherCity && formData.deliveryType === 'courier'
        ? formData.deliveryDayOption
        : `Сьогодні (${currentDay})`

    const orderData = {
      order_number: orderNumber,
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      address: formData.address || null,
      delivery_type: deliveryTypeText,
      delivery_day: deliveryDayText,
      np_branch: formData.npBranch || null,
      payment_method: formData.payment,
      wish: formData.wish || null,
      cart_items: cartItems
        .map(item => `${item.name} — ${item.weight} × ${item.quantity}`)
        .join('\n'),
      total_price: totalPrice,
      status: 'Новий',
      district: selectedDistrict ? selectedDistrict.name : null,
      district_price: selectedDistrict ? selectedDistrict.price : null
    }

    try {
      await sendToSupabase(orderData)

      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: `🎁 *НОВОРІЧНЕ ЗАМОВЛЕННЯ*\n
🔢 Номер: *${orderNumber}*

👤 ${formData.name}
📞 ${formData.phone}
🏙 ${formData.city}
${
  !isOtherCity && formData.deliveryType === 'courier'
    ? `📍 Район: ${selectedDistrict ? selectedDistrict.name : '—'}\n`
    : ''
}🏠 ${formData.address || 'Не вказано'}

🚚 ${deliveryTypeText}
📅 ${deliveryDayText}
💸 Вартість доставки: ${
            formData.deliveryType === 'nova_poshta'
              ? 'За тарифами НП'
              : totalPrice >= FREE_DELIVERY_THRESHOLD
              ? 'Безкоштовно 🎄'
              : selectedDistrict
              ? `${selectedDistrict.price} грн`
              : '—'
          }
🏤 ${
            formData.deliveryType === 'nova_poshta'
              ? formData.npBranch
              : 'Не потрібно'
          }

📝 Коментар: ${formData.wish || 'Без коментарів'}

🧾 Новорічні товари:
${orderDetails}

Разом: *${totalPrice} грн*
💳 Оплата: ${formData.payment}`,
          parse_mode: 'Markdown'
        }
      )

      setShowModal(true)
      clearCart()

      // Сброс формы
      setFormData({
        name: '',
        phone: '',
        city: '',
        address: '',
        deliveryType: 'courier',
        district: '',
        deliveryDayOption: '',
        npBranch: '',
        payment: '',
        wish: ''
      })
      setCurrentStep(0)
      setCompletedSteps([])
      setIsOtherCity(false)
      setDistrictPrice(0)
    } catch (err) {
      console.error(err)
      toast.error(
        'Сталася помилка при оформленні замовлення. Спробуйте ще раз.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Автоскролл при смене шага
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-red-50 to-amber-50 py-8 md:py-12 relative overflow-hidden'>
      <Toaster position='top-center' />

      {/* Анимированные снежинки */}
      <div className='absolute inset-0 pointer-events-none z-0'>
        {snowflakes.map(flake => (
          <motion.div
            key={flake.id}
            className='absolute text-blue-300/20'
            style={{
              left: flake.left,
              fontSize: `${flake.size}px`
            }}
            initial={{ y: -50 }}
            animate={{ y: '100vh' }}
            transition={{
              duration: 3 + Math.random() * 5,
              delay: flake.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <FontAwesomeIcon icon={faSnowflake} />
          </motion.div>
        ))}
      </div>

      {/* Новогодние гирлянды */}
      <div className='absolute top-0 left-0 right-0 h-1 z-10'>
        <div className='flex justify-between px-2'>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className='w-2 h-2 rounded-full'
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                repeat: Infinity
              }}
              style={{
                backgroundColor:
                  i % 3 === 0 ? '#dc2626' : i % 3 === 1 ? '#16a34a' : '#fbbf24'
              }}
            />
          ))}
        </div>
      </div>

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
            className='bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl max-w-md w-full p-8 relative border-2 border-white/50 overflow-hidden'
          >
            {/* Новогодний декор */}
            <div className='absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full opacity-20 blur-xl'></div>
            <div className='absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full opacity-20 blur-xl'></div>

            <button
              onClick={() => setShowModal(false)}
              className='absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition z-10'
            >
              <FontAwesomeIcon icon={faXmark} size='lg' />
            </button>

            <div className='text-center pt-4 relative z-10'>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 mb-4 shadow-xl'
              >
                <FontAwesomeIcon
                  icon={faGift}
                  className='text-white text-3xl'
                />
              </motion.div>

              <h2 className='text-3xl font-bold text-gray-900 font-serif'>
                З Новим Роком! 🎄
              </h2>

              <p className='text-gray-700 mt-3 text-base'>
                Ваше новорічне замовлення прийнято!
              </p>

              <div className='mt-6 p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-amber-200'>
                <p className='text-sm text-gray-600 mb-2'>Номер замовлення:</p>
                <p className='text-3xl font-extrabold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent tracking-wider'>
                  {lastOrderNumber}
                </p>
              </div>

              <p className='text-gray-600 text-sm mt-6 leading-relaxed'>
                Наш менеджер звʼяжеться з вами найближчим часом для
                підтвердження новорічного замовлення.
              </p>

              <motion.button
                onClick={() => setShowModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='mt-8 px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 text-white font-bold shadow-xl hover:shadow-2xl transition relative overflow-hidden'
              >
                {/* Блестящий эффект */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className='relative z-10'>Готово! 🎅</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ==== MAIN CONTENT ==== */}
      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-6xl mx-auto'>
          {/* BACK LINK */}
          <div className='mb-6 md:mb-8'>
            <Link
              to='/cart'
              className='inline-flex items-center text-red-600 hover:text-red-500 font-medium px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg border border-white/30'
            >
              <FontAwesomeIcon icon={faArrowLeft} className='mr-3' />
              Повернутися до новорічного кошика
            </Link>
          </div>

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-10'
          >
            <div className='flex items-center mb-4'>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className='mr-4'
              >
                <FontAwesomeIcon
                  icon={faGift}
                  className='text-red-500 text-3xl'
                />
              </motion.div>
              <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 font-serif'>
                <span className='bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-green-500'>
                  Новорічне оформлення
                </span>
              </h1>
            </div>

            <div className='flex items-center space-x-3 mb-6'>
              <div className='w-32 h-1 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full'></div>
              <motion.div
                className='w-4 h-4 bg-yellow-300 rounded-full shadow-lg'
                animate={{ x: [0, 128, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            <p className='text-gray-600 text-lg max-w-2xl'>
              Заповніть контактні дані, оберіть спосіб доставки та оплати для
              вашого новорічного замовлення!
            </p>
          </motion.div>

          <div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-8 lg:gap-10'>
            {/* ========== LEFT COLUMN — FORM ========== */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl border-2 border-white/30 overflow-hidden relative'
            >
              {/* Новогодний декор */}
              <div className='absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full opacity-20 blur-lg'></div>

              {/* Шаги прогресса */}
              <div className='p-6 md:p-8 bg-gradient-to-r from-red-600 to-yellow-600 border-b border-white/20'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl md:text-2xl font-bold text-white flex items-center'>
                    <FontAwesomeIcon icon={faWallet} className='mr-4' />
                    {FORM_STEPS[currentStep].title}
                  </h2>
                  <div className='text-white text-sm font-medium'>
                    Крок {currentStep + 1} з {FORM_STEPS.length}
                  </div>
                </div>

                {/* Прогресс бар с кликабельными шагами */}
                <div className='mt-6'>
                  <div className='flex justify-between items-center mb-3'>
                    {FORM_STEPS.map((step, index) => (
                      <React.Fragment key={step.id}>
                        <div className='flex flex-col items-center'>
                          <motion.button
                            type='button'
                            onClick={() => goToStep(index)}
                            disabled={
                              !(
                                index <= currentStep ||
                                completedSteps.includes(index)
                              )
                            }
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                              index <= currentStep ||
                              completedSteps.includes(index)
                                ? `bg-gradient-to-r ${step.color} cursor-pointer hover:scale-110`
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                            whileHover={
                              index <= currentStep ||
                              completedSteps.includes(index)
                                ? { scale: 1.1 }
                                : {}
                            }
                            animate={{
                              scale: index === currentStep ? [1, 1.1, 1] : 1,
                              boxShadow:
                                index === currentStep
                                  ? '0 0 20px rgba(255,255,255,0.5)'
                                  : 'none'
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <FontAwesomeIcon
                              icon={step.icon}
                              className='text-white'
                            />
                            {completedSteps.includes(index) &&
                              index !== currentStep && (
                                <div className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className='text-white text-xs'
                                  />
                                </div>
                              )}
                          </motion.button>
                          <span
                            className={`text-xs font-medium ${
                              index <= currentStep ||
                              completedSteps.includes(index)
                                ? 'text-white'
                                : 'text-gray-300'
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                        {index < FORM_STEPS.length - 1 && (
                          <div
                            className={`h-1 flex-1 mx-2 ${
                              index < currentStep ||
                              completedSteps.includes(index + 1)
                                ? 'bg-white'
                                : 'bg-white/30'
                            } rounded-full`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <form
                ref={formRef}
                onSubmit={handlePaymentSubmit}
                className='p-6 md:p-8'
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className='space-y-8'
                  >
                    {/* ШАГ 1: Контактные данные */}
                    {currentStep === 0 && (
                      <div className='space-y-6'>
                        <div className='space-y-2'>
                          <label className='text-gray-700 font-medium text-lg flex items-center'>
                            <FontAwesomeIcon
                              icon={faUser}
                              className='text-red-500 mr-3 text-xl'
                            />
                            Ім'я та прізвище *
                          </label>
                          <input
                            type='text'
                            value={formData.name}
                            onChange={e =>
                              handleInputChange('name', e.target.value)
                            }
                            required
                            className='w-full px-4 py-3.5 border-2 border-red-200 rounded-xl text-base bg-white/80 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-300 outline-none transition-all duration-300 hover:shadow-md'
                            placeholder='Наприклад: Іван Петренко'
                          />
                        </div>

                        <div className='space-y-2'>
                          <label className='text-gray-700 font-medium text-lg flex items-center'>
                            <FontAwesomeIcon
                              icon={faPhone}
                              className='text-green-500 mr-3 text-xl'
                            />
                            Номер телефону *
                          </label>
                          <input
                            type='tel'
                            value={formData.phone}
                            onChange={e =>
                              handleInputChange('phone', e.target.value)
                            }
                            required
                            className='w-full px-4 py-3.5 border-2 border-green-200 rounded-xl text-base bg-white/80 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-300 outline-none transition-all duration-300 hover:shadow-md'
                            placeholder='+380XXXXXXXXX'
                          />
                          <p className='text-sm text-gray-500 mt-2'>
                            Вкажіть актуальний номер — ми зателефонуємо для
                            підтвердження новорічного замовлення.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ШАГ 2: Адрес */}
                    {currentStep === 1 && (
                      <div className='space-y-6'>
                        <div className='space-y-2'>
                          <label className='text-gray-700 font-medium text-lg flex items-center'>
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className='text-blue-500 mr-3 text-xl'
                            />
                            Місто *
                          </label>
                          <input
                            type='text'
                            value={formData.city}
                            onChange={e =>
                              handleInputChange('city', e.target.value)
                            }
                            required
                            className='w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl text-base bg-white/80 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-300 hover:shadow-md'
                            placeholder='Запоріжжя або інше місто'
                          />
                          <p className='text-sm text-gray-500 mt-2 flex items-center'>
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className='text-amber-500 mr-2'
                            />
                            Для доставки по Запоріжжю введіть "Запоріжжя"
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-gray-700 font-medium text-lg flex items-center'>
                            <FontAwesomeIcon
                              icon={faHome}
                              className='text-purple-500 mr-3 text-xl'
                            />
                            Адреса доставки{' '}
                            {isOtherCity ? '(необовʼязково)' : '*'}
                          </label>
                          <textarea
                            value={formData.address}
                            onChange={e =>
                              handleInputChange('address', e.target.value)
                            }
                            rows='3'
                            className='w-full px-4 py-3.5 border-2 border-purple-200 rounded-xl text-base bg-white/80 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-300 outline-none transition-all duration-300 hover:shadow-md resize-none'
                            placeholder={
                              isOtherCity
                                ? 'Якщо потрібна курʼєрська доставка в іншому місті'
                                : 'Вкажіть вулицю, будинок, підʼїзд, квартиру тощо'
                            }
                          ></textarea>
                          <p className='text-sm text-gray-500 mt-2'>
                            {isOtherCity
                              ? 'Для інших міст доставка здійснюється через Нову Пошту'
                              : 'Для доставки по Запоріжжю обовʼязково вкажіть адресу'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ШАГ 3: Доставка */}
                    {currentStep === 2 && (
                      <div className='space-y-6'>
                        <div className='space-y-4'>
                          <h3 className='text-lg font-bold text-gray-800 flex items-center'>
                            <FontAwesomeIcon
                              icon={faTruck}
                              className='text-blue-500 mr-3'
                            />
                            Спосіб доставки
                          </h3>

                          {!isOtherCity && (
                            <motion.label
                              whileHover={{ scale: 1.01 }}
                              className={`flex items-start space-x-4 p-4 border-2 ${
                                formData.deliveryType === 'courier'
                                  ? 'border-red-400 bg-red-50/50'
                                  : 'border-red-300'
                              } rounded-2xl cursor-pointer hover:border-red-400 hover:bg-red-50/50 transition-all duration-300`}
                            >
                              <input
                                type='radio'
                                name='deliveryType'
                                value='courier'
                                checked={formData.deliveryType === 'courier'}
                                onChange={() =>
                                  handleInputChange('deliveryType', 'courier')
                                }
                                className='h-5 w-5 mt-1 text-red-600'
                              />
                              <div className='flex-1'>
                                <div className='flex items-center'>
                                  <p className='font-bold text-gray-900 text-lg'>
                                    Кур'єр по Запоріжжю
                                  </p>
                                  <span className='ml-3 text-xs px-2 py-1 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full font-bold'>
                                    🎄 Популярно
                                  </span>
                                </div>
                                <p className='text-sm text-gray-600 mt-2'>
                                  Доставка по місту. Безкоштовно від{' '}
                                  <span className='font-bold text-red-600'>
                                    {FREE_DELIVERY_THRESHOLD} грн
                                  </span>
                                </p>
                              </div>
                            </motion.label>
                          )}

                          <motion.label
                            whileHover={{ scale: 1.01 }}
                            className={`flex items-start space-x-4 p-4 border-2 ${
                              formData.deliveryType === 'nova_poshta'
                                ? 'border-green-400 bg-green-50/50'
                                : 'border-green-300'
                            } rounded-2xl cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-all duration-300`}
                          >
                            <input
                              type='radio'
                              name='deliveryType'
                              value='nova_poshta'
                              checked={formData.deliveryType === 'nova_poshta'}
                              onChange={() =>
                                handleInputChange('deliveryType', 'nova_poshta')
                              }
                              className='h-5 w-5 mt-1 text-green-600'
                            />
                            <div className='flex-1'>
                              <p className='font-bold text-gray-900 text-lg'>
                                Нова Пошта
                              </p>
                              <p className='text-sm text-gray-600 mt-2'>
                                Відправлення по всій Україні
                              </p>
                            </div>
                          </motion.label>
                        </div>

                        {/* Район доставки */}
                        {!isOtherCity && formData.deliveryType === 'courier' && (
                          <div className='space-y-3'>
                            <label className='text-gray-700 font-bold text-lg block'>
                              Район доставки *
                            </label>
                            <select
                              value={formData.district}
                              onChange={e =>
                                handleInputChange('district', e.target.value)
                              }
                              required
                              className='w-full px-4 py-3.5 border-2 border-red-300 rounded-xl bg-white text-base focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-300 hover:shadow-md'
                            >
                              <option value=''>🎁 Оберіть район…</option>
                              {zapDistricts.map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name} — {d.price} грн
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* День доставки */}
                        {!isOtherCity && formData.deliveryType === 'courier' && (
                          <div className='space-y-3'>
                            <label className='text-gray-700 font-bold text-lg block'>
                              День доставки *
                            </label>
                            <motion.label
                              whileHover={{ scale: 1.01 }}
                              className='flex items-start space-x-4 p-4 border-2 border-yellow-300 rounded-2xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-all duration-300'
                            >
                              <input
                                type='radio'
                                name='deliveryDayOption'
                                value='Субота'
                                checked={
                                  formData.deliveryDayOption === 'Субота'
                                }
                                onChange={() =>
                                  handleInputChange(
                                    'deliveryDayOption',
                                    'Субота'
                                  )
                                }
                                className='h-5 w-5 mt-1 text-yellow-600'
                              />
                              <div>
                                <p className='font-bold text-gray-900 text-lg'>
                                  Субота
                                </p>
                                <p className='text-sm text-gray-600 mt-2'>
                                  Доставка у найближчу суботу
                                </p>
                              </div>
                            </motion.label>
                          </div>
                        )}

                        {/* Отделение НП */}
                        {formData.deliveryType === 'nova_poshta' && (
                          <div className='space-y-3'>
                            <label className='text-gray-700 font-bold text-lg block'>
                              Відділення / Поштомат НП *
                            </label>
                            <input
                              type='text'
                              value={formData.npBranch}
                              onChange={e =>
                                handleInputChange('npBranch', e.target.value)
                              }
                              required
                              className='w-full px-4 py-3.5 border-2 border-green-300 rounded-xl text-base bg-white/80 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-300 outline-none transition-all duration-300 hover:shadow-md'
                              placeholder='Наприклад: Відділення №5, вул. Прикладна, 10'
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* ШАГ 4: Оплата */}
                    {currentStep === 3 && (
                      <div className='space-y-6'>
                        <h3 className='text-lg font-bold text-gray-800 flex items-center'>
                          <FontAwesomeIcon
                            icon={faCreditCard}
                            className='text-indigo-500 mr-3'
                          />
                          Спосіб оплати
                        </h3>

                        <div className='space-y-4'>
                          {!isOtherCity && (
                            <motion.label
                              whileHover={{ scale: 1.01 }}
                              className={`flex items-start space-x-4 p-4 border-2 ${
                                formData.payment === 'Готівкою при отриманні'
                                  ? 'border-green-400 bg-green-50/50'
                                  : 'border-green-300'
                              } rounded-2xl cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-all duration-300`}
                            >
                              <input
                                type='radio'
                                name='payment'
                                value='Готівкою при отриманні'
                                checked={
                                  formData.payment === 'Готівкою при отриманні'
                                }
                                onChange={() =>
                                  handleInputChange(
                                    'payment',
                                    'Готівкою при отриманні'
                                  )
                                }
                                className='h-5 w-5 mt-1 text-green-600'
                              />
                              <div>
                                <p className='font-bold text-gray-900 text-lg'>
                                  Готівкою при отриманні
                                </p>
                                <p className='text-sm text-gray-600 mt-2'>
                                  Оплата кур'єру при доставці
                                </p>
                              </div>
                            </motion.label>
                          )}

                          <motion.label
                            whileHover={{ scale: 1.01 }}
                            className={`flex items-start space-x-4 p-4 border-2 ${
                              formData.payment === 'Передоплата'
                                ? 'border-indigo-400 bg-indigo-50/50'
                                : 'border-indigo-300'
                            } rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300`}
                          >
                            <input
                              type='radio'
                              name='payment'
                              value='Передоплата'
                              checked={formData.payment === 'Передоплата'}
                              onChange={() =>
                                handleInputChange('payment', 'Передоплата')
                              }
                              className='h-5 w-5 mt-1 text-indigo-600'
                            />
                            <div>
                              <p className='font-bold text-gray-900 text-lg'>
                                Передоплата
                              </p>
                              <p className='text-sm text-gray-600 mt-2'>
                                Реквізити для оплати після підтвердження
                              </p>
                            </div>
                          </motion.label>
                        </div>
                      </div>
                    )}

                    {/* ШАГ 5: Комментарий */}
                    {currentStep === 4 && (
                      <div className='space-y-6'>
                        <div className='space-y-2'>
                          <label className='text-gray-700 font-medium text-lg flex items-center'>
                            <FontAwesomeIcon
                              icon={faCommentDots}
                              className='text-purple-500 mr-3 text-xl'
                            />
                            Коментар до замовлення (необовʼязково)
                          </label>
                          <textarea
                            value={formData.wish}
                            onChange={e =>
                              handleInputChange('wish', e.target.value)
                            }
                            rows='4'
                            className='w-full px-4 py-3.5 border-2 border-purple-300 rounded-xl text-base bg-white/80 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-300 outline-none transition-all duration-300 hover:shadow-md resize-none'
                            placeholder='Напишіть новорічні побажання або особливі вказівки'
                          ></textarea>
                        </div>

                        <div className='p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-300'>
                          <div className='flex items-start gap-4'>
                            <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0'>
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className='text-white text-lg'
                              />
                            </div>
                            <div>
                              <p className='text-sm md:text-base text-gray-700 leading-relaxed font-medium'>
                                Всі обовʼязкові поля заповнені! 🎉
                              </p>
                              <p className='text-sm text-gray-600 mt-2'>
                                Натисніть "Підтвердити замовлення" нижче, щоб
                                завершити оформлення новорічного замовлення.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Кнопки навигации */}
                <div className='flex justify-between pt-8 mt-8 border-t border-amber-100'>
                  {currentStep > 0 ? (
                    <motion.button
                      type='button'
                      onClick={goToPrevStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className='px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-medium rounded-xl flex items-center space-x-3 hover:shadow-md transition-all'
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                      <span>Назад</span>
                    </motion.button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < FORM_STEPS.length - 1 ? (
                    <motion.button
                      type='button'
                      onClick={goToNextStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className='px-8 py-3 bg-gradient-to-r from-red-500 to-yellow-500 text-white font-bold rounded-xl flex items-center space-x-3 hover:shadow-lg transition-all'
                    >
                      <span>Далі</span>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </motion.button>
                  ) : (
                    <motion.button
                      type='button'
                      onClick={handlePaymentSubmit}
                      disabled={
                        isSubmitting ||
                        cartItems.length === 0 ||
                        !areAllStepsValid()
                      }
                      whileHover={
                        !isSubmitting &&
                        cartItems.length > 0 &&
                        areAllStepsValid()
                          ? { scale: 1.02 }
                          : {}
                      }
                      whileTap={
                        !isSubmitting &&
                        cartItems.length > 0 &&
                        areAllStepsValid()
                          ? { scale: 0.98 }
                          : {}
                      }
                      className={`px-8 py-3 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 
                        text-white font-bold rounded-xl flex items-center space-x-3 
                        transition-all relative overflow-hidden
                        ${
                          isSubmitting ||
                          cartItems.length === 0 ||
                          !areAllStepsValid()
                            ? 'opacity-70 cursor-not-allowed'
                            : 'hover:shadow-lg'
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className='animate-spin h-5 w-5 text-white'
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
                          <FontAwesomeIcon icon={faGift} />
                          <span>Підтвердити замовлення</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

                {cartItems.length === 0 && (
                  <div className='mt-6 p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-200'>
                    <p className='text-center text-red-600 font-medium'>
                      🎄 Додайте новорічні товари до кошика, щоб оформити
                      замовлення
                    </p>
                  </div>
                )}

                {currentStep === FORM_STEPS.length - 1 && !areAllStepsValid() && (
                  <div className='mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-300'>
                    <p className='text-center text-amber-700 font-medium'>
                      ⚠️ Заповніть всі обовʼязкові поля на попередніх кроках
                    </p>
                  </div>
                )}

                {/* INFO */}
                <div className='mt-8 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-300 shadow-sm'>
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0'>
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className='text-white text-lg'
                      />
                    </div>
                    <div>
                      <p className='text-sm md:text-base text-gray-700 leading-relaxed'>
                        Маєте питання щодо новорічних замовлень? Телефонуйте:{' '}
                        <a
                          href='tel:+380500203693'
                          className='text-red-600 hover:underline font-bold'
                        >
                          +38 (050) 020 36 93
                        </a>
                        . Ми з радістю допоможемо з підготовкою до свята! 🎁
                      </p>
                      <p className='text-xs text-gray-500 mt-3 flex items-center'>
                        <FontAwesomeIcon
                          icon={faSnowflake}
                          className='text-blue-400 mr-2'
                        />
                        Замовляйте до{' '}
                        <span className='font-bold text-red-600 mx-1'>
                          26 грудня (включно)
                        </span>{' '}
                        для гарантованої доставки на свята
                      </p>
                    </div>
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
              <div className='bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl border-2 border-white/30 overflow-hidden'>
                <div className='p-6 md:p-8 bg-gradient-to-r from-green-600 to-emerald-600 border-b border-white/20'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className='w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg'
                      >
                        <FontAwesomeIcon
                          icon={faCartShopping}
                          className='text-white text-2xl'
                        />
                      </motion.div>
                      <div>
                        <h2 className='text-xl font-bold text-white'>
                          Новорічне замовлення
                        </h2>
                        <p className='text-amber-100 text-sm'>
                          Подарунків у кошику: {cartCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='max-h-[400px] overflow-y-auto divide-y divide-amber-100'>
                  {cartItems.length === 0 ? (
                    <div className='p-10 text-center'>
                      <div className='w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center'>
                        <FontAwesomeIcon
                          icon={faGift}
                          className='text-gray-400 text-3xl'
                        />
                      </div>
                      <p className='text-gray-500 font-medium'>
                        Кошик порожній
                      </p>
                      <p className='text-sm text-gray-400 mt-2'>
                        Додайте новорічні товари!
                      </p>
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                        className='p-5 hover:bg-white/60 transition-all duration-300'
                      >
                        <div className='flex items-center gap-4'>
                          <div className='relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white/50 shadow-lg flex-shrink-0'>
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
                            {/* Новогодний декор */}
                            <div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center'>
                              <span className='text-white text-xs'>🎁</span>
                            </div>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-bold text-gray-900 truncate text-lg'>
                              {item.name}
                            </p>
                            <div className='flex items-center flex-wrap gap-2 mt-2'>
                              <span className='text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full'>
                                {item.weight}
                              </span>
                              <span className='text-sm text-gray-600 bg-amber-100 px-2.5 py-1 rounded-full'>
                                Кількість: {item.quantity}
                              </span>
                            </div>
                            <p className='text-sm text-gray-500 mt-2'>
                              Ціна за одиницю:{' '}
                              <span className='font-semibold text-red-600'>
                                {item.price}
                              </span>
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='font-bold text-lg bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent'>
                              {calculateItemTotal(item)} грн
                            </p>
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className='text-xs px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold mt-1 inline-block'
                            >
                              🎄 Ціна свята
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* TOTAL BLOCK */}
                <div className='p-6 md:p-8 bg-gradient-to-br from-amber-50 to-red-50 border-t border-amber-200 space-y-5'>
                  {showFreeDeliveryHint && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className='p-4 bg-gradient-to-r from-yellow-50 to-amber-100 rounded-2xl border border-yellow-300 shadow-sm'
                    >
                      <div className='flex items-center'>
                        <div className='w-10 h-10 mr-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center'>
                          <FontAwesomeIcon
                            icon={faStar}
                            className='text-white'
                          />
                        </div>
                        <p className='text-sm text-amber-800'>
                          До безкоштовної доставки по м. Запоріжжя залишилось{' '}
                          <span className='font-bold text-red-600'>
                            {(FREE_DELIVERY_THRESHOLD - totalPrice).toFixed(2)}{' '}
                            грн
                          </span>
                          ! 🎁
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className='space-y-3 text-base'>
                    <div className='flex justify-between'>
                      <span className='text-gray-700'>Новорічні товари:</span>
                      <span className='font-bold text-gray-900'>
                        {totalPrice.toFixed(2)} грн
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-gray-700'>Доставка:</span>
                      <span className='font-bold'>
                        {formData.deliveryType === 'nova_poshta' ? (
                          'За тарифами НП'
                        ) : totalPrice >= FREE_DELIVERY_THRESHOLD ? (
                          <span className='text-green-600'>Безкоштовно 🎁</span>
                        ) : districtPrice > 0 ? (
                          <span className='text-red-600'>
                            {districtPrice.toFixed(2)} грн
                          </span>
                        ) : (
                          'Оберіть район'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className='pt-4 border-t-2 border-amber-300'>
                    <div className='flex justify-between items-center'>
                      <div className='flex flex-col'>
                        <span className='text-sm uppercase tracking-wide text-gray-500 font-bold'>
                          Разом до оплати
                        </span>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='text-3xl font-extrabold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent'
                      >
                        {formData.deliveryType === 'courier'
                          ? (
                              totalPrice +
                              (totalPrice >= FREE_DELIVERY_THRESHOLD
                                ? 0
                                : districtPrice || 0)
                            ).toFixed(2)
                          : totalPrice.toFixed(2)}{' '}
                        грн
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTNOTE */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className='mt-6 bg-gradient-to-r from-white/80 to-white/50 backdrop-blur-sm border border-white/30 rounded-2xl p-5 text-xs text-gray-600 leading-relaxed'
              >
                <div className='flex items-start mb-3'>
                  <FontAwesomeIcon
                    icon={faSnowflake}
                    className='text-blue-400 mr-2 mt-1'
                  />
                  <p>
                    Натискаючи &quot;Підтвердити новорічне замовлення&quot;, ви
                    погоджуєтесь з{' '}
                    <Link
                      to='/Terms'
                      className='text-red-600 hover:underline font-medium'
                    >
                      умовами використання
                    </Link>
                    ,{' '}
                    <Link
                      to='/Privacy'
                      className='text-green-600 hover:underline font-medium'
                    >
                      політикою конфіденційності
                    </Link>{' '}
                    та{' '}
                    <Link
                      to='/Refund'
                      className='text-amber-600 hover:underline font-medium'
                    >
                      правилами повернення коштів
                    </Link>
                    .
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
