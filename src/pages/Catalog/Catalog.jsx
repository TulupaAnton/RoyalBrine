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
  faPhone,
  faBan,
  faFire,
  faStar,
  faArrowRight,
  faClock,
  faHeart
} from '@fortawesome/free-solid-svg-icons'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'
import paska1 from '../../assets/products/paska1.jpg'
import paska2 from '../../assets/products/paska2.jpg'
import paska3 from '../../assets/products/paska3.jpg'
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

/* ===== CONFIGURATION ===== */
const categoryNames = {
  pickles: 'Домашні Соління',
  fish: 'Рибні Делікатеси',
  meats: 'Мʼясні Вироби',
  cooking: 'Домашня Кулінарія',
  'semi-finished': 'Напівфабрикати',
  buffet: 'Фуршетне Меню',
  paska: 'Великодні Паски'
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
}

/* ===== PASKA DATA ===== */
const PASKAS_INITIAL = [
  {
    id: 'zavarna',
    name: ' Заварна паска',
    subtitle: 'з додаванням заварного тіста',

    badgeIcon: faFire,
    weight: '500 г',
    price: '180 грн',
    images: [paska1, paska2, paska3],
    color: '#C9873A',
    bgLight: '#FEF3E2',
    disabled: false,
    disabledMsg: null
  },
  {
    id: 'vershkova',
    name: 'Вершкова паска з шоколадом',
    subtitle: 'з шоколадними дропсами',

    badgeIcon: faStar,
    weight: '500 г',
    price: '200 грн',
    images: [paska3, paska1, paska2],

    color: '#6B3A2A',
    bgLight: '#F5EAE5',
    disabled: false,
    disabledMsg: null
  },
  {
    id: 'paneton',
    name: 'Панетон',
    subtitle: 'італійська традиція',

    weight: '600 г',
    price: '220 грн',
    images: [zaglushka, zaglushka],
    color: '#A07840',
    bgLight: '#FDF3DC',
    disabled: true,

    disabledMsg: 'Вже печемо! Скоро буде готова 🔥'
  },
  {
    id: 'kraffin',
    name: 'Крафін',
    subtitle: 'croissant + muffin',
    badge: 'Трендовий',
    badgeIcon: faFire,
    weight: '350 г',
    price: '190 грн',
    images: [zaglushka, zaglushka],
    color: '#8B5E3C',
    bgLight: '#FBF0E8',
    disabled: true,
    disabledMsg: "Готуємо з любов'ю, скоро буде ✨"
  }
]

/* ===== PASKA CARD ===== */
const PaskaCard = memo(({ paska, index }) => {
  const inner = (
    <div
      className={`relative bg-white rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-300 ${
        paska.disabled
          ? 'border border-gray-100 cursor-not-allowed'
          : 'border border-gray-100 shadow-sm group hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer'
      }`}
    >
      {/* Image area — більша */}
      <div
        className='relative w-full overflow-hidden flex-shrink-0'
        style={{ aspectRatio: '1/1', background: paska.bgLight }}
      >
        <img
          src={paska.images[0]}
          alt={paska.name}
          loading='lazy'
          className={`w-full h-full object-cover transition-transform duration-700 ${
            paska.disabled
              ? 'grayscale-[60%] opacity-70'
              : 'group-hover:scale-110'
          }`}
        />

        {/* Overlay для disabled */}
        {paska.disabled && (
          <div className='absolute inset-0 bg-gradient-to-t from-[#1a1009]/80 via-[#1a1009]/30 to-transparent flex flex-col items-center justify-end p-4 pb-5'>
            <div className='flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-2'>
              <FontAwesomeIcon
                icon={faClock}
                className='text-orange-300 text-[10px]'
              />
              <span className='text-white text-[10px] font-black uppercase tracking-wider'>
                Незабаром
              </span>
            </div>
            <p className='text-white text-center text-xs font-bold leading-snug drop-shadow-lg'>
              {paska.disabledMsg}
            </p>
          </div>
        )}

        {/* Badge */}
        {!paska.disabled && (
          <div
            className='absolute top-3 left-3 z-10 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md'
            style={{ background: paska.color }}
          >
            <FontAwesomeIcon icon={paska.badgeIcon} className='text-[8px]' />
            {paska.badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div className='flex flex-col flex-grow p-4'>
        <p
          className='text-[10px] font-black uppercase tracking-widest mb-1 opacity-60'
          style={{ color: paska.disabled ? '#9ca3af' : paska.color }}
        >
          {paska.subtitle}
        </p>
        <h3
          className={`font-black text-base sm:text-lg leading-tight mb-3 line-clamp-2 ${
            paska.disabled ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {paska.name}
        </h3>

        {/* Filling teaser — тільки для активних */}
        {!paska.disabled && (
          <div className='bg-gray-50 rounded-xl px-3 py-2 mb-3'>
            <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5'>
              🎁 Є вибір начинки
            </p>
            <p className='text-xs text-gray-500 font-medium'>🍓 · 🥛 · 🍇</p>
          </div>
        )}

        <div
          className={`mt-auto pt-3 border-t flex items-center justify-between ${
            paska.disabled ? 'border-gray-100' : 'border-gray-100'
          }`}
        >
          <div>
            <span
              className={`text-xl font-extrabold ${
                paska.disabled ? 'text-gray-300' : 'text-gray-900'
              }`}
            >
              {paska.price}
            </span>
            <span
              className={`block text-xs font-medium mt-0.5 ${
                paska.disabled ? 'text-gray-300' : 'text-gray-400'
              }`}
            >
              {paska.weight}
            </span>
          </div>

          {paska.disabled ? (
            <div className='h-11 w-11 rounded-xl flex items-center justify-center bg-orange-50 border border-orange-100'>
              <FontAwesomeIcon
                icon={faHeart}
                className='text-orange-300 text-sm'
              />
            </div>
          ) : (
            <div
              className='h-11 w-11 rounded-xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md'
              style={{ background: paska.color }}
            >
              <FontAwesomeIcon
                icon={faArrowRight}
                className='text-white text-sm'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }}
      className='h-full'
    >
      {paska.disabled ? (
        <div className='h-full'>{inner}</div>
      ) : (
        <Link to={`/product/paska/${paska.id}`} className='block h-full'>
          {inner}
        </Link>
      )}
    </motion.div>
  )
})

/* ===== SUB-COMPONENTS ===== */

const ProductCard = memo(({ product, category, onAddToCart }) => {
  const inStock = product.isAccessible === true

  const imageUrl = useMemo(() => {
    if (!product.images?.[0]) return zaglushka
    return new URL(
      `../../assets/products/${product.images[0]}`,
      import.meta.url
    ).href
  }, [product.images])

  return (
    <article className='bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden'>
      {!inStock && (
        <div className='absolute top-4 left-4 z-10 bg-gray-800/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5'>
          <FontAwesomeIcon icon={faBan} className='text-red-400 text-[8px]' />
          Немає в наявності
        </div>
      )}

      <Link
        to={`/product/${category}/${product.id}`}
        className='relative overflow-hidden flex-shrink-0 bg-gray-50'
        style={{ aspectRatio: '1/1' }}
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading='lazy'
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            !inStock ? 'grayscale opacity-60' : ''
          }`}
        />
      </Link>

      <div className='flex flex-col flex-grow p-3 sm:p-4'>
        <h3 className='text-gray-900 font-bold text-sm sm:text-base md:text-[17px] mb-3 line-clamp-2 leading-snug min-h-[2.8rem]'>
          {product.name}
        </h3>
        <Link
          to={`/product/${category}/${product.id}`}
          className='mb-3 py-2.5 w-full bg-orange-50/60 rounded-xl text-orange-600 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 active:bg-orange-100 transition-colors'
        >
          <FontAwesomeIcon icon={faEye} /> Детальніше
        </Link>
        <div className='mt-auto pt-3 border-t border-gray-50 flex items-center justify-between'>
          <div>
            <span className='text-xl sm:text-2xl font-extrabold text-gray-900'>
              {product.price}
            </span>
            <span className='text-xs sm:text-sm font-normal text-gray-400 ml-1.5'>
              / {product.weight}
            </span>
          </div>

          <button
            onClick={() => inStock && onAddToCart(product)}
            disabled={!inStock}
            title={!inStock ? 'Немає в наявності' : 'Додати до кошика'}
            className={`h-11 px-4 rounded-xl shadow-sm transition-all active:scale-95 text-base ${
              inStock
                ? 'bg-gray-900 text-white hover:bg-orange-600 cursor-pointer'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
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
    const inStock = product.isAccessible === true

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
      <article className='bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-full transition-all duration-300 hover:shadow-xl group relative overflow-hidden'>
        {!inStock && (
          <div className='absolute top-5 left-5 z-10 bg-gray-800/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5'>
            <FontAwesomeIcon icon={faBan} className='text-red-400 text-[8px]' />
            Немає в наявності
          </div>
        )}

        <div
          className='relative overflow-hidden bg-gray-50'
          style={{ aspectRatio: '4/3' }}
        >
          <img
            src={mainImageUrl}
            alt={product.name}
            loading='lazy'
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              !inStock ? 'grayscale opacity-60' : ''
            }`}
          />
        </div>
        <div className='flex flex-col flex-grow p-5 sm:p-6'>
          <h3 className='text-lg sm:text-xl font-black text-[#2D241E] leading-tight mb-2'>
            {product.name}
          </h3>
          <button
            onClick={() => onOpenInfo(product)}
            className='flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 hover:translate-x-1 transition-transform w-fit'
          >
            <FontAwesomeIcon icon={faInfoCircle} /> Що всередині?
          </button>
          <div className='mt-auto pt-4 border-t border-gray-50 flex items-center justify-between'>
            <span className='text-2xl font-black text-[#2D241E]'>
              {product.price} грн
            </span>
            <button
              onClick={() => inStock && onToggleSelection(product)}
              disabled={!inStock}
              className={`px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                !inStock
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : isSelected
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-[#2D241E] text-white hover:bg-orange-600'
              }`}
            >
              {!inStock ? 'Немає' : isSelected ? 'Додано' : 'Додати'}
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
  const isPaska = category === 'paska'

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
    if (isPaska) {
      setLoading(false)
      return
    }
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

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aStock = a.isAccessible === true ? 0 : 1
      const bStock = b.isAccessible === true ? 0 : 1
      return aStock - bStock
    })
  }, [filtered])

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
        <div className='container mx-auto px-4 pt-5 pb-2'>
          <div className='flex items-center gap-4 mb-5'>
            <Link
              to='/'
              className='w-11 h-11 flex items-center justify-center bg-white shadow-sm border border-gray-100 rounded-full text-gray-800 flex-shrink-0'
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Link>
            <h1 className='text-xl sm:text-2xl font-black tracking-tight truncate'>
              {categoryNames[category]}
            </h1>
          </div>

          {!isPaska && (
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
          )}

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
        {/* ── PASKA CATEGORY ── */}
        {isPaska && <PaskaSection />}

        {/* ── ALL OTHER CATEGORIES ── */}
        {!isPaska && (
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
                className={`grid gap-4 sm:gap-5 ${
                  isBuffet
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className='aspect-[3/4] bg-gray-100 rounded-[2rem] animate-pulse'
                    />
                  ))
                ) : sortedFiltered.length > 0 ? (
                  sortedFiltered.map(p =>
                    isBuffet ? (
                      <BuffetCard
                        key={p.id}
                        product={p}
                        isSelected={selectedBuffetItems.some(
                          i => i.id === p.id
                        )}
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
                      selectedBuffetItems.length > 0 &&
                      setShowCheckoutModal(true)
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
        )}
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
                {infoProduct.isAccessible === true ? (
                  <button
                    onClick={() => {
                      toggleBuffetSelection(infoProduct)
                      setInfoProduct(null)
                    }}
                    className='w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest'
                  >
                    Додати до вибору
                  </button>
                ) : (
                  <div className='w-full bg-gray-100 text-gray-400 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center'>
                    Немає в наявності
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
