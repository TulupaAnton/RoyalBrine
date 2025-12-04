import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { database } from '../../lib/productSuperbase'
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
import zaglushka from '../../assets/zaglushka.jpg'
import { toast } from 'react-hot-toast'

const categoryNames = {
  pickles: 'Соління',
  smoked: 'Копченості',
  salads: 'Салати',
  cooking: 'Кулінарія',
  'semi-finished': 'Напівфабрикати'
}

export function ProductDetail () {
  const { category, id } = useParams()
  const addToCart = useCartStore(state => state.addToCart)

  // ========= STATE ==========
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedWeight, setSelectedWeight] = useState(1)
  const [selectedPieces, setSelectedPieces] = useState(1)
  const [selectedLiters, setSelectedLiters] = useState(1)
  const [selectedBucketOption, setSelectedBucketOption] = useState('weight')
  const [selectedBucketSize, setSelectedBucketSize] = useState(1)
  const [quantity, setQuantity] = useState(1)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // ============ load product ============
  useEffect(() => {
    const load = async () => {
      const { data, error } = await database
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) console.error(error)
      setProduct(data)
      setLoading(false)
    }

    load()
  }, [id])

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center text-lg'>
        Завантаження...
      </div>
    )

  if (!product)
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

  // ===== determine product type =====
  const isPieceProduct =
    product.price?.includes('/шт') ||
    product.weight?.includes('шт') ||
    product.weight?.includes('порц')

  const isLiquidProduct =
    product.price?.includes('/л') ||
    product.weight?.includes('л') ||
    product.weight?.includes('літр')

  const isBucketProduct = product.bucket === true

  // ===== base price =====
  const getBasePrice = () => {
    if (isPieceProduct)
      return parseFloat(product.price.replace('/шт', '').replace(' грн', ''))
    if (isLiquidProduct)
      return parseFloat(product.price.replace('/л', '').replace(' грн', ''))
    return parseFloat(product.price.replace(' грн', ''))
  }

  const basePrice = getBasePrice()

  // ===== calc final price =====
  const getCalculatedPrice = () => {
    if (isPieceProduct) return (basePrice * selectedPieces).toFixed(2) + ' грн'
    if (isLiquidProduct) return (basePrice * selectedLiters).toFixed(2) + ' грн'
    if (isBucketProduct && selectedBucketOption === 'bucket')
      return (basePrice * selectedBucketSize).toFixed(2) + ' грн'
    return (basePrice * selectedWeight).toFixed(2) + ' грн'
  }

  const calculatedPrice = getCalculatedPrice()

  const getDisplayAmount = () => {
    if (isPieceProduct) return selectedPieces + ' шт'
    if (isLiquidProduct) return selectedLiters + ' л'
    if (isBucketProduct && selectedBucketOption === 'bucket')
      return selectedBucketSize + ' кг (у відрі)'
    return selectedWeight + ' кг'
  }

  const displayAmount = getDisplayAmount()

  // ========== add to cart ==========
  const handleAddToCart = () => {
    if (product.isAccessible) return

    addToCart(
      {
        ...product,
        price: calculatedPrice,
        weight: displayAmount,
        quantity
      },
      category
    )

    toast.success(`${product.name} додано до кошика`)
  }

  // ========== carousel ==========
  const images = product.images?.length > 0 ? product.images : [zaglushka]

  const paginate = dir => {
    setDirection(dir)
    setCurrentImageIndex(prev => (prev + dir + images.length) % images.length)
  }

  // ===== options =====
  const weightOptions = [0.5, 1, 2, 3]
  const pieceOptions = [1, 2, 3, 5, 10]
  const literOptions = [1, 2, 3, 5]
  const bucketSizeOptions = [
    { value: 1, label: '1 кг' },
    { value: 3, label: '3 кг' },
    { value: 5, label: '5 кг' },
    { value: 10, label: '10 кг' }
  ]

  // ===== UI =====
  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white py-14'>
      <div className='container mx-auto px-4 lg:px-8'>
        <Link
          to={`/catalog/${category}`}
          className='inline-flex items-center text-amber-600 hover:text-amber-500 transition mb-10 text-sm font-medium'
        >
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          Повернутись у секцію {categoryNames[category]}
        </Link>

        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto group'>
          <div className='md:flex'>
            {/* ======================= ГАЛЕРЕЯ ======================= */}
            <div className='md:w-1/2 overflow-hidden flex flex-col items-center'>
              <div className='relative w-full h-200'>
                {/* КАРУСЕЛЬ */}
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
                    className={`absolute w-full h-full object-cover ${
                      product.isAccessible ? 'opacity-60' : ''
                    }`}
                    custom={direction}
                    variants={{
                      enter: dir => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: dir => ({ x: dir < 0 ? 300 : -300, opacity: 0 })
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

                {/* ЗАТЕМНЕНИЕ ТОЛЬКО НА ИЗОБРАЖЕНИЕ */}
                {product.isAccessible && (
                  <div className='absolute inset-0 bg-black/50 backdrop-blur-[1px] z-20 flex items-center justify-center'>
                    <span className='text-white text-xl font-semibold drop-shadow-lg'>
                      Товар скоро з’явиться
                    </span>
                  </div>
                )}

                {/* КНОПКИ ЛИСТАНИЯ */}
                <button
                  type='button'
                  onClick={() => paginate(-1)}
                  className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow z-30'
                >
                  <FontAwesomeIcon icon={faChevronLeft} size='lg' />
                </button>

                <button
                  type='button'
                  onClick={() => paginate(1)}
                  className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow z-30'
                >
                  <FontAwesomeIcon icon={faChevronRight} size='lg' />
                </button>
              </div>

              {/* превью */}
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
                    onError={e => (e.target.src = zaglushka)}
                  />
                ))}
              </div>
            </div>

            {/* ======================= ПРАВАЯ ЧАСТЬ ======================= */}
            <div className='p-8 md:w-1/2 flex flex-col justify-between'>
              <div>
                <h1 className='text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4'>
                  {product.name}
                </h1>

                <div className='flex items-center space-x-4 mb-4'>
                  <span className='text-2xl font-bold text-amber-600'>
                    {calculatedPrice}
                  </span>
                  <span className='text-gray-500 text-sm'>{displayAmount}</span>
                </div>

                {/* ================== СПОСОБЫ ПОКУПКИ ================== */}
                {product.bucket && (
                  <div className='mb-4'>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Спосіб покупки:
                    </label>

                    <div className='flex flex-wrap gap-2 mb-3'>
                      <button
                        type='button'
                        onClick={() => setSelectedBucketOption('weight')}
                        className={`px-4 py-2 rounded-full border ${
                          selectedBucketOption === 'weight'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                        }`}
                      >
                        На вагу
                      </button>

                      <button
                        type='button'
                        onClick={() => setSelectedBucketOption('bucket')}
                        className={`px-4 py-2 rounded-full border ${
                          selectedBucketOption === 'bucket'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                        }`}
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
                          {weightOptions.map(w => (
                            <button
                              key={w}
                              onClick={() => setSelectedWeight(w)}
                              className={`px-4 py-2 rounded-full border ${
                                selectedWeight === w
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                              }`}
                            >
                              {w} кг
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedBucketOption === 'bucket' && (
                      <div className='mt-2'>
                        <label className='block text-gray-700 mb-2 font-medium'>
                          Оберіть відро:
                        </label>
                        <div className='flex flex-wrap gap-2'>
                          {bucketSizeOptions.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setSelectedBucketSize(opt.value)}
                              className={`px-4 py-2 rounded-full border ${
                                selectedBucketSize === opt.value
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* весовые */}
                {!product.bucket && !isPieceProduct && !isLiquidProduct && (
                  <div className='mb-4'>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Оберіть вагу:
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {weightOptions.map(w => (
                        <button
                          key={w}
                          onClick={() => setSelectedWeight(w)}
                          className={`px-4 py-2 rounded-full border ${
                            selectedWeight === w
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                          }`}
                        >
                          {w} кг
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* штучні */}
                {isPieceProduct && (
                  <div className='mb-4'>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Оберіть кількість:
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {pieceOptions.map(p => (
                        <button
                          key={p}
                          onClick={() => setSelectedPieces(p)}
                          className={`px-4 py-2 rounded-full border ${
                            selectedPieces === p
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                          }`}
                        >
                          {p} шт
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* літрові */}
                {isLiquidProduct && (
                  <div className='mb-4'>
                    <label className='block text-gray-700 mb-2 font-medium'>
                      Оберіть об'єм:
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {literOptions.map(l => (
                        <button
                          key={l}
                          onClick={() => setSelectedLiters(l)}
                          className={`px-4 py-2 rounded-full border ${
                            selectedLiters === l
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                          }`}
                        >
                          {l} л
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* кількість упаковок */}
                <div className='mb-4'>
                  <label className='block text-gray-700 mb-2 font-medium'>
                    Кількість:
                  </label>
                  <div className='flex items-center'>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className='px-3 py-1 bg-gray-200 rounded-l-lg hover:bg-gray-300'
                    >
                      -
                    </button>
                    <span className='px-4 py-1 bg-gray-100'>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className='px-3 py-1 bg-gray-200 rounded-r-lg hover:bg-gray-300'
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* склад */}
                {product.compound && (
                  <div className='mb-6 p-6 bg-amber-100 rounded-xl border border-amber-200 shadow-sm'>
                    <div className='flex items-center mb-5'>
                      <FontAwesomeIcon
                        icon={faSeedling}
                        className='text-amber-600 text-xl mr-3'
                      />
                      <h3 className='text-xl font-bold text-amber-900'>
                        100% Натуральний склад
                      </h3>
                    </div>

                    <div className='space-y-3'>
                      {product.compound.split(',').map((ingredient, index) => {
                        const text = ingredient.trim().toLowerCase()

                        let icon = faCheck
                        if (text.includes('вітамін')) icon = faStar
                        if (text.includes('екстракт')) icon = faFlask
                        if (text.includes('олія')) icon = faTint
                        if (text.includes('рослин')) icon = faLeaf

                        return (
                          <div
                            key={index}
                            className='flex items-center p-3 bg-white rounded-lg border border-amber-100 hover:shadow transition-shadow'
                          >
                            <FontAwesomeIcon
                              icon={icon}
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
                )}
              </div>

              {/* ======================= ОПИС ======================= */}
              <div className='space-y-8 p-8'>
                {product.description.split('\n\n').map((part, index) => {
                  const isCooking = part.startsWith('Як готувати')
                  const isFeature = part.startsWith('Особливості')
                  const isDesc = part.startsWith('Опис')

                  const sectionBg = isCooking
                    ? 'bg-gradient-to-br from-amber-50 to-orange-100 border-l-8 border-amber-500'
                    : isFeature
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-100 border-l-8 border-emerald-500'
                    : isDesc
                    ? 'bg-gradient-to-br from-blue-50 to-cyan-100 border-l-8 border-blue-500'
                    : 'bg-gray-100 border-l-8 border-gray-400'

                  const title = isCooking
                    ? 'Спосіб приготування'
                    : isFeature
                    ? 'Особливості продукту'
                    : isDesc
                    ? 'Детальний опис'
                    : ''

                  const icon = isCooking
                    ? faFlask
                    : isFeature
                    ? faStar
                    : isDesc
                    ? faLeaf
                    : null

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45 }}
                      className={`relative overflow-hidden rounded-3xl p-8 shadow-sm ${sectionBg}`}
                    >
                      {title && (
                        <div className='flex items-center mb-4 relative z-10'>
                          <FontAwesomeIcon
                            icon={icon}
                            className='mr-4 text-2xl opacity-80'
                          />
                          <h3 className='text-2xl font-extrabold tracking-wide'>
                            {title}
                          </h3>
                        </div>
                      )}

                      <p className='relative z-10 leading-relaxed text-lg'>
                        {part.replace(
                          /^(Як готувати|Особливості|Опис):?\s*/,
                          ''
                        )}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              {/* ======================= ADD TO CART ======================= */}
              <button
                onClick={!product.isAccessible ? handleAddToCart : null}
                disabled={product.isAccessible}
                className={`mt-8 w-full flex items-center justify-center px-6 py-4 rounded-2xl font-bold text-base shadow-lg transition-all duration-300
                  ${
                    product.isAccessible
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 text-white'
                  }
                `}
              >
                <FontAwesomeIcon icon={faShoppingCart} className='mr-3' />
                {product.isAccessible
                  ? 'Товар недоступний'
                  : `Додати у кошик (${calculatedPrice})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
