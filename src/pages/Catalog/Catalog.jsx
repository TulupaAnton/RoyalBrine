// Catalog.jsx
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import productsData from '../../data/products.json'
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
  'semi-finished': 'Напівфабрикати',
  salad: 'Салати'
}

// Кеш для предзагруженных изображений
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

/* ====== Hook: useInView (IntersectionObserver) ====== */
function useInView (ref, options = {}) {
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: mark visible
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

/* ====== OptimizedImage component ====== */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  fallback = zaglushka,
  priority = false
}) => {
  const [imageSrc, setImageSrc] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [errored, setErrored] = React.useState(false)
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    mountedRef.current = true
    const load = async () => {
      if (!src) {
        if (mountedRef.current) {
          setImageSrc(fallback)
          setLoading(false)
        }
        return
      }
      setLoading(true)
      setErrored(false)
      try {
        const imageUrl = new URL(
          `../../assets/products/${src}`,
          import.meta.url
        ).href
        // Если уже в кеше - используем мгновенно
        if (imageCache.has(imageUrl)) {
          if (mountedRef.current) {
            setImageSrc(imageUrl)
            setLoading(false)
          }
          return
        }
        // Начинаем предзагрузку (не ждем, если это приоритетно — ждем)
        if (priority) {
          await preloadImage(imageUrl)
          if (mountedRef.current) {
            setImageSrc(imageUrl)
            setLoading(false)
          }
        } else {
          preloadImage(imageUrl)
            .then(() => {
              if (mountedRef.current) {
                setImageSrc(imageUrl)
                setLoading(false)
              }
            })
            .catch(err => {
              console.warn('Image preload failed', err)
              if (mountedRef.current) {
                setImageSrc(fallback)
                setErrored(true)
                setLoading(false)
              }
            })
        }
      } catch (err) {
        console.warn('Failed to load image', err)
        if (mountedRef.current) {
          setImageSrc(fallback)
          setErrored(true)
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      mountedRef.current = false
    }
  }, [src, fallback, priority])

  const handleError = () => {
    setImageSrc(fallback)
    setErrored(true)
    setLoading(false)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton / Shimmer */}
      <div
        aria-hidden
        className={`absolute inset-0 rounded-lg transition-opacity duration-300 ease-linear ${
          loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className='w-full h-full bg-gray-100 rounded-lg overflow-hidden'>
          <div className='shimmer' style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      {/* Actual image */}
      <img
        src={imageSrc || fallback}
        alt={alt}
        onError={handleError}
        decoding='async'
        loading='lazy'
        fetchPriority={priority ? 'high' : 'auto'}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ease-linear ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          // Avoid heavy transforms on iOS — we only change opacity
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
        width='600'
        height='600'
      />
      <style jsx='true'>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.2s infinite;
          opacity: 0.9;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

/* ====== ProductCard component (uses useInView for animation) ====== */
const ProductCard = ({ product, category, index, onAddToCart }) => {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true, threshold: 0.15 })
  // для перших 6 карточек - повышенный приоритет загрузки
  const priority = index < 6

  return (
    <article
      ref={ref}
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm transition-shadow duration-200 ${
        inView ? 'card-inview' : 'card-hidden'
      }`}
      aria-labelledby={`product-${product.id}-title`}
      style={{
        // упрощені тіні — не важкі для рендера
        boxShadow: inView
          ? '0 6px 18px rgba(15,23,42,0.06)'
          : '0 2px 6px rgba(15,23,42,0.04)'
      }}
    >
      <div className='relative overflow-hidden h-80 w-full'>
        <OptimizedImage
          src={product.images && product.images[0]}
          alt={product.name}
          className='h-full w-full'
          fallback={zaglushka}
          priority={priority}
        />
        {product.localOnly && (
          <div className='absolute bottom-3 left-3 top-3 z-20'>
            <span className='px-3 py-1 bg-red-600/90 text-white text-xs font-bold rounded-lg shadow-lg'>
              Доставка лише по Запоріжжю
            </span>
          </div>
        )}
        {/* Badges */}
        {product.isNew && (
          <div className='absolute top-3 left-3 z-20'>
            <span className='px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full'>
              НОВИНКА
            </span>
          </div>
        )}
        {product.discount && (
          <div className='absolute top-3 right-3 z-20'>
            <span className='px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full'>
              -{product.discount}%
            </span>
          </div>
        )}
      </div>

      <div className='p-5'>
        <div className='flex justify-between items-start mb-3'>
          <h3
            id={`product-${product.id}-title`}
            className='font-semibold text-lg text-gray-900 line-clamp-2 flex-1 mr-3'
          >
            {product.name}
          </h3>
          <div className='flex flex-col items-end min-w-max'>
            {product.oldPrice && (
              <span className='text-sm text-gray-400 line-through mb-1'>
                {product.oldPrice}
              </span>
            )}
            <span className='font-bold text-lg text-amber-600 whitespace-nowrap'>
              {product.price}
            </span>
          </div>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-500 font-medium'>
            {product.weight}
          </span>
          <div className='flex space-x-3'>
            <Link
              to={`/product/${category}/${product.id}`}
              className='px-4 py-2 border border-amber-300 text-amber-600 rounded-xl text-sm transition-colors duration-150 flex items-center'
            >
              Детальніше
              <FontAwesomeIcon icon={faArrowRight} className='ml-2 text-sm' />
            </Link>

            <button
              id={`add-to-cart-${product.id}`}
              onClick={() => onAddToCart(product)}
              className='px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium transition-transform duration-150 shadow-sm flex items-center'
            >
              <FontAwesomeIcon icon={faCartShopping} className='mr-2' />У кошик
            </button>
          </div>
        </div>
      </div>

      <style jsx='true'>{`
        /* Вхідна анімація — тільки opacity + translateY (легка) */
        .card-hidden {
          opacity: 0;
          transform: translateY(10px);
          transition: transform 420ms cubic-bezier(0.22, 0.9, 0.36, 1),
            opacity 420ms ease;
          will-change: opacity, transform;
        }
        .card-inview {
          opacity: 1;
          transform: translateY(0);
          transition: transform 420ms cubic-bezier(0.22, 0.9, 0.36, 1),
            opacity 420ms ease;
        }

        /* Повага до reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .card-hidden,
          .card-inview,
          .shimmer {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </article>
  )
}

/* ====== Main Catalog component ====== */
export function Catalog () {
  const { category } = useParams()
  const [searchTerm, setSearchTerm] = React.useState('')
  const { addToCart } = useCartStore()

  // Предзагрузка изображений при изменении категории (первые 6)
  React.useEffect(() => {
    let isMounted = true
    const preloadCategoryImages = async () => {
      try {
        const categoryProducts = productsData[category] || []
        const promises = categoryProducts.slice(0, 6).map(p => {
          if (p.images && p.images[0]) {
            const imageUrl = new URL(
              `../../assets/products/${p.images[0]}`,
              import.meta.url
            ).href
            // предзагрузим и поместим в кеш
            return preloadImage(imageUrl).catch(() => null)
          }
          return Promise.resolve(null)
        })
        await Promise.all(promises)
      } catch (err) {
        console.warn('Some images failed to preload:', err)
      }
    }
    if (category) preloadCategoryImages()
    return () => {
      isMounted = false
    }
  }, [category])

  const categoryProducts = productsData[category] || []
  const filteredProducts = categoryProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = product => {
    addToCart(product, category)
    toast.success(`${product.name} додано до кошика`, {
      duration: 3000,
      icon: (
        <FontAwesomeIcon icon={faCartShopping} className='text-amber-500' />
      ),
      style: {
        borderRadius: '12px',
        background: '#fff',
        color: '#000',
        padding: '12px 16px',
        border: '1px solid #22c55e'
      }
    })
    // коротка візуальна індикація
    const btn = document.getElementById(`add-to-cart-${product.id}`)
    if (btn) {
      btn.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.96)' },
          { transform: 'scale(1)' }
        ],
        { duration: 260, easing: 'ease-in-out' }
      )
    }
  }

  return (
    <div className='py-12 bg-gradient-to-b from-amber-50 to-white min-h-screen'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row justify-between items-center mb-12 gap-6'>
          <div className='mb-6 md:mb-0'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent'>
              {categoryNames[category] || 'Каталог'}
            </h1>
            <p className='text-gray-600 mt-2 max-w-lg'>
              {categoryNames[category]
                ? `Усі товари з категорії "${categoryNames[category]}"`
                : "Продукти приготовлені з любов'ю та турботою"}
            </p>
          </div>

          <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
            <div className='relative w-full md:w-72'>
              <div className='relative'>
                <FontAwesomeIcon
                  icon={faSearch}
                  className='absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500'
                />
                <input
                  type='text'
                  placeholder='Пошук продуктів...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm transition-colors duration-200'
                />
              </div>
            </div>

            <div className='w-full md:w-auto'>
              <Link
                to='/'
                className='inline-flex items-center px-5 py-3 bg-white border border-amber-300 rounded-xl text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors duration-200 shadow-sm'
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className='mr-2 transform -rotate-180'
                />
                Повернутись на головну
              </Link>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={`${category}-${product.id}`}
                product={product}
                category={category}
                index={i}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-16'>
            <div className='max-w-md mx-auto'>
              <div className='w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <FontAwesomeIcon
                  icon={faSearch}
                  className='text-amber-500 text-3xl'
                />
              </div>
              <h3 className='text-2xl font-medium text-gray-800 mb-2'>
                Товари не знайдені
              </h3>
              <p className='text-gray-500 mb-6'>
                Спробуйте змінити критерії пошуку або вибрати іншу категорію.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className='px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-medium transition-colors duration-200 shadow-sm'
              >
                Скинути пошук
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scoped CSS для глобальних покращень (м'які, легкі ефекти) */}
      <style jsx='true'>{`
        /* мінімальні hover ефекти: не використовують translate/scale важко на рендері для iOS */
        .group:hover {
          /* лиш легка зміна тіні — швидко рендериться */
        }
        .group a:hover,
        .group button:hover {
          transform: none;
        }

        /* обмежуємо важкі тіні на малих екранах */
        @media (max-width: 640px) {
          .shadow-sm {
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
          }
        }

        /* prefers-reduced-motion - вимикаємо анімації */
        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Catalog
