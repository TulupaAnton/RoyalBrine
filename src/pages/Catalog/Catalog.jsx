import React, { useState, useEffect, useMemo, memo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { database } from '../../lib/productSuperbase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSearch,
  faChevronLeft,
  faCartPlus,
  faUtensils,
  faFish,
  faDrumstickBite,
  faBoxOpen,
  faSeedling,
  faLeaf,
  faClose,
  faShoppingBasket,
  faEye
} from '@fortawesome/free-solid-svg-icons'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import { toast } from 'react-hot-toast'

/* ===== CONFIGURATION ===== */
const categoryNames = {
  pickles: 'Домашні Соління',
  fish: 'Рибні Делікатеси',
  meats: 'Мʼясні Вироби',
  cooking: 'Домашня Кулінарія',
  'semi-finished': 'Напівфабрикати'
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
      {/* 1. Изображение - Фиксированный квадрат */}
      <Link
        to={`/product/${category}/${product.id}`}
        className='relative aspect-square overflow-hidden rounded-[1.7rem] mb-3 flex-shrink-0 bg-gray-50'
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading='lazy'
          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
          onError={e => {
            e.target.src = zaglushka
          }}
        />
        <div className='absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-black/5'>
          <span className='text-[9px] font-black text-gray-800 uppercase tracking-tighter'>
            {product.weight}
          </span>
        </div>
      </Link>

      {/* 2. Контентная часть - Flex-grow выравнивает низ */}
      <div className='flex flex-col flex-grow px-2 pb-2'>
        {/* Верхний блок: Название и Кнопка подробностей */}
        <div className='flex-grow'>
          <h3 className='text-gray-900 font-bold text-[13px] md:text-base leading-tight mb-2 line-clamp-2 min-h-[2.2rem] md:min-h-[2.5rem]'>
            {product.name}
          </h3>

          <Link
            to={`/product/${category}/${product.id}`}
            className='mb-3 py-2 w-full bg-orange-50/50 rounded-xl text-orange-600 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 active:bg-orange-100 transition-colors'
          >
            <FontAwesomeIcon icon={faEye} className='text-[10px]' />
            Детальніше
          </Link>
        </div>

        {/* 3. Нижний блок: Всегда прижат к низу и выровнен в ряд */}
        <div className='pt-2 border-t border-gray-50 flex items-center justify-between gap-1'>
          <div className='flex flex-col justify-end'>
            <span className='text-[9px] text-gray-400 font-bold leading-none uppercase mb-0.5'>
              Ціна
            </span>
            <div className='flex items-baseline'>
              <span className='text-lg font-black text-gray-900 leading-none'>
                {product.price}
              </span>
              <span className='text-[10px] font-bold text-gray-900 ml-0.5'>
                ₴
              </span>
            </div>
          </div>

          <button
            disabled={product.isAccessible}
            onClick={() => onAddToCart(product)}
            className={`h-10 w-10 sm:w-auto sm:px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-90
              ${
                product.isAccessible
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-900 text-white shadow-md hover:bg-orange-600'
              }`}
          >
            <FontAwesomeIcon icon={faCartPlus} className='text-sm' />
            <span className='hidden sm:inline text-[10px] font-black uppercase tracking-widest'>
              Купити
            </span>
          </button>
        </div>
      </div>
    </article>
  )
})

/* ===== MAIN CATALOG ===== */
export function Catalog () {
  const { category } = useParams()
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSubFilter, setActiveSubFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCartStore()

  // Реф для фокуса на поиске
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

  const handleAddToCart = p => {
    addToCart(p, category)
    toast.success(`${p.name} додано!`, {
      icon: '🛒',
      position: 'top-center',
      style: { borderRadius: '100px', background: '#111', color: '#fff' }
    })
  }

  // Функция для скролла вверх и фокуса в инпут
  const handleFocusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 450)
  }

  return (
    <div className='min-h-screen bg-[#FDFCFB] text-[#2D241E] pb-32'>
      {/* Header */}
      <header className='sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-xl border-b border-gray-100'>
        <div className='container mx-auto px-4 pt-6 pb-2'>
          <div className='flex items-center gap-4 mb-5'>
            <Link
              to='/'
              className='w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-gray-100 rounded-full text-gray-800 active:scale-90 transition-all'
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
              placeholder='Шукаєте щось смачьненье? '
              className='w-full bg-white border border-gray-100 focus:border-orange-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm transition-all outline-none'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Категории фильтрации */}
          {subcategoryConfig[category] && (
            <div className='flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4'>
              {subcategoryConfig[category].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveSubFilter(f.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest whitespace-nowrap
                    ${
                      activeSubFilter === f.id
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-100'
                        : 'bg-white text-gray-400 border border-gray-100'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className='container mx-auto px-4 py-6'>
        {loading ? (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='aspect-[3/5] bg-gray-100 rounded-[2rem] animate-pulse'
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6'>
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                category={category}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-24'>
            <div className='text-5xl mb-4'>🥘</div>
            <p className='font-black text-gray-300 uppercase text-[10px] tracking-widest'>
              Нічого не знайдено
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className='md:hidden fixed bottom-6 left-6 right-6 z-50'>
        <div className='bg-gray-900/95 backdrop-blur-xl rounded-full h-16 flex items-center justify-around px-6 shadow-2xl border border-white/10'>
          <Link
            to='/'
            className='p-3 text-white/40 hover:text-white transition-colors'
          >
            <FontAwesomeIcon icon={faUtensils} className='text-lg' />
          </Link>

          <button
            onClick={handleFocusSearch}
            className='w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center -translate-y-6 shadow-xl shadow-orange-500/40 border-[6px] border-[#FDFCFB] active:scale-95 transition-transform'
          >
            <FontAwesomeIcon icon={faSearch} className='text-xl' />
          </button>

          <Link
            to='/cart'
            className='p-3 text-white/40 hover:text-white transition-colors'
          >
            <FontAwesomeIcon icon={faShoppingBasket} className='text-lg' />
          </Link>
        </div>
      </nav>
    </div>
  )
}
