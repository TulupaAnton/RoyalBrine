import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import productsData from '../../data/products.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faShoppingCart,
  faChevronLeft,
  faChevronRight,
  faLeaf,
  faSeedling,
  faStar,
  faFlask,
  faTint,
  faCheck
} from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '../../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.png'

const categoryNames = {
  pickles: 'Соління',
  smoked: 'Копченості',
  salads: 'Салати',
  kylinary: 'Кулінарія',
  'semi-finished': 'Напівфабрикати'
}

export function ProductDetail () {
  const { category, id } = useParams()
  const addToCart = useCartStore(state => state.addToCart)
  const product = productsData[category]?.find(item => item.id === parseInt(id))

  // Автоматически определяем тип товара по формату цены и веса
  const isPieceProduct =
    product?.price.includes('/шт') ||
    product?.weight.includes('шт') ||
    product?.weight.includes('порц')

  const isLiquidProduct =
    product?.price.includes('/л') ||
    product?.weight.includes('л') ||
    product?.weight.includes('літр')

  const isBucketProduct = product?.bucket === true

  const [selectedWeight, setSelectedWeight] = useState(1)
  const [selectedPieces, setSelectedPieces] = useState(1)
  const [selectedLiters, setSelectedLiters] = useState(1)
  const [selectedBucketOption, setSelectedBucketOption] = useState('weight') // 'weight' или 'bucket'
  const [selectedBucketSize, setSelectedBucketSize] = useState(0.7) // размер ведра в кг
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [direction, setDirection] = useState(0)

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

  // Извлекаем базовую цену в зависимости от типа товара
  const getBasePrice = () => {
    if (isPieceProduct) {
      // Для поштучных товаров убираем "/шт" и " грн"
      return parseFloat(
        product.price.replace('/шт', '').replace(' грн', '').replace(',', '.')
      )
    } else if (isLiquidProduct) {
      // Для жидких товаров убираем "/л" и " грн"
      return parseFloat(
        product.price.replace('/л', '').replace(' грн', '').replace(',', '.')
      )
    } else {
      // Для весовых товаров убираем " грн"
      return parseFloat(product.price.replace(' грн', '').replace(',', '.'))
    }
  }

  const basePrice = getBasePrice()

  // Опции в зависимости от типа товара
  const weightOptions = [0.5, 1, 2, 3]
  const pieceOptions = [1, 2, 3, 5, 10]
  const literOptions = [0.5, 1, 2, 3, 5]
  const bucketSizeOptions = [
    { value: 0.7, label: '700 г' },
    { value: 3, label: '3 кг' },
    { value: 5, label: '5 кг' },
    { value: 10, label: '10 кг' }
  ]

  // Расчет цены и отображаемой величины
  const getCalculatedPrice = () => {
    if (isPieceProduct) {
      return (basePrice * selectedPieces).toFixed(2) + ' грн'
    } else if (isLiquidProduct) {
      return (basePrice * selectedLiters).toFixed(2) + ' грн'
    } else if (isBucketProduct && selectedBucketOption === 'bucket') {
      // Для ведра цена рассчитывается как базовая цена * размер ведра
      return (basePrice * selectedBucketSize).toFixed(2) + ' грн'
    } else {
      return (basePrice * selectedWeight).toFixed(2) + ' грн'
    }
  }

  const getDisplayAmount = () => {
    if (isPieceProduct) {
      return selectedPieces + ' шт'
    } else if (isLiquidProduct) {
      return selectedLiters + ' л'
    } else if (isBucketProduct && selectedBucketOption === 'bucket') {
      return selectedBucketSize + ' кг (у відрі)'
    } else {
      return selectedWeight + ' кг'
    }
  }

  const calculatedPrice = getCalculatedPrice()
  const displayAmount = getDisplayAmount()

  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      price: calculatedPrice,
      weight: displayAmount,
      pieces: isPieceProduct ? selectedPieces : null,
      liters: isLiquidProduct ? selectedLiters : null,
      bucketSize:
        isBucketProduct && selectedBucketOption === 'bucket'
          ? selectedBucketSize
          : null,
      bucketOption: isBucketProduct ? selectedBucketOption : null,
      unitType: isPieceProduct
        ? 'piece'
        : isLiquidProduct
        ? 'liquid'
        : isBucketProduct
        ? selectedBucketOption === 'bucket'
          ? 'bucket'
          : 'weight'
        : 'weight',
      quantity: quantity
    }
    addToCart(productToAdd, category)
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image]

  const paginate = newDirection => {
    setDirection(newDirection)
    setCurrentImageIndex(
      prev => (prev + newDirection + images.length) % images.length
    )
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
            <div className='md:w-1/2 overflow-hidden flex flex-col items-center'>
              <div className='relative w-full h-200'>
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={currentImageIndex}
                    src={
                      images[currentImageIndex]
                        ? new URL(
                            `../../assets/products/${images[currentImageIndex]}`,
                            import.meta.url
                          ).href
                        : zaglushka
                    }
                    alt={product.name}
                    className='absolute w-full h-full object-cover'
                    custom={direction}
                    variants={{
                      enter: dir => ({
                        x: dir > 0 ? 300 : -300,
                        opacity: 0
                      }),
                      center: {
                        x: 0,
                        opacity: 1
                      },
                      exit: dir => ({
                        x: dir < 0 ? 300 : -300,
                        opacity: 0
                      })
                    }}
                    initial='enter'
                    animate='center'
                    exit='exit'
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    onError={e => {
                      e.target.src = zaglushka
                    }}
                  />
                </AnimatePresence>
                <button
                  type='button'
                  onClick={() => paginate(-1)}
                  className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow'
                >
                  <FontAwesomeIcon icon={faChevronLeft} size='lg' />
                </button>
                <button
                  type='button'
                  onClick={() => paginate(1)}
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 shadow'
                >
                  <FontAwesomeIcon icon={faChevronRight} size='lg' />
                </button>
              </div>
              <div className='flex gap-2 mt-4 justify-center'>
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={
                      new URL(`../../assets/products/${img}`, import.meta.url)
                        .href
                    }
                    alt={`Preview ${index}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border ${
                      index === currentImageIndex
                        ? 'border-amber-500'
                        : 'border-gray-300'
                    }`}
                    onError={e => {
                      e.target.src = zaglushka
                    }}
                  />
                ))}
              </div>
            </div>

            <div className='p-8 md:w-1/2 flex flex-col justify-between'>
              <div>
                <h1 className='text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4'>
                  {product.name}
                </h1>
                {/* Блок с составом продукции */}
                <div className='mb-6'>
                  <div className='flex items-center space-x-4 mb-4'>
                    <span className='text-2xl font-bold text-amber-600'>
                      {calculatedPrice}
                    </span>
                    <span className='text-gray-500 text-sm'>
                      {displayAmount}
                      {(isPieceProduct || isLiquidProduct) &&
                        product.weight && (
                          <span className='ml-1 text-xs'>
                            ({product.weight})
                          </span>
                        )}
                    </span>
                  </div>

                  {/* Блок выбора для товаров в ведре */}
                  {isBucketProduct && (
                    <div className='mb-4'>
                      <label className='block text-gray-700 mb-2 font-medium'>
                        Способ покупки:
                      </label>
                      <div className='flex flex-wrap gap-2 mb-3'>
                        <button
                          type='button'
                          onClick={() => setSelectedBucketOption('weight')}
                          className={`px-4 py-2 rounded-full border ${
                            selectedBucketOption === 'weight'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                          } transition-colors`}
                        >
                          На вагу (без відра)
                        </button>
                        <button
                          type='button'
                          onClick={() => setSelectedBucketOption('bucket')}
                          className={`px-4 py-2 rounded-full border ${
                            selectedBucketOption === 'bucket'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                          } transition-colors`}
                        >
                          У відрі
                        </button>
                      </div>

                      {selectedBucketOption === 'weight' && (
                        <div className='mt-2'>
                          <label className='block text-gray-700 mb-2 font-medium'>
                            Оберіть вагу:
                          </label>
                          <div className='flex flex-wrap gap-2'>
                            {weightOptions.map(weight => (
                              <button
                                key={weight}
                                type='button'
                                onClick={() => setSelectedWeight(weight)}
                                className={`px-4 py-2 rounded-full border ${
                                  selectedWeight === weight
                                    ? 'bg-amber-500 text-white border-amber-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                                } transition-colors`}
                              >
                                {weight} кг
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedBucketOption === 'bucket' && (
                        <div className='mt-2'>
                          <label className='block text-gray-700 mb-2 font-medium'>
                            Оберіть розмір відра:
                          </label>
                          <div className='flex flex-wrap gap-2'>
                            {bucketSizeOptions.map(option => (
                              <button
                                key={option.value}
                                type='button'
                                onClick={() =>
                                  setSelectedBucketSize(option.value)
                                }
                                className={`px-4 py-2 rounded-full border ${
                                  selectedBucketSize === option.value
                                    ? 'bg-amber-500 text-white border-amber-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                                } transition-colors`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Блок выбора веса, количества штук или литров для обычных товаров */}
                  {!isBucketProduct && !isPieceProduct && !isLiquidProduct && (
                    <div className='mb-4'>
                      <label className='block text-gray-700 mb-2 font-medium'>
                        Оберіть вагу:
                      </label>
                      <div className='flex flex-wrap gap-2'>
                        {weightOptions.map(weight => (
                          <button
                            key={weight}
                            type='button'
                            onClick={() => setSelectedWeight(weight)}
                            className={`px-4 py-2 rounded-full border ${
                              selectedWeight === weight
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                            } transition-colors`}
                          >
                            {weight} кг
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isPieceProduct && (
                    <div className='mb-4'>
                      <label className='block text-gray-700 mb-2 font-medium'>
                        Оберіть кількість:
                      </label>
                      <div className='flex flex-wrap gap-2'>
                        {pieceOptions.map(pieces => (
                          <button
                            key={pieces}
                            type='button'
                            onClick={() => setSelectedPieces(pieces)}
                            className={`px-4 py-2 rounded-full border ${
                              selectedPieces === pieces
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                            } transition-colors`}
                          >
                            {pieces} шт
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLiquidProduct && (
                    <div className='mb-4'>
                      <label className='block text-gray-700 mb-2 font-medium'>
                        Оберіть об'єм:
                      </label>
                      <div className='flex flex-wrap gap-2'>
                        {literOptions.map(liters => (
                          <button
                            key={liters}
                            type='button'
                            onClick={() => setSelectedLiters(liters)}
                            className={`px-4 py-2 rounded-full border ${
                              selectedLiters === liters
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                            } transition-colors`}
                          >
                            {liters} л
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Блок количества упаковок (общий для всех типов) */}
                  <div className='mb-4'>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Кількість{' '}
                      {isPieceProduct
                        ? 'упаковок'
                        : isLiquidProduct
                        ? 'пляшок'
                        : isBucketProduct && selectedBucketOption === 'bucket'
                        ? 'відер'
                        : 'порцій'}
                      :
                    </label>
                    <div className='flex items-center'>
                      <button
                        type='button'
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className='px-3 py-1 bg-gray-200 rounded-l-lg hover:bg-gray-300 transition'
                      >
                        -
                      </button>
                      <span className='px-4 py-1 bg-gray-100'>{quantity}</span>
                      <button
                        type='button'
                        onClick={() => setQuantity(quantity + 1)}
                        className='px-3 py-1 bg-gray-200 rounded-r-lg hover:bg-gray-300 transition'
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {product.compound && (
                    <div className='mb-6 p-6 bg-amber-100 rounded-xl border border-amber-200 shadow-sm'>
                      <div className='flex items-center mb-5'>
                        <FontAwesomeIcon
                          icon={faSeedling} // Иконка ростка
                          className='text-amber-600 text-xl mr-3'
                        />
                        <h3 className='text-xl font-bold text-amber-900'>
                          100% Натуральний склад
                        </h3>
                      </div>

                      <div className='mb-4'>
                        <p className='text-amber-700 text-sm mb-4'>
                          Ми використовуємо тільки натуральні інгредієнти, які
                          приносять користь вашому організму:
                        </p>

                        <div className='space-y-3'>
                          {product.compound
                            .split(', ')
                            .map((ingredient, index) => {
                              // Функция для выбора иконки в зависимости от ингредиента
                              const getIconForIngredient = ing => {
                                const lowerIng = ing.toLowerCase()
                                if (
                                  lowerIng.includes('вітамін') ||
                                  lowerIng.includes('vitamin')
                                )
                                  return faStar
                                if (
                                  lowerIng.includes('екстракт') ||
                                  lowerIng.includes('extract')
                                )
                                  return faFlask
                                if (
                                  lowerIng.includes('олія') ||
                                  lowerIng.includes('oil')
                                )
                                  return faTint
                                if (
                                  lowerIng.includes('рослин') ||
                                  lowerIng.includes('herb')
                                )
                                  return faLeaf
                                return faCheck
                              }

                              return (
                                <div
                                  key={index}
                                  className='flex items-center p-3 bg-white rounded-lg border border-amber-100 hover:shadow transition-shadow'
                                >
                                  <FontAwesomeIcon
                                    icon={getIconForIngredient(ingredient)}
                                    className='text-amber-500 mr-3 text-sm'
                                  />
                                  <span className='text-amber-800 font-medium'>
                                    {ingredient.trim()}
                                  </span>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className='space-y-8'>
                  {product.description.split('\n\n').map((part, index) => {
                    const isCookingSection = part.startsWith('Як готувати')
                    const isFeaturesSection = part.startsWith('Особливості')
                    const isDescriptionSection = part.startsWith('Опис')

                    const sectionStyles = isCookingSection
                      ? 'bg-gradient-to-br from-amber-50 to-orange-100 border-l-8 border-amber-500 shadow-md'
                      : isFeaturesSection
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-100 border-l-8 border-emerald-500 shadow-md'
                      : isDescriptionSection
                      ? 'bg-gradient-to-br from-blue-50 to-cyan-100 border-l-8 border-blue-500 shadow-md'
                      : 'bg-gray-100 border-l-8 border-gray-400'

                    const textColor = isCookingSection
                      ? 'text-amber-900'
                      : isFeaturesSection
                      ? 'text-emerald-900'
                      : isDescriptionSection
                      ? 'text-blue-900'
                      : 'text-gray-800'

                    const Icon = isCookingSection
                      ? faFlask
                      : isFeaturesSection
                      ? faStar
                      : isDescriptionSection
                      ? faLeaf
                      : null

                    const title = isCookingSection
                      ? 'Спосіб приготування'
                      : isFeaturesSection
                      ? 'Особливості продукту'
                      : isDescriptionSection
                      ? 'Детальний опис'
                      : ''

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: index * 0.12 }}
                        className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${sectionStyles}`}
                      >
                        {/* Decorative corner elements */}
                        <div className='absolute top-0 right-0 w-28 h-28 bg-white/20 rounded-bl-full opacity-30' />
                        <div className='absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-tr-full opacity-20' />

                        {/* Header */}
                        {(isCookingSection ||
                          isFeaturesSection ||
                          isDescriptionSection) && (
                          <div className='flex items-center mb-4 relative z-10'>
                            <FontAwesomeIcon
                              icon={Icon}
                              className='mr-4 text-2xl opacity-80'
                            />
                            <h3 className='text-2xl font-extrabold tracking-wide drop-shadow-sm'>
                              {title}
                            </h3>
                          </div>
                        )}

                        {/* Text */}
                        <p
                          className={`relative z-10 leading-relaxed text-lg ${textColor}`}
                        >
                          {part.replace(
                            /^(Як готувати|Особливості|Опис):?\s*/,
                            ''
                          )}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className='mt-8 w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5'
              >
                <FontAwesomeIcon icon={faShoppingCart} className='mr-3' />
                Додати у кошик ({calculatedPrice})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
