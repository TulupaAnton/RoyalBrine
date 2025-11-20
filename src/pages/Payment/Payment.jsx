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

export function Payment () {
  const { cartItems, clearCart } = useCartStore()
  const totalPrice = useCartStore(state => state.totalPrice())
  const cartCount = useCartStore(state => state.cartCount())
  const formRef = useRef()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const deliveryCost = totalPrice >= 500 ? 0 : 50
  const totalWithDelivery = totalPrice + deliveryCost

  const handlePaymentSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = formRef.current
    const name = form['name'].value.trim()
    const phone = form['phone'].value.trim()
    const email = form['email'].value.trim()
    const address = form['address'].value.trim()
    const deliveryDay = form['deliveryDay'].value.trim()
    const paymentMethod = form['payment'].value

    const nameRegex = /^[А-Яа-яЁёЇїІіЄєҐґA-Za-z\s'-]{2,}$/u
    const phoneRegex = /^\+?\d{10,15}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!nameRegex.test(name)) {
      setIsSubmitting(false)
      return toast.error(
        'Ім’я має містити лише літери та бути не коротше 2 символів'
      )
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

    const orderDetails = cartItems
      .map(
        item =>
          `${item.name} (${item.weight} ) — ${item.price} x ${item.quantity}`
      )
      .join('\n')

    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: `🛒 *Нове замовлення!*\n\n👤 Ім'я: ${name}\n📞 Телефон: ${phone}\n📧 Email: ${email}\n🏠 Адреса: ${address}\n📅 День доставки: ${deliveryDay}\n💳 Спосіб оплати: ${paymentMethod}\n\n🧾 Замовлення:\n${orderDetails}\n\n💰 Сума товарів: ${totalPrice.toFixed(
            2
          )} грн\n🚚 Доставка: ${
            deliveryCost === 0 ? 'Безкоштовно' : '50 грн'
          }\n💳 Разом з доставкою: ${totalWithDelivery.toFixed(2)} грн`,
          parse_mode: 'Markdown'
        }
      )

      toast.success(
        <div>
          <p className='font-bold'>Замовлення успішно оформлено! 🎉</p>
          <p className='text-sm mt-1'>Очікуйте дзвінка для підтвердження</p>
        </div>,
        {
          duration: 5000,
          icon: (
            <FontAwesomeIcon
              icon={faCheckCircle}
              className='text-green-500 text-xl'
            />
          ),
          style: {
            borderRadius: '12px',
            background: '#f0fdf4',
            color: '#166534',
            padding: '16px 20px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }
        }
      )

      clearCart()
      form.reset()
    } catch (error) {
      toast.error(
        <div>
          <p className='font-bold'>Помилка при оформленні 😢</p>
          <p className='text-sm mt-1'>Будь ласка, спробуйте ще раз</p>
        </div>,
        {
          style: {
            borderRadius: '12px',
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '16px 20px',
            border: '1px solid #fecaca'
          }
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 py-8 md:py-12'>
      <Toaster position='top-center' />
      <div className='container mx-auto px-4'>
        <div className='max-w-5xl mx-auto'>
          <Link
            to='/cart'
            className='inline-flex items-center text-amber-700 hover:text-amber-800 font-medium transition-colors mb-6'
          >
            <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
            Повернутися до кошика
          </Link>

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
            {/* Order Summary */}
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
                          {(
                            parseFloat(
                              item.price.replace(' грн', '').replace(',', '.')
                            ) * item.quantity
                          ).toFixed(2)}{' '}
                          грн
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className='p-6 bg-amber-50 border-t border-amber-200'>
                {/* Блок с информацией о бесплатной доставке */}
                {totalPrice < 500 && (
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
                        При замовленні від 500 грн - доставка безкоштовна
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
                      {deliveryCost === 0 ? (
                        <span className='text-green-600'>Безкоштовно</span>
                      ) : (
                        '50 грн'
                      )}
                    </span>
                  </div>
                </div>
                <div className='flex justify-between items-center pt-4 border-t border-amber-200'>
                  <span className='text-lg font-semibold'>Разом:</span>
                  <span className='text-xl font-bold text-amber-700'>
                    {totalWithDelivery.toFixed(2)} грн
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Payment Form */}
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
                  Дані для оплати
                </h2>
              </div>

              <form
                ref={formRef}
                onSubmit={handlePaymentSubmit}
                className='p-6'
              >
                <div className='space-y-6'>
                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Ім’я та прізвище *
                    </label>
                    <input
                      type='text'
                      name='name'
                      required
                      placeholder="Введіть ваше ім'я"
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition'
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Номер телефону *
                    </label>
                    <input
                      type='tel'
                      name='phone'
                      required
                      placeholder='+380XXXXXXXXX'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition'
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Email *
                    </label>
                    <input
                      type='email'
                      name='email'
                      required
                      placeholder='your@email.com'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition'
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Адреса доставки *
                    </label>
                    <textarea
                      name='address'
                      rows='3'
                      required
                      placeholder='Введіть повну адресу доставки'
                      className='w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition'
                    ></textarea>
                  </div>

                  <div>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Оберіть день доставки *
                    </label>
                    <div className='grid grid-cols-2 gap-3'>
                      <label className='flex items-center space-x-3 p-3 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors'>
                        <input
                          type='radio'
                          name='deliveryDay'
                          value='Середа'
                          required
                          className='h-5 w-5 text-amber-600 focus:ring-amber-500'
                        />
                        <div>
                          <span className='font-medium'>Середа</span>
                          <p className='text-sm text-gray-500'>10:00 - 20:00</p>
                        </div>
                      </label>
                      <label className='flex items-center space-x-3 p-3 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors'>
                        <input
                          type='radio'
                          name='deliveryDay'
                          value='Субота'
                          className='h-5 w-5 text-amber-600 focus:ring-amber-500'
                        />
                        <div>
                          <span className='font-medium'>Субота</span>
                          <p className='text-sm text-gray-500'>10:00 - 20:00</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className='border-t border-amber-200 pt-6'>
                    <h3 className='text-lg font-medium text-gray-800 mb-4 flex items-center'>
                      <FontAwesomeIcon
                        icon={faWallet}
                        className='mr-2 text-amber-600'
                      />
                      Спосіб оплати
                    </h3>
                    <div className='space-y-3'>
                      <label className='flex items-start space-x-3 p-3 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors'>
                        <input
                          type='radio'
                          name='payment'
                          value='Готівкою при отриманні'
                          defaultChecked
                          className='h-5 w-5 mt-1 text-amber-600 focus:ring-amber-500'
                        />
                        <div>
                          <span className='font-medium'>
                            Готівкою при отриманні
                          </span>
                          <p className='text-sm text-gray-500 mt-1'>
                            Оплата кур'єру при отриманні замовлення
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className='pt-4'>
                    <button
                      type='submit'
                      disabled={isSubmitting || cartItems.length === 0}
                      className={`w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all ${
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

                <div className='mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200'>
                  <div className='flex items-start'>
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className='text-amber-600 mt-1 mr-3 flex-shrink-0'
                    />
                    <div>
                      <p className='text-sm text-gray-700'>
                        Якщо вас не влаштовує жоден з днів доставки, будь ласка,
                        зателефонуйте до нашої служби підтримки за номером{' '}
                        <a
                          href='tel:+380993523868'
                          className='text-amber-700 hover:underline font-medium'
                        >
                          +38 (099) 352 38 68
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className='mt-8 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5'
          >
            <p className='text-gray-700 text-center text-sm'>
              Натискаючи "Підтвердити замовлення", ви погоджуєтесь з нашими{' '}
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
                Правилами та умовами повернення коштів
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
