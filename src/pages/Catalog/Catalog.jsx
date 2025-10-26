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
import AOS from 'aos'
import 'aos/dist/aos.css'

import zaglushka from '../../assets/zaglushka.png'
import { useCartStore } from '../../store/cartStore'
import { toast } from 'react-hot-toast'

const categoryNames = {
  pickles: 'Соління',
  smoked: 'Копчення',
  cooking: 'Кулінария',
  'semi-finished': 'Напівфабрикати'
}

// Кэш для предзагруженных изображений
const imageCache = new Map()

// Функция предзагрузки изображений
const preloadImage = src => {
  return new Promise((resolve, reject) => {
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
    img.onerror = reject
  })
}

// Компонент для оптимизированного изображения
const OptimizedImage = ({ src, alt, className, fallback = zaglushka }) => {
  const [imageSrc, setImageSrc] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    const loadImage = async () => {
      if (!src) {
        if (isMounted) {
          setImageSrc(fallback)
          setIsLoading(false)
        }
        return
      }

      try {
        if (isMounted) {
          setIsLoading(true)
          setHasError(false)
        }

        // Пытаемся загрузить изображение
        const imageUrl = new URL(
          `../../assets/products/${src}`,
          import.meta.url
        ).href
        await preloadImage(imageUrl)

        if (isMounted) {
          setImageSrc(imageUrl)
          setIsLoading(false)
        }
      } catch (error) {
        console.warn(`Failed to load image: ${src}`, error)
        if (isMounted) {
          setImageSrc(fallback)
          setIsLoading(false)
          setHasError(true)
        }
      }
    }

    loadImage()

    return () => {
      isMounted = false
    }
  }, [src, fallback])

  const handleError = () => {
    setImageSrc(fallback)
    setHasError(true)
    setIsLoading(false)
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center'>
          <div className='w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin'></div>
        </div>
      )}
      <img
        src={imageSrc || fallback}
        alt={alt}
        loading='lazy'
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'scale-100' : ''}`}
        onError={handleError}
      />
    </div>
  )
}

export function Catalog () {
  const { category } = useParams()
  const [searchTerm, setSearchTerm] = React.useState('')
  const { addToCart } = useCartStore()

  // Предзагрузка изображений при изменении категории
  React.useEffect(() => {
    const preloadCategoryImages = async () => {
      const categoryProducts = productsData[category] || []
      const preloadPromises = categoryProducts.slice(0, 6).map(product => {
        if (product.images && product.images[0]) {
          const imageUrl = new URL(
            `../../assets/products/${product.images[0]}`,
            import.meta.url
          ).href
          return preloadImage(imageUrl).catch(() => null)
        }
        return Promise.resolve(null)
      })

      try {
        await Promise.all(preloadPromises)
      } catch (error) {
        console.warn('Some images failed to preload:', error)
      }
    }

    preloadCategoryImages()
  }, [category])

  React.useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    })
  }, [])

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

    const button = document.getElementById(`add-to-cart-${product.id}`)
    if (button) {
      button.classList.add('animate-pulse')
      setTimeout(() => button.classList.remove('animate-pulse'), 500)
    }
  }

  return (
    <div className='py-12 bg-gradient-to-b from-amber-50 to-white min-h-screen'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row justify-between items-center mb-12 gap-6'>
          <div className='mb-6 md:mb-0' data-aos='fade-down'>
            <h1 className='text-4xl font-bold text-gray-900 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent'>
              {categoryNames[category] || 'Каталог'}
            </h1>
            <p className='text-gray-600 mt-2 max-w-lg'>
              {categoryNames[category]
                ? `Усі товари з категорії "${categoryNames[category]}"`
                : "Продукти приготовлені з любов'ю та турботою"}
            </p>
          </div>

          <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
            <div className='relative w-full md:w-72' data-aos='fade-down'>
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
                  className='w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm transition-all duration-300'
                />
              </div>
            </div>

            <div className='w-full md:w-auto' data-aos='fade-up'>
              <Link
                to='/'
                className='group inline-flex items-center px-5 py-3 bg-white border border-amber-300 rounded-xl text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 transition-all duration-300 shadow-sm hover:shadow-md'
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className='mr-2 transform -rotate-180 transition-transform duration-300 group-hover:translate-x-1'
                />
                Повернутись на головну
              </Link>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8'>
            {filteredProducts.map((product, i) => (
              <div
                key={`${category}-${product.id}`}
                className='group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full'
                data-aos='zoom-in-up'
              >
                {/* Image Section с оптимизированным изображением */}
                <div className='relative overflow-hidden h-96 w-full'>
                  <OptimizedImage
                    src={product.images && product.images[0]}
                    alt={product.name}
                    className='h-full w-full'
                    fallback={zaglushka}
                  />

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

                {/* Product Info */}
                <div className='p-6'>
                  <div className='flex justify-between items-start mb-4'>
                    <h3 className='font-semibold text-lg md:text-xl text-gray-900 line-clamp-2 flex-1 mr-4'>
                      {product.name}
                    </h3>
                    <div className='flex flex-col items-end min-w-max'>
                      {product.oldPrice && (
                        <span className='text-base text-gray-400 line-through mb-1'>
                          {product.oldPrice}
                        </span>
                      )}
                      <span className='font-bold text-xl text-amber-600 whitespace-nowrap'>
                        {product.price}
                      </span>
                    </div>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-base text-gray-500 font-medium'>
                      {product.weight}
                    </span>
                    <div className='flex space-x-3'>
                      <Link
                        to={`/product/${category}/${product.id}`}
                        className='px-5 py-2.5 border border-amber-400 text-amber-600 hover:bg-amber-50 rounded-xl text-base transition-all duration-300 flex items-center group/readmore hover:border-amber-500'
                      >
                        Детальніше
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className='ml-2 text-sm transition-transform duration-300 group-hover/readmore:translate-x-1'
                        />
                      </Link>
                      <button
                        id={`add-to-cart-${product.id}`}
                        onClick={() => handleAddToCart(product)}
                        className='px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center'
                      >
                        <FontAwesomeIcon
                          icon={faCartShopping}
                          className='mr-2'
                        />
                        У кошик
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-16' data-aos='fade-up'>
            <div className='max-w-md mx-auto'>
              <div className='w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6'>
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
                className='px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg'
              >
                Скинути пошук
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
