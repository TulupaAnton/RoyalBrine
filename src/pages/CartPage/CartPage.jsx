import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faArrowLeft,
  faShoppingBag,
  faCircleXmark,
  faBroom,
  faGift,
  faTree,
  faSnowflake,
  faStar
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
    toast('🎄 Кошик повністю очищено', {
      icon: <FontAwesomeIcon icon={faBroom} className='text-green-600' />,
      duration: 3000,
      style: {
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #16a34a 0%, #dc2626 100%)',
        color: 'white',
        padding: '12px 16px'
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

  // Новогодние снежинки для фона
  const snowflakes = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 3,
    delay: Math.random() * 3
  }))

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-red-50 to-amber-50 py-12 relative overflow-hidden'>
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

      <div className='container mx-auto px-4 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-4xl mx-auto'
        >
          {/* Новогодний заголовок */}
          <div className='flex items-center mb-8'>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className='bg-gradient-to-r from-red-500 to-yellow-500 p-3 rounded-full mr-4 shadow-lg'
            >
              <FontAwesomeIcon icon={faGift} className='text-white text-xl' />
            </motion.div>
            <h1 className='text-3xl font-bold text-gray-800 font-serif'>
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-green-500'>
                Ваш новорічний кошик
              </span>
            </h1>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className='ml-3 bg-gradient-to-r from-red-500 to-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg'
              >
                {groupedItems.length}{' '}
                {groupedItems.length === 1
                  ? 'подарунок'
                  : groupedItems.length < 5
                  ? 'подарунки'
                  : 'подарунків'}
              </motion.span>
            )}
          </div>

          {/* Новогодний баннер */}

          {cartCount === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className='text-center py-16 bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-xl border border-white/30'
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className='mx-auto w-32 h-32 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg'
              >
                <FontAwesomeIcon
                  icon={faGift}
                  className='text-white text-5xl'
                />
              </motion.div>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>
                Ваш новорічний кошик порожній 🎄
              </h2>
              <p className='text-gray-600 mb-8 max-w-md mx-auto text-lg'>
                Додайте святкові страви з нашого каталогу, щоб почати готувати
                новорічне свято!
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to='/'
                    className='inline-block px-8 py-3 bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center'
                  >
                    <FontAwesomeIcon icon={faTree} className='mr-3' />
                    На новорічну головну
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to='/catalog/semi-finished'
                    className='inline-block px-8 py-3 border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-all'
                  >
                    <FontAwesomeIcon icon={faGift} className='mr-3' />
                    До новорічних товарів
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial='hidden'
              animate='show'
              className='bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl overflow-hidden border-2 border-white/30'
            >
              {groupedItems.map(item => (
                <motion.div
                  key={generateItemKey(item)}
                  variants={itemAnimation}
                  className='p-6 hover:bg-white/50 transition-colors duration-200 border-b border-white/30'
                >
                  <div className='flex flex-col md:flex-row md:items-center'>
                    <div className='flex-shrink-0 mb-4 md:mb-0 md:mr-6 w-28 h-28 relative'>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className='relative'
                      >
                        <img
                          src={
                            item.images?.[0]
                              ? new URL(
                                  `../../assets/products/${item.images[0]}`,
                                  import.meta.url
                                ).href
                              : zaglushka
                          }
                          className='w-28 h-28 object-cover rounded-xl shadow-lg flex-shrink-0 border-2 border-white/50'
                          alt={item.name}
                        />
                        {/* Новогодний декор на изображении */}
                      </motion.div>

                      <motion.button
                        onClick={() => {
                          removeFromCart(
                            item.id,
                            item.category,
                            item.price,
                            item.weight
                          )
                          toast(`🎁 ${item.name} видалено з кошика`, {
                            icon: (
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className='text-white'
                              />
                            ),
                            duration: 3000,
                            style: {
                              borderRadius: '12px',
                              background:
                                'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
                              color: 'white',
                              padding: '12px 16px'
                            }
                          })
                        }}
                        className='absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full p-2 shadow-xl hover:shadow-2xl transition-all'
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FontAwesomeIcon icon={faTrash} className='text-sm' />
                      </motion.button>
                    </div>
                    <div className='flex-grow'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <h3 className='text-xl font-bold text-gray-800 mb-2 hover:text-red-600 transition-colors'>
                            {item.name}
                          </h3>
                          <div className='flex items-center space-x-3'>
                            <p className='text-2xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent'>
                              {item.price}
                            </p>
                            {item.weight && (
                              <span className='text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium'>
                                {item.weight}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center mt-6'>
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
                          className='w-10 h-10 flex items-center justify-center border-2 border-red-300 rounded-l-xl bg-white hover:bg-red-50 disabled:opacity-50 font-bold text-lg'
                          disabled={item.quantity <= 1}
                          whileTap={{ scale: 0.9 }}
                        >
                          -
                        </motion.button>
                        <span className='w-14 h-10 flex items-center justify-center border-t-2 border-b-2 border-yellow-300 bg-yellow-50 font-bold text-lg'>
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
                          className='w-10 h-10 flex items-center justify-center border-2 border-green-300 rounded-r-xl bg-white hover:bg-green-50 font-bold text-lg'
                          whileTap={{ scale: 0.9 }}
                        >
                          +
                        </motion.button>
                        <div className='ml-auto text-right'>
                          <p className='text-sm text-gray-600'>Разом:</p>
                          <p className='text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                            {(
                              parseFloat(
                                item.price.replace(' грн', '').replace(',', '.')
                              ) * item.quantity
                            ).toFixed(2)}{' '}
                            грн
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Итоговая секция */}
              <div className='p-6 bg-gradient-to-r from-red-50 via-amber-50 to-green-50'>
                <div className='flex justify-between items-center mb-8'>
                  <div>
                    <span className='text-lg font-semibold text-gray-800 block mb-2'>
                      Загальна сума:
                    </span>
                    <div className='flex items-center'>
                      <FontAwesomeIcon
                        icon={faGift}
                        className='text-red-500 mr-2'
                      />
                    </div>
                  </div>
                  <div className='text-right'>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent'
                    >
                      {totalPrice.toFixed(2)} грн
                    </motion.span>
                    {totalPrice >= 800 && (
                      <p className='text-sm text-green-600 font-bold mt-2 flex items-center justify-end'>
                        <FontAwesomeIcon icon={faStar} className='mr-1' />
                        Доставка безкоштовна! 🎁
                      </p>
                    )}
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <motion.button
                    onClick={handleClearCart}
                    className='w-full py-4 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Очистити новорічний кошик</span>
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='relative overflow-hidden rounded-xl'
                  >
                    {/* Блестящий эффект */}
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-600'></div>

                    <Link
                      to='/payment'
                      className='block w-full py-4 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 hover:from-red-700 hover:via-yellow-600 hover:to-green-700 text-white font-bold rounded-xl transition-all text-center shadow-xl hover:shadow-2xl relative z-10'
                    >
                      <div className='flex items-center justify-center space-x-3'>
                        <FontAwesomeIcon icon={faGift} />
                        <span>Оформити новорічне замовлення</span>
                        <FontAwesomeIcon icon={faTree} />
                      </div>
                    </Link>
                  </motion.div>
                </div>

                {/* Новогоднее сообщение */}
                <div className='mt-6 p-4 bg-gradient-to-r from-white/80 to-white/50 backdrop-blur-sm rounded-xl border border-white/30'>
                  <p className='text-center text-gray-700'>
                    <FontAwesomeIcon
                      icon={faSnowflake}
                      className='text-blue-400 mr-2'
                    />
                    Ваше замовлення буде приготоване з особливою новорічною
                    турботою!
                    <FontAwesomeIcon
                      icon={faStar}
                      className='text-yellow-400 ml-2'
                    />
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Кнопка возврата для пустой корзины */}
          {cartCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className='mt-8 text-center'
            >
              <Link
                to='/'
                className='inline-flex items-center text-red-600 hover:text-red-500 font-medium px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg border border-white/30'
              >
                <FontAwesomeIcon icon={faArrowLeft} className='mr-3' />
                <span>Повернутись до новорічних покупок</span>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
