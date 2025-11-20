import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faArrowLeft,
  faShoppingBag,
  faCircleXmark,
  faBroom
} from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '../../store/cartStore'
import zaglushka from '../../assets/zaglushka.jpg'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export function CartPage () {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getGroupedItems
  } = useCartStore()

  const totalPrice = useCartStore(state => state.totalPrice())
  const cartCount = useCartStore(state => state.cartCount())

  // Используем сгруппированные товары
  const groupedItems = getGroupedItems()

  const handleClearCart = () => {
    clearCart()
    toast('Кошик повністю очищено', {
      icon: <FontAwesomeIcon icon={faBroom} className='text-green-600' />,
      duration: 3000,
      style: {
        borderRadius: '12px',
        background: '#fff',
        color: '#000',
        padding: '12px 16px',
        border: '1px solid #22c55e'
      }
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  // Функция для генерации уникального ключа (такая же как в store)
  const generateItemKey = item => {
    return `${item.id}-${item.price}-${item.weight || ''}`
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 py-12'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-4xl mx-auto'
        >
          <div className='flex items-center mb-8'>
            <div className='bg-amber-500 p-3 rounded-full mr-4'>
              <FontAwesomeIcon
                icon={faShoppingBag}
                className='text-white text-xl'
              />
            </div>
            <h1 className='text-3xl font-bold text-gray-800'>Ваш кошик</h1>
            {cartCount > 0 && (
              <span className='ml-3 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full'>
                {groupedItems.length}{' '}
                {groupedItems.length === 1
                  ? 'товар'
                  : groupedItems.length < 5
                  ? 'товари'
                  : 'товарів'}
              </span>
            )}
          </div>

          {cartCount === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className='text-center py-12 bg-white rounded-xl shadow-sm'
            >
              <div className='mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6'>
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className='text-amber-500 text-3xl'
                />
              </div>
              <h2 className='text-xl font-medium text-gray-700 mb-4'>
                Ваш кошик порожній
              </h2>
              <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                Додайте товари з нашого каталогу, щоб продовжити покупки
              </p>
              <Link
                to='/'
                className='inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg'
              >
                Перейти на головну
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial='hidden'
              animate='show'
              className='bg-white rounded-xl shadow-lg overflow-hidden divide-y divide-amber-100'
            >
              {groupedItems.map(item => (
                <motion.div
                  key={generateItemKey(item)}
                  variants={itemAnimation}
                  className='p-6 hover:bg-amber-50 transition-colors duration-200'
                >
                  <div className='flex flex-col md:flex-row md:items-center'>
                    <div className='flex-shrink-0 mb-4 md:mb-0 md:mr-6 w-24 h-24 relative'>
                      <motion.img
                        src={
                          item.images?.[0]
                            ? new URL(
                                `../../assets/products/${item.images[0]}`,
                                import.meta.url
                              ).href
                            : zaglushka
                        }
                        className='w-24 h-24 object-cover rounded-lg flex-shrink-0'
                      />

                      <motion.button
                        onClick={() => {
                          removeFromCart(
                            item.id,
                            item.category,
                            item.price,
                            item.weight
                          )
                          toast(`${item.name} видалено з кошика`, {
                            icon: (
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className='text-red-500'
                              />
                            ),
                            duration: 3000,
                            style: {
                              borderRadius: '12px',
                              background: '#fff',
                              color: '#000',
                              padding: '12px 16px',
                              border: '1px solid #f87171'
                            }
                          })
                        }}
                        className='absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors'
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FontAwesomeIcon icon={faTrash} className='text-xs' />
                      </motion.button>
                    </div>
                    <div className='flex-grow'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-800 mb-1'>
                            {item.name}
                          </h3>
                          <div className='flex items-center space-x-2'>
                            <p className='text-amber-600 font-medium'>
                              {item.price}
                            </p>
                            {item.weight && (
                              <span className='text-gray-500 text-sm'>
                                ({item.weight})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center mt-4'>
                        <motion.button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.category,
                              item.quantity - 1,
                              item.price,
                              item.weight
                            )
                          }
                          className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100 disabled:opacity-50'
                          disabled={item.quantity <= 1}
                          whileTap={{ scale: 0.9 }}
                        >
                          -
                        </motion.button>
                        <span className='w-12 h-8 flex items-center justify-center border-t border-b border-gray-300 bg-gray-50'>
                          {item.quantity}
                        </span>
                        <motion.button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.category,
                              item.quantity + 1,
                              item.price,
                              item.weight
                            )
                          }
                          className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100'
                          whileTap={{ scale: 0.9 }}
                        >
                          +
                        </motion.button>
                        <span className='ml-auto font-medium text-gray-700'>
                          {(
                            parseFloat(
                              item.price.replace(' грн', '').replace(',', '.')
                            ) * item.quantity
                          ).toFixed(2)}{' '}
                          грн
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className='p-6 bg-gradient-to-r from-amber-50 to-amber-100'>
                <div className='flex justify-between items-center mb-6'>
                  <span className='text-lg font-semibold text-gray-800'>
                    Разом:
                  </span>
                  <span className='text-2xl font-bold text-amber-600'>
                    {totalPrice.toFixed(2)} грн
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <motion.button
                    onClick={handleClearCart}
                    className='w-full py-3 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Очистити кошик</span>
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to='/payment'
                      className='block w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all text-center shadow-md hover:shadow-lg'
                    >
                      Оформити замовлення
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
