import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import productsData from '../../data/products.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHeart,
  faSearch,
  faArrowRight,
  faTimes,
  faFire,
  faStar
} from '@fortawesome/free-solid-svg-icons'
import zaglushka from '../../assets/zaglushka.png'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useCartStore } from '../../store/cartStore'

const categoryNames = {
  pickles: 'Соленья',
  smoked: 'Копчености',
  cooking: 'Кулинария',
  'semi-finished': 'Полуфабрикаты'
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

const categoryFilters = [
  { id: 'all', name: 'Все товары' },
  { id: 'pickles', name: 'Соленья' },
  { id: 'smoked', name: 'Копчености' },
  { id: 'cooking', name: 'Кулінарія' },
  { id: 'semi-finished', name: 'Полуфабрикаты' }
]

export function All () {
  const { category } = useParams()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortBy, setSortBy] = React.useState(null)
  const { addToCart } = useCartStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      offset: 20
    })
  }, [])

  const images = import.meta.glob('../../assets/*.png', { eager: true })
  const allProducts = Object.entries(productsData).flatMap(
    ([category, products]) =>
      products.map(product => ({
        ...product,
        category,
        categoryName: categoryNames[category] || category
      }))
  )

  let filteredProducts = allProducts.filter(product => {
    const matchesCategory =
      !category || category === 'all' || product.category === category
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = product => {
    addToCart(product, product.category)
    const button = document.getElementById(`add-to-cart-${product.id}`)
    if (button) {
      button.classList.add('animate-pulse', 'scale-110')
      setTimeout(() => {
        button.classList.remove('animate-pulse', 'scale-110')
      }, 500)
    }
  }

  const handleCategoryFilter = categoryId => {
    if (categoryId === 'all') {
      navigate('/All')
    } else {
      navigate(`/catalog/${categoryId}`)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSortBy(null)
    navigate('/All')
  }

  return (
    <div className='w-full overflow-x-hidden bg-gradient-to-b from-amber-50 to-white min-h-screen'>
      <div className='max-w-[1280px] mx-auto px-4'>
        <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
          <div className='mb-4 md:mb-0 w-full' data-aos='fade-right'>
            <h1 className='text-2xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent'>
              {category ? categoryNames[category] || 'Каталог' : 'Весь каталог'}
            </h1>
            <p className='text-gray-600 mt-1 md:mt-2 text-sm md:text-base'>
              {category
                ? `Усі товари з категорії "${categoryNames[category]}"`
                : "Продукти приготовлені з любов'ю та турботою"}
            </p>
          </div>

          <div className='flex flex-col w-full md:w-auto gap-3'>
            <div className='relative w-full' data-aos='fade-left'>
              <FontAwesomeIcon
                icon={faSearch}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 text-sm'
              />
              <input
                type='text'
                placeholder='Поиск...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-8 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm transition-all duration-200 text-sm md:text-base'
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors'
                >
                  <FontAwesomeIcon icon={faTimes} className='text-xs' />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className='mb-6 overflow-x-auto pb-2' data-aos='fade-up'>
          <div className='flex gap-2 w-max'>
            {categoryFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => handleCategoryFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  category === filter.id || (!category && filter.id === 'all')
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 hover:shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 shadow-sm hover:shadow-md'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
            {filteredProducts.map((product, i) => (
              <div
                key={`${product.category}-${product.id}`}
                className='group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative'
                data-aos='fade-up'
                data-aos-delay={i * 50}
              >
                {product.isPopular && (
                  <div className='absolute top-2 left-2 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg'>
                    <FontAwesomeIcon icon={faFire} className='text-xs' />
                    <span>Хит</span>
                  </div>
                )}

                {product.rating > 4.5 && (
                  <div className='absolute top-2 right-2 z-20 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg'>
                    <FontAwesomeIcon icon={faStar} className='text-xs' />
                    <span>Топ</span>
                  </div>
                )}

                <div className='relative overflow-hidden h-48 md:h-64'>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10'></div>
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
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    onError={e => {
                      e.target.src = zaglushka
                    }}
                  />
                  <div className='absolute bottom-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded text-xs font-medium shadow-md z-20'>
                    {product.categoryName}
                  </div>
                </div>

                <div className='p-3 md:p-4'>
                  <div className='flex justify-between items-start mb-2'>
                    <h3 className='font-semibold text-sm md:text-base text-gray-900 line-clamp-1'>
                      {product.name}
                    </h3>
                    <span className='font-bold text-amber-600 whitespace-nowrap ml-2 text-sm md:text-base'>
                      {product.price}
                    </span>
                  </div>
                  <p className='text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2'>
                    {truncateDescription(product.description, 80)}
                  </p>

                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-500'>
                      {product.weight}
                    </span>
                    <div className='flex space-x-1 md:space-x-2'>
                      <Link
                        to={`/product/${product.category}/${product.id}`}
                        className='px-2 md:px-3 py-1 md:py-1.5 border border-amber-400 text-amber-600 hover:bg-amber-50 rounded-lg md:rounded-xl text-xs md:text-sm transition-all duration-200 flex items-center group/readmore hover:shadow-md'
                      >
                        <span className='hidden xs:inline'>Детальніше</span>
                        <span className='xs:hidden'>Деталі</span>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className='ml-1 text-xs transition-transform duration-200 group-hover/readmore:translate-x-1'
                        />
                      </Link>
                      <button
                        id={`add-to-cart-${product.id}`}
                        onClick={() => handleAddToCart(product)}
                        className='px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg md:rounded-xl text-xs md:text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 whitespace-nowrap'
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
          <div className='text-center py-10 md:py-16' data-aos='fade-up'>
            <div className='max-w-md mx-auto px-4'>
              <div className='w-16 h-16 md:w-24 md:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 animate-bounce'>
                <FontAwesomeIcon
                  icon={faSearch}
                  className='text-amber-500 text-xl md:text-3xl'
                />
              </div>
              <h3 className='text-xl md:text-2xl font-medium text-gray-800 mb-2'>
                Товари не знайдені
              </h3>
              <p className='text-gray-500 mb-4 md:mb-6 text-sm md:text-base'>
                Спробуйте змінити критерії пошуку або вибрати іншу категорію
              </p>
              <button
                onClick={clearFilters}
                className='px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg md:rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02]'
              >
                Сбросити усі фільтри
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
