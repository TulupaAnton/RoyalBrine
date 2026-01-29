import React, { useState, useEffect, useMemo, memo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { database } from '../../lib/productSuperbase'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSearch,
  faChevronLeft,
  faChevronRight,
  faCartPlus,
  faUtensils,
  faFish,
  faDrumstickBite,
  faBoxOpen,
  faSeedling,
  faLeaf,
  faClose,
  faEye,
  faInfoCircle,
  faGlassCheers,
  faPaperPlane,
  faClipboardList,
  faCheckCircle,
  faUser,
  faPhone
} from '@fortawesome/free-solid-svg-icons'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

/* ===== CONFIGURATION ===== */
const categoryNames = {
  pickles: 'Домашні Соління',
  fish: 'Рибні Делікатеси',
  meats: 'Мʼясні Вироби',
  cooking: 'Домашня Кулінарія',
  'semi-finished': 'Напівфабрикати',
  buffet: 'Фуршетне Меню'
}

const subcategoryConfig = {
  pickles: [
    { id: 'all', label: 'Усі', icon: faUtensils },
    { id: 'cucumber', label: 'Огірки', icon: faSeedling },
    { id: 'tomato', label: 'Помідори', icon: faLeaf },
    { id: 'carrot', label: 'Морква', icon: faBoxOpen },
    { id: 'cabbage', label: 'Капуста', icon: faLeaf },
    { id: 'mushrooms', label: 'Гриби', icon: faBoxOpen },
    { id: 'eggplant', label: 'Баклажани', icon: faBoxOpen },
    { id: 'beet', label: 'Буряк', icon: faBoxOpen },
    { id: 'other', label: 'Інше', icon: faBoxOpen }
  ],
  fish: [
    { id: 'all', label: 'Усі', icon: faFish },
    { id: 'salted', label: 'Солона', icon: faFish },
    { id: 'smoked', label: 'Копчена', icon: faFish }
  ],
  meats: [
    { id: 'all', label: 'Усі', icon: faDrumstickBite },
    { id: 'smoked', label: 'Копчення', icon: faDrumstickBite },
    { id: 'fried', label: 'Смажене', icon: faUtensils },
    { id: 'salo', label: 'Солоне мʼясо', icon: faUtensils }
  ]
  // buffet: [
  //   { id: 'all', label: 'Все меню', icon: faGlassCheers },
  //   { id: 'box', label: 'Бокси', icon: faBoxOpen },
  //   { id: 'set', label: 'Сети', icon: faUtensils }
  // ]
}

/* ===== SUB-COMPONENTS ===== */

const ProductCard = memo(({ product, category, onAddToCart }) => {
  const imageUrl = useMemo(() => {
    if (!product.images?.[0]) return zaglushka
    return new URL(
      `../../assets/products/${product.images[0]}`,
      import.meta.url
    ).href
  }, [product.images])

  return (
    <article className='bg-white rounded-[2rem] p-2 shadow-sm border border-gray-100 flex flex-col h-full group transition-all duration-300 hover:shadow-lg'>
      <Link
        to={`/product/${category}/${product.id}`}
        className='relative aspect-square overflow-hidden rounded-[1.7rem] mb-3 flex-shrink-0 bg-gray-50'
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading='lazy'
          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
        />
      </Link>
      <div className='flex flex-col flex-grow px-2 pb-2'>
        <h3 className='text-gray-900 font-bold text-[13px] md:text-base mb-2 line-clamp-2 min-h-[2.5rem]'>
          {product.name}
        </h3>
        <Link
          to={`/product/${category}/${product.id}`}
          className='mb-3 py-2 w-full bg-orange-50/50 rounded-xl text-orange-600 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 active:bg-orange-100 transition-colors'
        >
          <FontAwesomeIcon icon={faEye} /> Детальніше
        </Link>
        <div className='mt-auto pt-2 border-t border-gray-50 flex items-center justify-between'>
          <span className='text-lg font-black text-gray-900'>
            {product.price} грн
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className='h-10 px-4 rounded-xl bg-gray-900 text-white shadow-md hover:bg-orange-600 transition-all active:scale-95'
          >
            <FontAwesomeIcon icon={faCartPlus} />
          </button>
        </div>
      </div>
    </article>
  )
})

const BuffetCard = memo(
  ({ product, isSelected, onOpenInfo, onToggleSelection }) => {
    const mainImageUrl = useMemo(() => {
      if (product.images?.[0]) {
        return new URL(
          `../../assets/products/${product.images[0]}`,
          import.meta.url
        ).href
      }
      return zaglushka
    }, [product.images])

    return (
      <article className='bg-white rounded-[2.5rem] p-3 shadow-sm border border-gray-100 flex flex-col h-full transition-all duration-300 hover:shadow-xl group'>
        <div className='relative aspect-[4/3] overflow-hidden rounded-[2rem] mb-4 bg-gray-50'>
          <img
            src={mainImageUrl}
            alt={product.name}
            loading='lazy'
            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
          />
        </div>
        <div className='flex flex-col flex-grow px-2'>
          <h3 className='text-lg font-black text-[#2D241E] leading-tight mb-2'>
            {product.name}
          </h3>
          <button
            onClick={() => onOpenInfo(product)}
            className='flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 hover:translate-x-1 transition-transform'
          >
            <FontAwesomeIcon icon={faInfoCircle} /> Що всередині?
          </button>
          <div className='mt-auto pt-4 border-t border-gray-50 flex items-center justify-between'>
            <span className='text-xl font-black text-[#2D241E]'>
              {product.price} грн
            </span>
            <button
              onClick={() => onToggleSelection(product)}
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                isSelected
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-[#2D241E] text-white hover:bg-orange-600'
              }`}
            >
              {isSelected ? 'Додано' : 'Додати'}
            </button>
          </div>
        </div>
      </article>
    )
  }
)

/* ===== MAIN CATALOG ===== */
export function Catalog () {
  const { category } = useParams()
  const isBuffet = category === 'buffet'

  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSubFilter, setActiveSubFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const [selectedBuffetItems, setSelectedBuffetItems] = useState([])
  const [infoProduct, setInfoProduct] = useState(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userContact, setUserContact] = useState({ name: '', phone: '' })

  const { addToCart } = useCartStore()
  const searchInputRef = useRef(null)

  useEffect(() => {
    setActiveSubFilter('all')
    const load = async () => {
      setLoading(true)
      const { data } = await database
        .from('products')
        .select('*')
        .eq('category', category)
        .order('id', { ascending: true })
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [category])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesSub =
        activeSubFilter === 'all' ||
        p.subcategory === activeSubFilter ||
        p.meat_type === activeSubFilter
      return matchesSearch && matchesSub
    })
  }, [products, searchTerm, activeSubFilter])

  const handleOpenInfo = product => {
    setInfoProduct(product)
    setCurrentPhotoIndex(0)
  }

  const toggleBuffetSelection = product => {
    setSelectedBuffetItems(prev =>
      prev.find(i => i.id === product.id)
        ? prev.filter(i => i.id !== product.id)
        : [...prev, product]
    )
  }

  const handleBuffetSubmit = async e => {
    e.preventDefault()
    if (!userContact.name || !userContact.phone)
      return toast.error('Заповніть контакти')
    setIsSubmitting(true)
    const itemsList = selectedBuffetItems
      .map(item => `▫️ ${item.name} (${item.price} ₴)`)
      .join('\n')
    const message = `🥂 *НОВИЙ ЗАПИТ НА ФУРШЕТ*\n\n👤 Клієнт: ${userContact.name}\n📞 Тел: ${userContact.phone}\n\n📋 Обрані позиції:\n${itemsList}`
    try {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }
      )
      setIsSuccess(true)
      setSelectedBuffetItems([])
      setTimeout(() => {
        setShowCheckoutModal(false)
        setIsSuccess(false)
        setUserContact({ name: '', phone: '' })
      }, 3000)
    } catch (err) {
      toast.error('Помилка відправки.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#FDFCFB] text-[#2D241E] pb-32'>
      <Toaster position='top-center' />
      <header className='sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-xl border-b border-gray-100'>
        <div className='container mx-auto px-4 pt-6 pb-2'>
          <div className='flex items-center gap-4 mb-5'>
            <Link
              to='/'
              className='w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-gray-100 rounded-full text-gray-800'
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Link>
            <h1 className='text-xl font-black tracking-tight'>
              {categoryNames[category]}
            </h1>
          </div>
          <div className='relative mb-4'>
            <FontAwesomeIcon
              icon={faSearch}
              className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-300'
            />
            <input
              ref={searchInputRef}
              type='text'
              placeholder='Пошук по меню...'
              className='w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:border-orange-200'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {subcategoryConfig[category] && (
            <div className='flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4'>
              {subcategoryConfig[category].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveSubFilter(f.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${
                    activeSubFilter === f.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-400 border border-gray-100'
                  }`}
                >
                  <FontAwesomeIcon icon={f.icon} className='text-[10px]' />{' '}
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className='container mx-auto px-4 py-6'>
        <div className='flex flex-col lg:flex-row gap-8'>
          <div className='flex-grow'>
            {isBuffet && (
              <div className='bg-orange-50 border border-orange-100 p-6 rounded-[2rem] mb-8'>
                <h2 className='text-lg font-black text-orange-900 mb-2 uppercase tracking-tight'>
                  Створіть свій ідеальний фуршет
                </h2>
                <p className='text-sm text-orange-800/70 font-medium leading-relaxed italic'>
                  Обирайте позиції, які вам подобаються. Ми зв'яжемося для
                  уточнення деталей.
                </p>
              </div>
            )}
            <div
              className={`grid gap-6 ${
                isBuffet
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className='aspect-[3/4] bg-gray-100 rounded-[2rem] animate-pulse'
                  />
                ))
              ) : filtered.length > 0 ? (
                filtered.map(p =>
                  isBuffet ? (
                    <BuffetCard
                      key={p.id}
                      product={p}
                      isSelected={selectedBuffetItems.some(i => i.id === p.id)}
                      onOpenInfo={handleOpenInfo}
                      onToggleSelection={toggleBuffetSelection}
                    />
                  ) : (
                    <ProductCard
                      key={p.id}
                      product={p}
                      category={category}
                      onAddToCart={p => addToCart(p, category)}
                    />
                  )
                )
              ) : (
                <div className='col-span-full text-center py-20 text-gray-300 font-bold uppercase text-xs tracking-widest'>
                  Нічого не знайдено
                </div>
              )}
            </div>
          </div>

          {isBuffet && (
            <aside className='w-full lg:w-80 flex-shrink-0'>
              <div className='sticky top-32 bg-[#2D241E] text-white rounded-[2.5rem] p-8 shadow-2xl'>
                <h3 className='text-xl font-black mb-6 flex items-center gap-3'>
                  <FontAwesomeIcon
                    icon={faClipboardList}
                    className='text-orange-500'
                  />{' '}
                  Ваш вибір
                </h3>
                <div className='space-y-3 mb-8 min-h-[150px]'>
                  <AnimatePresence mode='popLayout'>
                    {selectedBuffetItems.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='text-center py-10 border-2 border-dashed border-white/10 rounded-3xl'
                      >
                        <p className='text-[10px] text-gray-500 font-bold uppercase tracking-widest px-4'>
                          Додайте страви з меню
                        </p>
                      </motion.div>
                    ) : (
                      selectedBuffetItems.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className='flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5'
                        >
                          <span className='text-xs font-bold truncate pr-2'>
                            {item.name}
                          </span>
                          <button
                            onClick={() => toggleBuffetSelection(item)}
                            className='text-white/20 hover:text-orange-500'
                          >
                            <FontAwesomeIcon icon={faClose} />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() =>
                    selectedBuffetItems.length > 0 && setShowCheckoutModal(true)
                  }
                  className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all ${
                    selectedBuffetItems.length > 0
                      ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-xl'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <FontAwesomeIcon icon={faPaperPlane} /> Обговорити деталі
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* MODAL CHECKOUT */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[110] bg-[#2D241E]/95 backdrop-blur-md flex items-center justify-center p-4'
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className='bg-white w-full max-w-md rounded-[3rem] p-8 md:p-12 relative'
            >
              {isSuccess ? (
                <div className='text-center py-10'>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='text-6xl text-green-500 mb-6'
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </motion.div>
                  <h2 className='text-2xl font-black mb-2'>Дякуємо!</h2>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className='absolute top-8 right-8 text-gray-300 hover:text-gray-900'
                  >
                    <FontAwesomeIcon icon={faClose} size='lg' />
                  </button>
                  <h2 className='text-2xl font-black text-[#2D241E] mb-2 uppercase'>
                    Контакти
                  </h2>
                  <form onSubmit={handleBuffetSubmit} className='space-y-4'>
                    <div className='relative'>
                      <FontAwesomeIcon
                        icon={faUser}
                        className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-300'
                      />
                      <input
                        required
                        type='text'
                        placeholder="Ваше ім'я"
                        className='w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none'
                        value={userContact.name}
                        onChange={e =>
                          setUserContact({
                            ...userContact,
                            name: e.target.value
                          })
                        }
                      />
                    </div>
                    <div className='relative'>
                      <FontAwesomeIcon
                        icon={faPhone}
                        className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-300'
                      />
                      <input
                        required
                        type='tel'
                        placeholder='Номер телефону'
                        className='w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none'
                        value={userContact.phone}
                        onChange={e =>
                          setUserContact({
                            ...userContact,
                            phone: e.target.value
                          })
                        }
                      />
                    </div>
                    <button
                      type='submit'
                      className='w-full bg-[#2D241E] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all'
                    >
                      {isSubmitting ? 'Відправка...' : 'Підтвердити запит'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK VIEW SLIDER */}
      <AnimatePresence>
        {infoProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] bg-[#2D241E]/90 backdrop-blur-md flex items-center justify-center p-4'
            onClick={() => setInfoProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className='bg-white w-full max-w-xl rounded-[3rem] overflow-hidden relative'
              onClick={e => e.stopPropagation()}
            >
              <div className='relative h-80 bg-gray-100'>
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={currentPhotoIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={
                      new URL(
                        `../../assets/products/${
                          infoProduct.images?.[currentPhotoIndex] ||
                          'zaglushka.jpg'
                        }`,
                        import.meta.url
                      ).href
                    }
                    className='w-full h-full object-cover'
                  />
                </AnimatePresence>
                {infoProduct.images?.length > 1 && (
                  <div className='absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none'>
                    <button
                      onClick={() =>
                        setCurrentPhotoIndex(prev =>
                          prev === 0 ? infoProduct.images.length - 1 : prev - 1
                        )
                      }
                      className='w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg pointer-events-auto'
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPhotoIndex(prev =>
                          prev === infoProduct.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className='w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg pointer-events-auto'
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                )}
                <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
                  {infoProduct.images?.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentPhotoIndex
                          ? 'w-6 bg-white'
                          : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setInfoProduct(null)}
                  className='absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg z-10'
                >
                  <FontAwesomeIcon icon={faClose} />
                </button>
              </div>
              <div className='p-8'>
                <h2 className='text-2xl font-black mb-4'>{infoProduct.name}</h2>
                <div className='bg-gray-50 p-6 rounded-2xl mb-6'>
                  <p className='text-sm text-gray-600 leading-relaxed font-medium'>
                    {infoProduct.ingredients ||
                      infoProduct.description ||
                      'Склад уточнюється...'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    toggleBuffetSelection(infoProduct)
                    setInfoProduct(null)
                  }}
                  className='w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest'
                >
                  Додати до вибору
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
