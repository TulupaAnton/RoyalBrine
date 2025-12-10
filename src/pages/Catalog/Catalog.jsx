import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { database } from '../../lib/productSuperbase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHeart,
  faSearch,
  faArrowRight,
  faCartShopping,
  faSnowflake
} from '@fortawesome/free-solid-svg-icons'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import { toast } from 'react-hot-toast'

/* ===== CATEGORY NAMES ===== */
const categoryNames = {
  pickles: 'Соління',
  smoked: 'Копчення',
  cooking: 'Кулінарія',
  meats: 'Мʼясні вироби',
  fish: 'Рибні вироби',
  'semi-finished': 'Напівфабрикати',
  salad: 'Салати'
}

/* ===== IMAGE CACHE ===== */
const imageCache = new Map()

const preloadImage = src => {
  return new Promise((resolve, reject) => {
    if (!src) return reject()
    if (imageCache.has(src)) return resolve(imageCache.get(src))

    const img = new Image()
    img.src = src
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = reject
  })
}

/* ===== IN VIEW ANIMATION ===== */
function useInView (ref, options = {}) {
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true)
            if (options.once) obs.unobserve(node)
          }
        })
      },
      { threshold: 0.15 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [ref, options.once])

  return inView
}

/* ===== IMAGE LOADER ===== */
const OptimizedImage = ({ src, fallback = zaglushka, alt = '' }) => {
  const [imgSrc, setImgSrc] = React.useState(null)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    const loadImage = async () => {
      setLoaded(false)

      if (!src) {
        setImgSrc(fallback)
        setLoaded(true)
        return
      }

      try {
        const url = new URL(`../../assets/products/${src}`, import.meta.url)
          .href

        await preloadImage(url)
        setImgSrc(url)
        setLoaded(true)
      } catch (e) {
        setImgSrc(fallback)
        setLoaded(true)
      }
    }

    loadImage()
  }, [src, fallback])

  return (
    <div className='relative h-full w-full'>
      {!loaded && (
        <div className='absolute inset-0 animate-pulse bg-gray-200'></div>
      )}

      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full h-full object-cover rounded-xl transition duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
/* ======================================================
   🎄 СНЕЖИНКИ (генератор прямо здесь в файле)
====================================================== */
const Snowfall = ({ count = 40 }) => {
  const flakes = React.useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 8,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * -20,
      drift: `${Math.random() * 100 - 50}px`
    }))
  }, [count])

  return (
    <div className='pointer-events-none fixed inset-0 z-50 overflow-hidden'>
      {flakes.map(f => (
        <div
          key={f.id}
          className='snowflake'
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}px`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            '--drift': f.drift
          }}
        >
          ❄
        </div>
      ))}
    </div>
  )
}

/* ======================================================
   🎄 PRODUCT CARD – Новый дизайн карточек
====================================================== */
const ProductCard = ({ product, category, index, onAddToCart }) => {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <article
      ref={ref}
      className={`
        relative bg-white/90 rounded-3xl shadow-xl overflow-hidden border border-amber-200/60 
        backdrop-blur-sm transition duration-500 
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
        hover:-translate-y-1 hover:shadow-2xl
      `}
    >
      {/* Новогодний декор */}
      <div className='absolute top-2 right-2 text-red-400 text-xl animate-spin-slow'>
        <FontAwesomeIcon icon={faSnowflake} />
      </div>

      <Link
        to={`/product/${category}/${product.id}`}
        className='relative h-72 w-full block'
      >
        <OptimizedImage src={product.images?.[0]} alt={product.name} />

        {/* Если товар недоступен */}
        {product.isAccessible && (
          <div className='absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center'>
            <span className='text-white text-lg font-bold'>
              Товар скоро зʼявиться
            </span>
          </div>
        )}
      </Link>

      {/* Контент */}
      <div className='p-5'>
        <h3 className='font-semibold text-lg text-gray-900 mb-2 line-clamp-2'>
          {product.name}
        </h3>

        <div className='flex justify-between items-center'>
          <span className='text-xl font-bold text-red-500 drop-shadow-md'>
            {product.price}
          </span>
          <span className='text-sm text-gray-500'>{product.weight}</span>
        </div>

        <div className='mt-4 flex justify-between items-center'>
          <Link
            to={`/product/${category}/${product.id}`}
            className='px-4 py-2 bg-white border border-red-300 rounded-xl shadow text-red-600 hover:bg-red-50'
          >
            Детальніше
          </Link>

          <button
            disabled={product.isAccessible}
            onClick={() => onAddToCart(product)}
            className={`
              px-4 py-2 rounded-xl text-sm shadow flex items-center 
              ${
                product.isAccessible
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-amber-500 text-white'
              }
            `}
          >
            <FontAwesomeIcon icon={faCartShopping} className='mr-2' />У кошик
          </button>
        </div>
      </div>
    </article>
  )
}

/* ======================================================
   🎄 MAIN CATALOG PAGE
====================================================== */
export function Catalog () {
  const { category } = useParams()
  const [products, setProducts] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [meatFilter, setMeatFilter] = React.useState('all')
  const [loading, setLoading] = React.useState(true)

  const { addToCart } = useCartStore()

  /* Load products */
  React.useEffect(() => {
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

  /* FILTER */
  const filtered = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => {
      if (category !== 'meats') return true
      if (meatFilter === 'all') return true
      return p.meat_type === meatFilter
    })

  const handleAddToCart = p => {
    addToCart(p, category)
    toast.success(`${p.name} додано до кошика 🎁`)
  }

  return (
    <div className='relative bg-gradient-to-b from-red-100 via-amber-50 to-white min-h-screen py-16'>
      {/* ❄ Снежинки */}
      <Snowfall count={55} />

      <div className='container mx-auto px-4 relative z-10'>
        <h1 className='text-5xl font-black text-red-600 mb-6 drop-shadow-lg flex items-center gap-3'>
          <FontAwesomeIcon
            icon={faSnowflake}
            className='text-amber-500 animate-spin-slow'
          />
          {categoryNames[category]}
          <FontAwesomeIcon
            icon={faSnowflake}
            className='text-amber-500 animate-spin-slow'
          />
        </h1>

        {/* Поиск */}
        <div className='flex items-center mb-10'>
          <div className='relative w-full max-w-md'>
            <FontAwesomeIcon
              icon={faSearch}
              className='absolute left-4 top-1/2 -translate-y-1/2 text-red-500'
            />

            <input
              type='text'
              placeholder='Пошук продуктів...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 bg-white border border-red-200 rounded-xl shadow'
            />
          </div>

          <Link
            to='/'
            className='ml-4 px-5 py-3 bg-white border border-red-300 rounded-xl text-red-600 shadow'
          >
            <FontAwesomeIcon icon={faArrowRight} className='mr-2 -rotate-180' />
            На головну
          </Link>
        </div>
        {/* Фільтр для мʼяса */}
        {category === 'meats' && (
          <div className='flex flex-wrap gap-3 mb-8'>
            <button
              onClick={() => setMeatFilter('all')}
              className={`px-4 py-2 rounded-xl border transition ${
                meatFilter === 'all'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              Усі
            </button>

            <button
              onClick={() => setMeatFilter('smoked')}
              className={`px-4 py-2 rounded-xl border transition ${
                meatFilter === 'smoked'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              Копчене
            </button>

            <button
              onClick={() => setMeatFilter('fried')}
              className={`px-4 py-2 rounded-xl border transition ${
                meatFilter === 'fried'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              Смажене
            </button>

            <button
              onClick={() => setMeatFilter('regular')}
              className={`px-4 py-2 rounded-xl border transition ${
                meatFilter === 'regular'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              Свіже
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className='text-center py-20 text-gray-600 text-lg'>
            Завантаження…
          </div>
        ) : filtered.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                category={category}
                index={i}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-20 text-gray-500 text-lg'>
            Товарів не знайдено
          </div>
        )}
      </div>
    </div>
  )
}
