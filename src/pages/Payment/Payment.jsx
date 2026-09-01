import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCheckCircle,
  faShoppingBasket,
  faInfoCircle,
  faTruck,
  faWallet,
  faXmark,
  faUser,
  faHome,
  faCalendarDay,
  faMapMarkerAlt,
  faCreditCard,
  faCommentDots,
  faChevronRight,
  faChevronLeft,
  faPhone,
  faTruckFast
} from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

const FREE_DELIVERY_THRESHOLD = 800

const zapDistricts = [
  { id: 'shev', name: 'Шевченківський', price: 60 },
  { id: 'olex', name: 'Олександрівський', price: 70 },
  { id: 'voz', name: 'Вознесенівський', price: 70 },
  { id: 'hort', name: 'Хортицький', price: 80 },
  { id: 'dnipro', name: 'Дніпровський', price: 75 },
  { id: 'zavod', name: 'Заводський', price: 85 },
  { id: 'komun', name: 'Комунарський', price: 50 }
]

const parsePrice = val => Number(String(val).replace(/[^\d.]/g, '')) || 0
const phoneRegex = /^\+?\d{10,15}$/
const nameRegex = /^[А-Яа-яЁёЇїІіЄєҐґA-Za-z\s'-]{2,}$/u

const generateOrderNumber = () => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const rand = Math.floor(100 + Math.random() * 900)
  return `${year}${month}${day}-${rand}`
}

/* ─── БУДУЄМО РЯДОК ТОВАРУ (з начинкою і дизайном) ─────── */
const buildOrderDetailsText = cartItems =>
  cartItems
    .map((item, i) => {
      const weightLabel = item.weight ? `${item.weight}` : ''
      const qty = Number(item.quantity) || 1
      const price = parsePrice(item.price)
      const lineTotal = price * qty

      // Начинка (якщо є)
      const fillingLine = item.filling
        ? ` | Начинка: ${item.fillingEmoji || ''} ${item.filling}`.trim()
        : ''

      // Дизайн (якщо є)
      const designLine = item.design
        ? ` | 📸 ${item.designLabel || `Дизайн №${item.design}`}`
        : ''

      return (
        `${i + 1}. *${item.name}*` +
        `${weightLabel ? ` — ${weightLabel}` : ''}` +
        `${fillingLine}` +
        `${designLine}` +
        ` × ${qty} шт = ${lineTotal} грн`
      )
    })
    .join('\n')

const buildTelegramMessage = ({
  orderNumber,
  formData,
  orderData,
  cartItems,
  totalWithDelivery,
  isOtherCity,
  selectedDistrict
}) => {
  const deliveryLine = isOtherCity
    ? `🚚 Нова Пошта (відділення: ${formData.npBranch || '—'})`
    : formData.deliveryType === 'nova_poshta'
    ? `🚚 Нова Пошта (відділення: ${formData.npBranch || '—'})`
    : `🛵 Кур'єр по Запоріжжю\n   📍 Район: ${
        selectedDistrict?.name || '—'
      }\n   📅 День: ${formData.deliveryDayOption || '—'}`

  const deliveryCostLine =
    isOtherCity || formData.deliveryType === 'nova_poshta'
      ? '💸 Вартість доставки: за тарифом перевізника'
      : orderData.delivery_cost === 0
      ? '💸 Доставка: безкоштовно 🎉'
      : `💸 Доставка: ${orderData.delivery_cost} грн`

  const itemsText = buildOrderDetailsText(cartItems)

  return (
    `📦 *НОВЕ ЗАМОВЛЕННЯ #${orderNumber}*\n` +
    `${'─'.repeat(28)}\n\n` +
    `👤 *Клієнт:* ${formData.name}\n` +
    `📞 *Телефон:* ${formData.phone}\n\n` +
    `${'─'.repeat(28)}\n` +
    `🏙 *Місто:* ${formData.city}\n` +
    `🏠 *Адреса:* ${formData.address || '—'}\n` +
    `${deliveryLine}\n\n` +
    `${'─'.repeat(28)}\n` +
    `🛒 *Склад замовлення:*\n${itemsText}\n\n` +
    `${'─'.repeat(28)}\n` +
    `💰 *Сума товарів:* ${orderData.total_items_price} грн\n` +
    `${deliveryCostLine}\n` +
    `✅ *РАЗОМ до оплати: ${totalWithDelivery} грн*\n\n` +
    `💳 *Оплата:* ${formData.payment}\n` +
    (formData.wish ? `\n💬 *Коментар:* ${formData.wish}` : '')
  )
}

const FORM_STEPS = [
  { id: 'contact', title: 'Контакти', icon: faUser, color: 'bg-[#2D241E]' },
  { id: 'address', title: 'Адреса', icon: faHome, color: 'bg-orange-500' },
  { id: 'delivery', title: 'Доставка', icon: faTruck, color: 'bg-green-600' },
  { id: 'payment', title: 'Оплата', icon: faCreditCard, color: 'bg-blue-600' },
  {
    id: 'comment',
    title: 'Коментар',
    icon: faCommentDots,
    color: 'bg-gray-500'
  }
]

/* ─── HELPER: resolve image src ─────────────────────────── */
function resolveImageSrc (item) {
  const raw = item.images?.[0]
  if (!raw) return zaglushka
  if (item.category === 'paska') return raw
  try {
    return new URL(`../../assets/products/${raw}`, import.meta.url).href
  } catch {
    return zaglushka
  }
}

export function Payment () {
  const { cartItems, clearCart } = useCartStore()
  const totalPrice = useCartStore(state => state.totalPrice())
  const cartCount = useCartStore(state => state.cartCount())
  const shouldReduceMotion = useReducedMotion()
  const formRef = useRef()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const zaporizhzhiaVariants = useMemo(
    () => ['запоріжжя', 'запорожье', 'зп', 'zaporizhzhia', 'zaporozhye'],
    []
  )

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData(prev => {
        const newData = { ...prev, [field]: value }

        if (field === 'city') {
          const cityName = value.trim().toLowerCase()
          const isZap = zaporizhzhiaVariants.includes(cityName)
          const isCurrentOther = !isZap

          setIsOtherCity(isCurrentOther)

          if (isCurrentOther) {
            newData.district = ''
            newData.deliveryDayOption = ''
            newData.deliveryType = 'nova_poshta'
            newData.payment = 'Передоплата'
            setDistrictPrice(0)
          } else {
            newData.city = 'Запоріжжя'
            if (newData.deliveryType === 'nova_poshta') {
              newData.payment = 'Передоплата'
            }
          }
        }

        if (field === 'deliveryType') {
          if (value === 'nova_poshta') {
            newData.district = ''
            newData.deliveryDayOption = ''
            newData.payment = 'Передоплата'
            setDistrictPrice(0)
          }
          if (value === 'courier') {
            newData.npBranch = ''
          }
        }

        if (field === 'district') {
          const selected = zapDistricts.find(d => d.id === value)
          setDistrictPrice(selected ? selected.price : 0)
        }

        return newData
      })
    },
    [zaporizhzhiaVariants]
  )

  const {
    deliveryCost,
    deliveryCostLabel,
    showFreeDeliveryHint,
    totalWithDelivery
  } = useMemo(() => {
    if (isOtherCity || formData.deliveryType === 'nova_poshta') {
      return {
        deliveryCost: 0,
        deliveryCostLabel: 'За тарифом перевізника',
        showFreeDeliveryHint: false,
        totalWithDelivery: totalPrice
      }
    }

    if (!formData.district) {
      return {
        deliveryCost: 0,
        deliveryCostLabel: 'Залежить від району',
        showFreeDeliveryHint: false,
        totalWithDelivery: totalPrice
      }
    }

    if (totalPrice >= FREE_DELIVERY_THRESHOLD) {
      return {
        deliveryCost: 0,
        deliveryCostLabel: 'Безкоштовно 🎉',
        showFreeDeliveryHint: false,
        totalWithDelivery: totalPrice
      }
    }

    return {
      deliveryCost: districtPrice,
      deliveryCostLabel: `${districtPrice} грн`,
      showFreeDeliveryHint: true,
      totalWithDelivery: totalPrice + districtPrice
    }
  }, [
    isOtherCity,
    formData.deliveryType,
    formData.district,
    totalPrice,
    districtPrice
  ])

  const validateStep = useCallback(
    step => {
      switch (step) {
        case 0:
          if (!nameRegex.test(formData.name))
            return toast.error('Введіть коректне імʼя'), false
          if (!phoneRegex.test(formData.phone))
            return toast.error('Невірний номер телефону'), false
          return true
        case 1:
          if (!formData.city) return toast.error('Вкажіть місто'), false
          if (
            !isOtherCity &&
            (!formData.address || formData.address.length < 5)
          )
            return toast.error('Вкажіть повну адресу для доставки'), false
          return true
        case 2:
          if (!isOtherCity && formData.deliveryType === 'courier') {
            if (!formData.deliveryDayOption)
              return toast.error('Виберіть день'), false
            if (!formData.district) return toast.error('Оберіть район'), false
          }
          if (formData.deliveryType === 'nova_poshta' && !formData.npBranch)
            return toast.error('Вкажіть відділення НП'), false
          return true
        case 3:
          if (!formData.payment)
            return toast.error('Оберіть спосіб оплати'), false
          return true
        default:
          return true
      }
    },
    [formData, isOtherCity]
  )

  const goToStep = idx =>
    (idx <= currentStep || completedSteps.includes(idx)) && setCurrentStep(idx)

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep))
        setCompletedSteps(p => [...p, currentStep])
      if (currentStep < FORM_STEPS.length - 1) setCurrentStep(p => p + 1)
    }
  }

  const handlePaymentSubmit = async e => {
    if (e) e.preventDefault()
    if (cartItems.length === 0) return toast.error('Кошик порожній')

    setIsSubmitting(true)
    const orderNumber = generateOrderNumber()
    setLastOrderNumber(orderNumber)
    const selectedDistrict = zapDistricts.find(d => d.id === formData.district)

    const orderData = {
      order_number: orderNumber,
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      address: formData.address,
      delivery_type:
        isOtherCity || formData.deliveryType === 'nova_poshta'
          ? 'Нова Пошта'
          : 'Курʼєр',
      delivery_day: formData.deliveryDayOption || 'Сьогодні',
      np_branch: formData.npBranch,
      payment_method: formData.payment,
      wish: formData.wish,
      cart_items: buildOrderDetailsText(cartItems),
      total_items_price: totalPrice,
      delivery_cost: deliveryCost,
      total_price: totalWithDelivery,
      status: 'Новий',
      district: selectedDistrict?.name
    }

    const telegramText = buildTelegramMessage({
      orderNumber,
      formData,
      orderData,
      cartItems,
      totalWithDelivery,
      isOtherCity,
      selectedDistrict
    })

    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramText,
          parse_mode: 'Markdown'
        }
      )
      setShowModal(true)
      clearCart()
    } catch (err) {
      toast.error('Помилка оформлення. Спробуйте ще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#FDFCFB] py-8 md:py-16'>
      <Toaster position='top-center' />

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className='fixed inset-0 bg-[#2D241E]/60 backdrop-blur-md z-[60] flex items-center justify-center p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className='bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl'
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className='w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl'>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h2 className='text-3xl font-black text-[#2D241E] mb-2'>
                Дякуємо!
              </h2>
              <p className='text-gray-500 mb-6 font-medium'>
                Замовлення{' '}
                <span className='text-orange-500 font-black'>
                  {lastOrderNumber}
                </span>{' '}
                прийнято в роботу.
              </p>
              <Link
                to='/'
                className='block w-full py-4 bg-[#2D241E] text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors'
              >
                На головну
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='container mx-auto px-4 max-w-6xl'>
        <Link
          to='/cart'
          className='inline-flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-orange-500 transition-colors'
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Повернутись до кошика
        </Link>

        <div className='grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12'>
          {/* ── FORM SECTION ── */}
          <div className='space-y-8'>
            <header>
              <h1 className='text-4xl md:text-5xl font-black text-[#2D241E] tracking-tighter mb-4'>
                Оформлення <span className='text-orange-500'>замовлення</span>
              </h1>
              <div className='flex gap-2 mb-8'>
                {FORM_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx <= currentStep
                        ? 'bg-[#2D241E] w-8'
                        : 'bg-gray-100 w-4'
                    }`}
                  />
                ))}
              </div>
            </header>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-orange-50'
            >
              <div className='flex items-center gap-4 mb-10'>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${FORM_STEPS[currentStep].color}`}
                >
                  <FontAwesomeIcon icon={FORM_STEPS[currentStep].icon} />
                </div>
                <h2 className='text-2xl font-black text-[#2D241E] uppercase tracking-tight'>
                  {FORM_STEPS[currentStep].title}
                </h2>
              </div>

              <div className='space-y-6'>
                {/* STEP 0 — Контакти */}
                {currentStep === 0 && (
                  <>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                        Ваше Імʼя
                      </label>
                      <input
                        type='text'
                        value={formData.name}
                        onChange={e =>
                          handleInputChange('name', e.target.value)
                        }
                        className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold'
                        placeholder='Іван Петренко'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                        Телефон
                      </label>
                      <input
                        type='tel'
                        value={formData.phone}
                        onChange={e =>
                          handleInputChange('phone', e.target.value)
                        }
                        className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold'
                        placeholder='+380...'
                      />
                    </div>
                  </>
                )}

                {/* STEP 1 — Адреса */}
                {currentStep === 1 && (
                  <>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                        Місто
                      </label>
                      <input
                        type='text'
                        value={formData.city}
                        onChange={e =>
                          handleInputChange('city', e.target.value)
                        }
                        className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold'
                        placeholder='Місто (напр. Запоріжжя)'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                        Адреса
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={e =>
                          handleInputChange('address', e.target.value)
                        }
                        className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold h-32'
                        placeholder='Вулиця, будинок, квартира...'
                      />
                    </div>
                  </>
                )}

                {/* STEP 2 — Доставка */}
                {currentStep === 2 && (
                  <div className='space-y-4'>
                    {!isOtherCity && (
                      <button
                        type='button'
                        onClick={() =>
                          handleInputChange('deliveryType', 'courier')
                        }
                        className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                          formData.deliveryType === 'courier'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-100'
                        }`}
                      >
                        <p className='font-black text-[#2D241E]'>
                          Кур'єр по Запоріжжю
                        </p>
                        <p className='text-xs text-gray-500 mt-1 font-bold'>
                          Доставка до ваших дверей
                        </p>
                      </button>
                    )}

                    <button
                      type='button'
                      onClick={() =>
                        handleInputChange('deliveryType', 'nova_poshta')
                      }
                      className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                        formData.deliveryType === 'nova_poshta'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-100'
                      }`}
                    >
                      <p className='font-black text-[#2D241E]'>Нова Пошта</p>
                      <p className='text-xs text-gray-500 mt-1 font-bold'>
                        По всій Україні
                      </p>
                    </button>

                    {isOtherCity && (
                      <div className='p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-center'>
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className='text-blue-500 text-sm shrink-0'
                        />
                        <p className='text-[10px] font-bold text-blue-700 uppercase leading-tight'>
                          Вартість доставки Новою Поштою оплачується окремо за
                          тарифами перевізника при отриманні
                        </p>
                      </div>
                    )}

                    {formData.deliveryType === 'courier' && !isOtherCity && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='space-y-4'
                      >
                        <select
                          value={formData.district}
                          onChange={e =>
                            handleInputChange('district', e.target.value)
                          }
                          className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500'
                        >
                          <option value=''>Оберіть район...</option>
                          {zapDistricts.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} (+{d.price} грн)
                            </option>
                          ))}
                        </select>

                        <button
                          type='button'
                          onClick={() =>
                            handleInputChange('deliveryDayOption', 'Субота')
                          }
                          className={`w-full py-4 rounded-xl font-black text-xs uppercase border-2 transition-all ${
                            formData.deliveryDayOption === 'Субота'
                              ? 'bg-[#2D241E] text-white border-[#2D241E]'
                              : 'border-gray-100 text-gray-400'
                          }`}
                        >
                          Доставка у Суботу
                        </button>
                      </motion.div>
                    )}

                    {formData.deliveryType === 'nova_poshta' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='space-y-2'
                      >
                        <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                          Відділення або поштомат
                        </label>
                        <input
                          type='text'
                          value={formData.npBranch}
                          onChange={e =>
                            handleInputChange('npBranch', e.target.value)
                          }
                          className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold'
                          placeholder='№ відділення (напр. №12)'
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* STEP 3 — Оплата */}
                {currentStep === 3 && (
                  <div className='space-y-4'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2'>
                      {isOtherCity
                        ? 'Доступні методи для вашого міста'
                        : 'Оберіть спосіб оплати'}
                    </p>

                    <div className='grid gap-4'>
                      {!isOtherCity && formData.deliveryType === 'courier' && (
                        <button
                          type='button'
                          onClick={() =>
                            handleInputChange(
                              'payment',
                              'Готівкою при отриманні'
                            )
                          }
                          className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                            formData.payment === 'Готівкою при отриманні'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-100'
                          }`}
                        >
                          <div className='flex items-center gap-4'>
                            <FontAwesomeIcon
                              icon={faWallet}
                              className={
                                formData.payment === 'Готівкою при отриманні'
                                  ? 'text-orange-500'
                                  : 'text-gray-300'
                              }
                            />
                            <div>
                              <p className='font-black text-[#2D241E]'>
                                Готівкою при отриманні
                              </p>
                              <p className='text-[10px] text-gray-500 font-bold uppercase'>
                                Оплата кур'єру в Запоріжжі
                              </p>
                            </div>
                          </div>
                        </button>
                      )}

                      <button
                        type='button'
                        onClick={() =>
                          handleInputChange('payment', 'Передоплата')
                        }
                        className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                          formData.payment === 'Передоплата'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-100'
                        }`}
                      >
                        <div className='flex items-center gap-4'>
                          <FontAwesomeIcon
                            icon={faCreditCard}
                            className={
                              formData.payment === 'Передоплата'
                                ? 'text-orange-500'
                                : 'text-gray-300'
                            }
                          />
                          <div>
                            <p className='font-black text-[#2D241E]'>
                              Повна передоплата
                            </p>
                            <p className='text-[10px] text-gray-500 font-bold uppercase'>
                              Реквізити будуть надіслані в Telegram/Viber
                            </p>
                          </div>
                        </div>
                      </button>

                      {isOtherCity && (
                        <div className='p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-center'>
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className='text-blue-500 text-sm shrink-0'
                          />
                          <p className='text-[10px] font-bold text-blue-700 uppercase leading-tight'>
                            Для замовлень по Україні діє тільки повна
                            передоплата
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4 — Коментар */}
                {currentStep === 4 && (
                  <textarea
                    value={formData.wish}
                    onChange={e => handleInputChange('wish', e.target.value)}
                    className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold h-40'
                    placeholder='Ваші побажання до замовлення...'
                  />
                )}
              </div>

              {/* NAVIGATION */}
              <div className='flex justify-between mt-12 pt-8 border-t border-gray-50'>
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(s => s - 1)}
                    className='px-8 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-[#2D241E]'
                  >
                    Назад
                  </button>
                )}
                <button
                  onClick={
                    currentStep === 4 ? handlePaymentSubmit : goToNextStep
                  }
                  disabled={isSubmitting}
                  className='ml-auto px-10 py-4 bg-[#2D241E] text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl shadow-gray-100 disabled:opacity-60'
                >
                  {isSubmitting
                    ? 'Обробка...'
                    : currentStep === 4
                    ? 'Підтвердити'
                    : 'Далі'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* ── SUMMARY SIDEBAR ── */}
          <aside className='lg:sticky lg:top-24 h-fit'>
            <div className='bg-white rounded-[2.5rem] shadow-sm border border-orange-50 overflow-hidden'>
              <div className='p-8 bg-[#2D241E] text-white'>
                <div className='flex items-center gap-3 mb-1'>
                  <FontAwesomeIcon
                    icon={faShoppingBasket}
                    className='text-orange-500'
                  />
                  <h3 className='font-black uppercase tracking-widest text-xs'>
                    Ваше замовлення
                  </h3>
                </div>
                <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>
                  {cartCount} позицій
                </p>
              </div>

              <div className='p-8 space-y-6'>
                <div className='max-h-60 overflow-y-auto pr-2 space-y-4'>
                  {cartItems.map((item, i) => (
                    <div
                      key={i}
                      className='flex justify-between items-center gap-4'
                    >
                      <div className='flex items-center gap-3'>
                        <img
                          src={resolveImageSrc(item)}
                          className='w-10 h-10 rounded-lg object-cover flex-shrink-0'
                          alt={item.name}
                        />
                        <div>
                          <p className='text-xs font-black text-[#2D241E] leading-none mb-1'>
                            {item.name}
                          </p>
                          {item.filling && (
                            <p className='text-[10px] text-orange-500 font-bold mb-0.5'>
                              {item.fillingEmoji} {item.filling}
                            </p>
                          )}
                          {/* Дизайн у сайдбарі */}
                          {item.design && (
                            <p className='text-[10px] text-blue-500 font-bold mb-0.5'>
                              📸 {item.designLabel || `Дизайн №${item.design}`}
                            </p>
                          )}
                          <p className='text-[10px] text-gray-400 font-bold uppercase'>
                            {item.weight && `${item.weight} · `}
                            {item.quantity} шт · {parsePrice(item.price)} грн
                          </p>
                        </div>
                      </div>
                      <p className='text-xs font-black text-[#2D241E] shrink-0'>
                        {parsePrice(item.price) * Number(item.quantity)} грн
                      </p>
                    </div>
                  ))}
                </div>

                <div className='pt-6 border-t border-gray-50 space-y-3'>
                  <div className='flex justify-between text-xs font-bold text-gray-400 uppercase tracking-tighter'>
                    <span>Товари</span>
                    <span className='text-[#2D241E]'>{totalPrice} грн</span>
                  </div>

                  <div className='flex justify-between text-xs font-bold text-gray-400 uppercase tracking-tighter'>
                    <span>Доставка</span>
                    <span
                      className={
                        deliveryCost === 0 &&
                        formData.district &&
                        !isOtherCity &&
                        formData.deliveryType !== 'nova_poshta'
                          ? 'text-green-600'
                          : isOtherCity ||
                            formData.deliveryType === 'nova_poshta'
                          ? 'text-blue-500'
                          : 'text-[#2D241E]'
                      }
                    >
                      {deliveryCostLabel}
                    </span>
                  </div>

                  {showFreeDeliveryHint && (
                    <p className='text-[9px] font-black uppercase text-orange-500 bg-orange-50 p-2 rounded-lg text-center tracking-widest'>
                      До безкоштовної ще {FREE_DELIVERY_THRESHOLD - totalPrice}{' '}
                      грн
                    </p>
                  )}

                  <div className='pt-4 flex justify-between items-end'>
                    <span className='text-[10px] font-black uppercase text-gray-400 tracking-widest'>
                      {isOtherCity || formData.deliveryType === 'nova_poshta'
                        ? 'Сума товарів'
                        : 'Всього'}
                    </span>
                    <span className='text-3xl font-black text-[#2D241E] tracking-tighter'>
                      {totalWithDelivery}{' '}
                      <span className='text-sm text-orange-500'>грн</span>
                    </span>
                  </div>

                  {(isOtherCity || formData.deliveryType === 'nova_poshta') && (
                    <p className='text-[9px] text-blue-500 font-bold text-center'>
                      + доставка НП за тарифом перевізника
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
