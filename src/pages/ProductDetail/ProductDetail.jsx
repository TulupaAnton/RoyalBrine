import React from 'react'
import { useParams, Link } from 'react-router-dom'
import productsData from '../../data/products.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '../../store/cartStore'
import zaglushka from '../../assets/zaglushka.png'

const categoryNames = {
  pickles: 'Соління',
  smoked: 'Копченості',
  salads: 'Салати',
  'semi-finished': 'Напівфабрикати'
}

export function ProductDetail () {
  const { category, id } = useParams()
  const addToCart = useCartStore(state => state.addToCart)
  const product = productsData[category]?.find(item => item.id === parseInt(id))

  if (!product) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white'>
        <div className='text-center px-4'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>
            Товар не знайдено
          </h2>
          <Link
            to='/'
            className='inline-flex items-center text-amber-600 hover:text-amber-500 transition'
          >
            <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
            Повернутись на головну
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, category)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white py-14'>
      <div className='container mx-auto px-4 lg:px-8'>
        <Link
          to={`/catalog/${category}`}
          className='inline-flex items-center text-amber-600 hover:text-amber-500 transition mb-10 text-sm font-medium'
        >
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          Повернутись у секцію {categoryNames[category] || 'каталогу'}
        </Link>

        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto group transition duration-300'>
          <div className='md:flex'>
            <div className='md:w-1/2 overflow-hidden'>
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
                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                onError={e => {
                  e.target.src = zaglushka
                }}
              />
            </div>
            <div className='p-8 md:w-1/2 flex flex-col justify-between'>
              <div>
                <h1 className='text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4'>
                  {product.name}
                </h1>

                <div className='flex items-center mb-6 space-x-4'>
                  <span className='text-2xl font-bold text-amber-600'>
                    {product.price}
                  </span>
                  <span className='text-gray-500 text-sm'>
                    {product.weight}
                  </span>
                </div>

                {product.description.split('\n\n').map((part, index) => (
                  <p
                    key={index}
                    className={`leading-relaxed mb-4 ${
                      part.startsWith('Як готувати')
                        ? 'text-sm text-gray-600 bg-amber-100 border-l-4 border-amber-500 p-4 rounded-lg'
                        : 'text-gray-700'
                    }`}
                  >
                    {part}
                  </p>
                ))}
              </div>

              <button
                onClick={handleAddToCart}
                className='mt-auto w-full flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-full font-semibold text-sm shadow-md transition duration-200'
              >
                <FontAwesomeIcon icon={faShoppingCart} className='mr-2' />
                Додати у кошик
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
