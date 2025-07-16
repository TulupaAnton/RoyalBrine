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

const truncateDescription = (text, maxLength = 80) => {
  if (text.length <= maxLength) return text
  let truncated = text.substr(0, maxLength)
  const lastPunctuation = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf(', '),
    truncated.lastIndexOf('; '),
    truncated.lastIndexOf(' ')
  )
  if (lastPunctuation > 0) {
    truncated = truncated.substr(0, lastPunctuation)
  }
  return truncated + '...'
}

export function Catalog () {
  const { category } = useParams()
  const [searchTerm, setSearchTerm] = React.useState('')
  const { addToCart } = useCartStore()

  React.useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
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
                  className='w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm transition-all duration-200'
                />
              </div>
            </div>

            <div
              className='w-full md:w-auto'
              data-aos='fade-up'
              data-aos-delay='150'
            >
              <Link
                to='/'
                className='group inline-flex items-center px-5 py-3 bg-white border border-amber-300 rounded-xl text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 transition-all duration-200 shadow-sm hover:shadow-md'
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className='mr-2 transform -rotate-180 transition-transform duration-200 group-hover:translate-x-1'
                />
                Повернутись на головну
              </Link>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filteredProducts.map((product, i) => (
              <div
                key={`${category}-${product.id}`}
                className='group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]'
                data-aos='zoom-in-up'
                data-aos-delay={i * 75}
              >
                <div className='relative overflow-hidden h-64'>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80'></div>
                  <img
                    src={
                      product.image
                        ? new URL(
                            `../../assets/products/${product.image}`,
                            import.meta.url
                          ).href
                        : zaglushka
                    }
                    alt={product.name}
                    loading='lazy'
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110'
                    onError={e => {
                      e.target.src = zaglushka
                    }}
                  />
                </div>

                <div className='p-5  '>
                  <div className='flex justify-between items-start mb-3  '>
                    <h3 className='font-semibold text-sm md:text-base text-gray-900 line-clamp-2'>
                      {product.name}
                    </h3>
                    <span className='font-bold text-amber-600 whitespace-nowrap ml-2'>
                      {product.price}
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-500'>
                      {product.weight}
                    </span>
                    <div className='flex space-x-2'>
                      <Link
                        to={`/product/${category}/${product.id}`}
                        className='px-4 py-2 border border-amber-400 text-amber-600 hover:bg-amber-50 rounded-xl text-sm transition-all duration-200 flex items-center group/readmore'
                      >
                        Детальніше
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className='ml-2 text-xs transition-transform duration-200 group-hover/readmore:translate-x-1'
                        />
                      </Link>
                      <button
                        id={`add-to-cart-${product.id}`}
                        onClick={() => handleAddToCart(product)}
                        className='px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                      >
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
                className='px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg'
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
