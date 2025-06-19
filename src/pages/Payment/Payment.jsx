import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.png'
import { useCartStore } from '../../store/cartStore'
import axios from 'axios'
import { toast } from 'react-toastify'

// ⬇️ витягуємо дані з .env
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

export function Payment () {
  const { cartItems, clearCart } = useCartStore()
  const totalPrice = useCartStore(state => state.totalPrice())
  const cartCount = useCartStore(state => state.cartCount())

  const formRef = useRef()

  const handlePaymentSubmit = async e => {
    e.preventDefault()

    const form = formRef.current
    const name = form['name'].value
    const phone = form['phone'].value
    const email = form['email'].value
    const address = form['address'].value

    const orderDetails = cartItems
      .map(
        item =>
          `${item.name} (${item.quantity} шт.) — ${item.price} x ${item.quantity}`
      )
      .join('\n')

    const total = `${totalPrice.toFixed(2)} грн`

    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: `🛒 *Нове замовлення!*\n\n👤 Ім'я: ${name}\n📞 Телефон: ${phone}\n📧 Email: ${email}\n🏠 Адреса: ${address}\n\n🧾 Замовлення:\n${orderDetails}\n\n💰 Всього: ${total}`,
          parse_mode: 'Markdown'
        }
      )
    } catch (error) {
      toast.error('Помилка при відправці в Telegram 😢')
      return
    }

    toast.success('Замовлення успішно оформлено! 🎉')
    clearCart()
    form.reset()
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white py-12'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <Link
            to='/cart'
            className='inline-flex items-center text-amber-600 hover:underline mb-8'
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
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              Оформлення замовлення
            </h1>
            <div className='w-20 h-1 bg-amber-500 rounded-full'></div>
          </motion.div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='bg-white rounded-xl shadow-lg overflow-hidden'
            >
              <div className='p-6 bg-amber-50 border-b border-amber-100'>
                <h2 className='text-xl font-semibold text-gray-800'>
                  Ваше замовлення ({cartCount})
                </h2>
              </div>

              <div className='divide-y divide-gray-200 max-h-96 overflow-y-auto'>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={`${item.category}-${item.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className='p-4'
                  >
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 mr-4 w-16 h-16'>
                        <img
                          src={
                            item.image
                              ? new URL(
                                  `../../assets/products/${item.image}`,
                                  import.meta.url
                                ).href
                              : zaglushka
                          }
                          alt={item.name}
                          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                          onError={e => {
                            e.target.src = zaglushka
                          }}
                        />
                      </div>
                      <div className='flex-grow'>
                        <h3 className='font-medium text-gray-800'>
                          {item.name}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {item.price} × {item.quantity}
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
                ))}
              </div>

              <div className='p-6 bg-gray-50 border-t border-gray-200'>
                <div className='space-y-3 mb-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Проміжний підсумок:</span>
                    <span className='font-medium'>
                      {totalPrice.toFixed(2)} грн
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Доставка:</span>
                    <span className='font-medium'>Безкоштовно</span>
                  </div>
                </div>
                <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                  <span className='text-lg font-semibold'>Разом:</span>
                  <span className='text-xl font-bold text-amber-600'>
                    {totalPrice.toFixed(2)} грн
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='bg-white rounded-xl shadow-lg overflow-hidden'
            >
              <div className='p-6 bg-amber-50 border-b border-amber-100'>
                <h2 className='text-xl font-semibold text-gray-800'>
                  Дані для оплати
                </h2>
              </div>

              <form
                ref={formRef}
                onSubmit={handlePaymentSubmit}
                className='p-6'
              >
                <div className='space-y-5'>
                  <div>
                    <label className='block text-gray-700 mb-2'>
                      Ім’я та прізвище
                    </label>
                    <input
                      type='text'
                      name='name'
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg'
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 mb-2'>
                      Номер телефону
                    </label>
                    <input
                      type='tel'
                      name='phone'
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg'
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 mb-2'>Email</label>
                    <input
                      type='email'
                      name='email'
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg'
                    />
                  </div>

                  <div>
                    <label className='block text-gray-700 mb-2'>
                      Адреса доставки
                    </label>
                    <textarea
                      name='address'
                      rows='3'
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg'
                    ></textarea>
                  </div>

                  <div className='border-t border-gray-200 pt-4'>
                    <h3 className='text-lg font-medium text-gray-800 mb-4'>
                      Спосіб оплати
                    </h3>
                    <label className='flex items-center space-x-3 cursor-pointer'>
                      <input
                        type='radio'
                        name='payment'
                        defaultChecked
                        className='h-5 w-5 text-amber-500 border-gray-300'
                      />
                      <span>Оплата при отриманні</span>
                    </label>
                  </div>

                  <div className='pt-4'>
                    <button
                      type='submit'
                      className='w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg flex items-center justify-center space-x-2'
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Підтвердити замовлення</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className='mt-8 bg-amber-50 border border-amber-100 rounded-lg p-4'
          >
            <p className='text-gray-700 text-center'>
              Натискаючи "Підтвердити замовлення", ви погоджуєтесь з нашими{' '}
              <Link to='/Terms' className='text-amber-600 hover:underline'>
                умовами використання
              </Link>{' '}
              та{' '}
              <Link to='/Privacy' className='text-amber-600 hover:underline'>
                політикою конфіденційності
              </Link>{' '}
              а також{' '}
              <Link to='/Refund' className='text-amber-600 hover:underline'>
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
