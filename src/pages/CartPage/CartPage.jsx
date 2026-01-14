import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faArrowLeft,
  faShoppingBasket,
  faCircleXmark,
  faBroom,
  faHeart,
  faUtensils,
  faTruckFast
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

  const groupedItems = getGroupedItems()

  const handleClearCart = () => {
    clearCart()
    toast('🧺 Кошик очищено', {
      icon: <FontAwesomeIcon icon={faBroom} className='text-[#2D241E]' />,
      duration: 3000,
      style: {
        borderRadius: '16px',
        background: '#FDFCFB',
        color: '#2D241E',
        border: '1px solid #FFEDD5',
        padding: '12px 16px'
      }
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemAnimation = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  const generateItemKey = item =>
    `${item.id}-${item.price}-${item.weight || ''}`

  return (
    <div className='min-h-screen bg-[#FDFCFB] py-12 relative overflow-hidden'>
      {/* Мягкие фоновые пятна */}
      <div className='absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[100px]' />
      <div className='absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-green-50/40 rounded-full blur-[100px]' />

      <div className='container mx-auto px-4 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='max-w-4xl mx-auto'
        >
          {/* Заголовок */}
          <div className='flex items-center justify-between mb-10'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-[#2D241E] rounded-2xl flex items-center justify-center text-white shadow-lg'>
                <FontAwesomeIcon icon={faShoppingBasket} />
              </div>
              <div>
                <h1 className='text-3xl font-black text-[#2D241E] tracking-tight'>
                  Ваш <span className='text-orange-500'>кошик</span>
                </h1>
                <p className='text-xs font-black uppercase tracking-[0.2em] text-gray-400'>
                  Домашня кулінарія
                </p>
              </div>
            </div>

            {cartCount > 0 && (
              <div className='hidden sm:block px-4 py-2 bg-white border border-orange-100 rounded-full shadow-sm'>
                <span className='text-sm font-bold text-gray-500'>
                  {groupedItems.length} позицій у списку
                </span>
              </div>
            )}
          </div>

          {cartCount === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-orange-50'
            >
              <div className='w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                <FontAwesomeIcon
                  icon={faUtensils}
                  className='text-orange-200 text-4xl'
                />
              </div>
              <h2 className='text-2xl font-black text-[#2D241E] mb-3'>
                У кошику поки порожньо
              </h2>
              <p className='text-gray-500 mb-10 max-w-sm mx-auto font-medium'>
                Здається, ви ще не обрали нічого смачного. Перейдіть до
                каталогу, щоб знайти улюблені страви.
              </p>
              <Link
                to='/'
                className='inline-flex items-center gap-3 px-10 py-4 bg-[#2D241E] text-white font-black rounded-2xl shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-xs'
              >
                <FontAwesomeIcon icon={faArrowLeft} className='text-[10px]' />
                До меню
              </Link>
            </motion.div>
          ) : (
            <div className='space-y-6'>
              <motion.div
                variants={container}
                initial='hidden'
                animate='show'
                className='bg-white rounded-[2.5rem] shadow-sm border border-orange-50 overflow-hidden'
              >
                {groupedItems.map(item => (
                  <motion.div
                    key={generateItemKey(item)}
                    variants={itemAnimation}
                    className='p-6 md:p-8 border-b border-gray-50 last:border-none group'
                  >
                    <div className='flex flex-col md:flex-row gap-6 md:items-center'>
                      {/* Изображение */}
                      <div className='relative w-full md:w-32 h-32 flex-shrink-0'>
                        <img
                          src={
                            item.images?.[0]
                              ? new URL(
                                  `../../assets/products/${item.images[0]}`,
                                  import.meta.url
                                ).href
                              : zaglushka
                          }
                          className='w-full h-full object-cover rounded-2xl border border-gray-100'
                          alt={item.name}
                        />
                        <button
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.category,
                              item.price,
                              item.weight
                            )
                          }
                          className='absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-50'
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className='text-[10px]'
                          />
                        </button>
                      </div>

                      {/* Инфо */}
                      <div className='flex-grow'>
                        <div className='flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-4'>
                          <div>
                            <h3 className='text-xl font-black text-[#2D241E] mb-1'>
                              {item.name}
                            </h3>
                            <span className='inline-block px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-lg'>
                              {item.weight || 'Стандарт'}
                            </span>
                          </div>
                          <div className='text-left md:text-right'>
                            <p className='text-sm text-gray-400 font-bold uppercase tracking-tighter'>
                              Ціна за од.
                            </p>
                            <p className='text-lg font-black text-[#2D241E]'>
                              {item.price}
                            </p>
                          </div>
                        </div>

                        {/* Управление количеством */}
                        <div className='flex items-center justify-between mt-auto'>
                          <div className='flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100'>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.category,
                                  item.quantity - 1,
                                  item.price,
                                  item.weight
                                )
                              }
                              className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#2D241E] font-black transition-all disabled:opacity-30'
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className='w-10 text-center font-black text-sm'>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.category,
                                  item.quantity + 1,
                                  item.price,
                                  item.weight
                                )
                              }
                              className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#2D241E] font-black transition-all'
                            >
                              +
                            </button>
                          </div>

                          <div className='text-right'>
                            <p className='text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1'>
                              Разом
                            </p>
                            <p className='text-xl font-black text-orange-600'>
                              {(
                                parseFloat(item.price.replace(/[^\d.]/g, '')) *
                                item.quantity
                              ).toFixed(0)}{' '}
                              грн
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Итоговая панель */}
                <div className='bg-gray-50/50 p-8 md:p-10 border-t border-orange-50'>
                  <div className='flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10'>
                    <div>
                      <p className='text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2'>
                        Сума до сплати
                      </p>
                      <h2 className='text-5xl font-black text-[#2D241E] tracking-tight'>
                        {totalPrice.toFixed(0)}{' '}
                        <span className='text-2xl text-orange-500'>грн</span>
                      </h2>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <button
                      onClick={handleClearCart}
                      className='py-5 border-2 border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 bg-white'
                    >
                      <FontAwesomeIcon icon={faTrash} className='text-[10px]' />
                      Очистити
                    </button>

                    <Link
                      to='/payment'
                      className='py-5 bg-[#2D241E] text-white hover:bg-orange-600 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200'
                    >
                      <span>Оформити замовлення</span>
                      <FontAwesomeIcon
                        icon={faArrowLeft}
                        className='text-[10px] rotate-180'
                      />
                    </Link>
                  </div>
                </div>
              </motion.div>

              <div className='text-center'>
                <Link
                  to='/'
                  className='inline-flex items-center gap-2 text-gray-400 hover:text-[#2D241E] font-black text-[10px] uppercase tracking-widest transition-colors'
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Повернутися до покупок
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
