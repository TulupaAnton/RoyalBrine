import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { database } from '../../lib/productSuperbase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHeart,
  faSearch,
  faArrowRight,
  faCartShopping
} from '@fortawesome/free-solid-svg-icons'
import zaglushka from '../../assets/zaglushka.jpg'
import { useCartStore } from '../../store/cartStore'
import { toast } from 'react-hot-toast'

/* ====== Config / Helpers ====== */
const categoryNames = {
  pickles: 'Соління',
  smoked: 'Копчення',
  cooking: 'Кулінарія',
  meats: 'Мʼясні вироби',
  fish: 'Рибні вироби',

  'semi-finished': 'Напівфабрикати',
  salad: 'Салати'
}

const imageCache = new Map()

const preloadImage = src => {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error('No src'))
    if (imageCache.has(src)) {
      resolve(imageCache.get(src))
      return
    }
    const img = new Image()
    img.src = src
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = err => reject(err)
  })
}

function useInView (ref, options = {}) {
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true)
            if (options.once) observer.unobserve(node)
          } else if (!options.once) {
            setInView(false)
          }
        })
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? '0px'
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, options.threshold, options.rootMargin, options.once])

  return inView
}

/* ========== IMAGE LOADER ========== */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  fallback = zaglushka,
  priority = false
}) => {
  const [imageSrc, setImageSrc] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (!src) {
        setImageSrc(fallback)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const imageUrl = new URL(
          `../../assets/products/${src}`,
          import.meta.url
        ).href

        if (imageCache.has(imageUrl)) {
          setImageSrc(imageUrl)
          setLoading(false)
          return
        }

        await preloadImage(imageUrl)
        setImageSrc(imageUrl)
        setLoading(false)
      } catch (err) {
        setImageSrc(fallback)
        setLoading(false)
      }
    }

    load()
  }, [src, fallback])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton */}
      {loading && (
        <div className='absolute inset-0 bg-gray-100 animate-pulse' />
      )}

      <img
        src={imageSrc || fallback}
        alt={alt}
        loading='lazy'
        className={`w-full h-full object-cover rounded-lg transition duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  )
}

/* ========== PRODUCT CARD ========== */
const ProductCard = ({ product, category, index, onAddToCart }) => {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true })
  const priority = index < 6

  return (
    <article
      ref={ref}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow transition duration-300 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className='relative h-80 w-full'>
        <OptimizedImage
          src={product.images && product.images[0]}
          alt={product.name}
          className={`h-full w-full ${
            product.isAccessible ? 'opacity-60' : ''
          }`}
          fallback={zaglushka}
          priority={priority}
        />

        {product.isAccessible && (
          <div className='absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center'>
            <span className='text-white text-lg font-semibold'>
              Товар скоро з’явиться
            </span>
          </div>
        )}
      </div>

      <div className='p-5'>
        <h3 className='font-semibold text-lg text-gray-900 line-clamp-2 mb-2'>
          {product.name}
        </h3>

        <div className='flex justify-between items-center mb-3'>
          <span className='font-bold text-lg text-amber-600'>
            {product.price}
          </span>

          <span className='text-sm text-gray-500'>{product.weight}</span>
        </div>

        <div className='flex justify-between items-center'>
          <Link
            to={`/product/${category}/${product.id}`}
            className='px-4 py-2 border border-amber-300 text-amber-600 rounded-xl text-sm'
          >
            Детальніше
          </Link>

          <button
            disabled={product.isAccessible}
            onClick={() => onAddToCart(product)}
            className={`px-4 py-2 rounded-xl text-sm flex items-center ${
              product.isAccessible
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
            }`}
          >
            <FontAwesomeIcon icon={faCartShopping} className='mr-2' />У кошик
          </button>
        </div>
      </div>
    </article>
  )
}

/* ========== MAIN CATALOG ========== */
export function Catalog () {
  const { category } = useParams()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [meatFilter, setMeatFilter] = React.useState('all')

  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const { addToCart } = useCartStore()

  /* ===== LOAD PRODUCTS ===== */
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

  /* ===== APPLY SEARCH + FILTER ===== */
  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => {
      if (category !== 'meats') return true

      if (meatFilter === 'all') return true
      if (meatFilter === 'regular') return p.meat_type === 'regular'
      if (meatFilter === 'smoked') return p.meat_type === 'smoked'
      if (meatFilter === 'fried') return p.meat_type === 'fried'

      return true
    })

  const handleAddToCart = product => {
    addToCart(product, category)
    toast.success(`${product.name} додано до кошика`)
  }

  return (
    <div className='py-12 bg-gradient-to-b from-amber-50 to-white min-h-screen'>
      <div className='container mx-auto px-4'>
        {/* TITLE */}
        <h1 className='text-4xl font-bold text-gray-900 mb-6'>
          {categoryNames[category]}
        </h1>

        {/* ---------------- ФІЛЬТРИ ДЛЯ МʼЯСНИХ ---------------- */}
        {category === 'meats' && (
          <div className='flex flex-wrap gap-3 mb-8'>
            <button
              onClick={() => setMeatFilter('all')}
              className={`px-4 py-2 rounded-xl border ${
                meatFilter === 'all'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white border-amber-300 text-amber-600'
              }`}
            >
              Усі
            </button>

            <button
              onClick={() => setMeatFilter('regular')}
              className={`px-4 py-2 rounded-xl border ${
                meatFilter === 'regular'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white border-amber-300 text-amber-600'
              }`}
            >
              Мʼясне
            </button>

            <button
              onClick={() => setMeatFilter('smoked')}
              className={`px-4 py-2 rounded-xl border ${
                meatFilter === 'smoked'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white border-amber-300 text-amber-600'
              }`}
            >
              Копчене
            </button>

            <button
              onClick={() => setMeatFilter('fried')}
              className={`px-4 py-2 rounded-xl border ${
                meatFilter === 'fried'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white border-amber-300 text-amber-600'
              }`}
            >
              Смажене
            </button>
          </div>
        )}

        {/* SEARCH */}
        <div className='flex justify-between items-center mb-10'>
          <div className='relative w-full max-w-md'>
            <FontAwesomeIcon
              icon={faSearch}
              className='absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500'
            />

            <input
              type='text'
              placeholder='Пошук продуктів...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400'
            />
          </div>

          <Link
            to='/'
            className='ml-4 px-5 py-3 bg-white border border-amber-300 rounded-xl text-amber-600 shadow-sm'
          >
            <FontAwesomeIcon
              icon={faArrowRight}
              className='mr-2 transform -rotate-180'
            />
            На головну
          </Link>
        </div>

        {/* GRID OF PRODUCTS */}
        {loading ? (
          <div className='text-center py-16 text-gray-500 text-lg'>
            Завантаження...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredProducts.map((prod, i) => (
              <ProductCard
                key={prod.id}
                product={prod}
                category={category}
                index={i}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-16 text-gray-500 text-lg'>
            Товарів не знайдено
          </div>
        )}
      </div>
    </div>
  )
}
