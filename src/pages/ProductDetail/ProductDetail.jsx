import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  faCheck,
  faGift,
  faTree,
  faSnowflake,
  faHome,
  faCookieBite,
  faWeightHanging
} from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '../../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.jpg'
import { toast } from 'react-hot-toast'

// Используем только один набор иконок
const FaIcons = {
  Snowflake: () => <span>❄️</span>,
  Tree: () => <span>🌲</span>,
  Gift: () => <span>🎁</span>,
  Star: () => <span>⭐</span>
}

const categoryNames = {
  pickles: 'Соління',
  smoked: 'Копченості',
  salads: 'Салати',
  cooking: 'Кулінарія',
  'semi-finished': 'Напівфабрикати'
}

// Константы вынесены за пределы компонента
const SNOWFLAKE_COUNT = 12 // Уменьшено количество снежинок
const weightOptions = [0.5, 1, 2, 3]
const pieceOptions = [1, 2, 3, 5, 10]
const literOptions = [1, 2, 3, 5]
const gramOptions = [80, 100, 250, 500, 1000]
const bucketSizeOptions = [
  { value: 1, label: '1 кг' },
  { value: 3, label: '3 кг' },
  { value: 5, label: '5 кг' },
  { value: 10, label: '10 кг' }
]

export function ProductDetail () {
  const { category, id } = useParams()
  const addToCart = useCartStore(state => state.addToCart)

  // ========= STATE ==========
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedWeight, setSelectedWeight] = useState(1)
  const [selectedPieces, setSelectedPieces] = useState(1)
  const [selectedLiters, setSelectedLiters] = useState(1)
  const [selectedGrams, setSelectedGrams] = useState(100)
  const [selectedBucketOption, setSelectedBucketOption] = useState('weight')
  const [selectedBucketSize, setSelectedBucketSize] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Мемоизированные снежинки
  const snowflakes = useMemo(
    () =>
      Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 2, // Уменьшен максимальный размер
        delay: Math.random() * 5
      })),
    []
  )

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

  // Мемоизированное определение типа продукта
  const productType = useMemo(() => {
    if (!product) return {}

    const isPieceProduct =
      product.price?.includes('/шт') ||
      product.weight?.includes('шт') ||
      product.weight?.includes('порц')

    const isGramProduct =
      product.price?.includes('/100 гр') ||
      product.price?.includes('/100гр') ||
      product.weight?.includes('гр')

    const isLiquidProduct =
      product.price?.includes('/л') ||
      product.weight?.includes('л') ||
      product.weight?.includes('літр')

    return { isPieceProduct, isGramProduct, isLiquidProduct }
  }, [product])

  // ===== base price =====
  const basePrice = useMemo(() => {
    if (!product) return 0

    const { isPieceProduct, isGramProduct, isLiquidProduct } = productType

    if (isPieceProduct)
      return parseFloat(product.price.replace('/шт', '').replace(' грн', ''))
    if (isLiquidProduct)
      return parseFloat(product.price.replace('/л', '').replace(' грн', ''))
    if (isGramProduct)
      return parseFloat(
        product.price
          .replace('/100 гр', '')
          .replace('/100гр', '')
          .replace(' грн', '')
      )

    return parseFloat(product.price.replace(' грн', ''))
  }, [product, productType])

  // ===== calc final price =====
  const { calculatedPrice, displayAmount } = useMemo(() => {
    if (!product) return { calculatedPrice: '0 грн', displayAmount: '' }

    const { isPieceProduct, isGramProduct, isLiquidProduct } = productType
    const isBucketProduct = product.bucket === true

    let price = 0
    let amount = ''

    if (isPieceProduct) {
      price = (basePrice * selectedPieces).toFixed(2)
      amount = selectedPieces + ' шт'
    } else if (isLiquidProduct) {
      price = (basePrice * selectedLiters).toFixed(2)
      amount = selectedLiters + ' л'
    } else if (isGramProduct) {
      price = ((basePrice / 100) * selectedGrams).toFixed(2)
      amount =
        selectedGrams >= 1000
          ? selectedGrams / 1000 + ' кг'
          : selectedGrams + ' гр'
    } else if (isBucketProduct && selectedBucketOption === 'bucket') {
      price = (basePrice * selectedBucketSize).toFixed(2)
      amount = selectedBucketSize + ' кг (у відрі)'
    } else {
      price = (basePrice * selectedWeight).toFixed(2)
      amount = selectedWeight + ' кг'
    }

    return {
      calculatedPrice: price + ' грн',
      displayAmount: amount
    }
  }, [
    product,
    productType,
    basePrice,
    selectedWeight,
    selectedPieces,
    selectedLiters,
    selectedGrams,
    selectedBucketOption,
    selectedBucketSize
  ])

  // ========== add to cart ==========
  const handleAddToCart = useCallback(() => {
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

    toast.success(`🎁 ${product.name} додано до новорічного кошика!`)
  }, [product, calculatedPrice, displayAmount, quantity, category, addToCart])

  // ========== carousel ==========
  const images = useMemo(
    () => (product?.images?.length > 0 ? product.images : [zaglushka]),
    [product]
  )

  const paginate = useCallback(
    dir => {
      setDirection(dir)
      setCurrentImageIndex(prev => (prev + dir + images.length) % images.length)
    },
    [images.length]
  )

  // ===== lazy image loading =====
  const getImageUrl = useCallback(img => {
    if (!img) return zaglushka
    try {
      return new URL(`../../assets/products/${img}`, import.meta.url).href
    } catch {
      return zaglushka
    }
  }, [])

  // ===== UI состояния =====
  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-green-950 via-red-900 to-green-950'>
        <div className='text-center'>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
            className='text-6xl mb-4'
          >
            🎄
          </motion.div>
          <p className='text-amber-300 text-xl'>
            Завантаження святкового товару...
          </p>
        </div>
      </div>
    )

  if (!product)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-green-950 via-red-900 to-green-950'>
        <div className='text-center px-4'>
          <h2 className='text-2xl font-bold text-amber-300 mb-4'>
            Товар не знайдено
          </h2>
          <Link
            to='/'
            className='inline-flex items-center text-amber-300 hover:text-yellow-300 transition group'
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className='mr-2 group-hover:-translate-x-1 transition-transform'
            />
            Повернутись на святкову головну
          </Link>
        </div>
      </div>
    )

  const { isPieceProduct, isGramProduct, isLiquidProduct } = productType

  return (
    <div className='min-h-screen bg-gradient-to-b from-green-950 via-red-900 to-green-950 py-4 md:py-8 relative overflow-hidden'>
      {/* Анимированные снежинки - оптимизированы */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {snowflakes.map(flake => (
          <motion.div
            key={flake.id}
            className='absolute text-white/5 select-none' // Уменьшена прозрачность
            style={{
              left: flake.left,
              fontSize: `${flake.size}px`,
              willChange: 'transform' // Оптимизация для анимации
            }}
            initial={{ y: -50 }}
            animate={{ y: '100vh' }}
            transition={{
              duration: 4 + Math.random() * 6, // Немного медленнее
              delay: flake.delay,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: Math.random() * 2
            }}
          >
            ❄️
          </motion.div>
        ))}
      </div>

      <div className='container mx-auto px-3 md:px-4 lg:px-8 relative z-10'>
        {/* Новогодние хлебные крошки */}
        <Link
          to={`/catalog/${category}`}
          className='inline-flex items-center text-amber-300 hover:text-yellow-300 transition mb-6 text-sm font-medium group'
        >
          <motion.div
            className='mr-2 md:mr-3'
            whileHover={{ rotate: -20 }}
            transition={{ type: 'spring' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </motion.div>
          <span className='bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent'>
            Повернутись до новорічної секції {categoryNames[category]}
          </span>
        </Link>

        {/* Главный контейнер */}
        <div className='bg-gradient-to-br from-red-900/90 via-green-900/90 to-red-900/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden max-w-6xl mx-auto border border-amber-500/30'>
          <div className='md:flex'>
            {/* ======================= ГАЛЕРЕЯ ======================= */}
            <div className='w-full lg:w-[60%] overflow-hidden flex flex-col items-center p-3 md:p-4 lg:p-8 relative'>
              <div className='relative w-full h-[280px] sm:h-[350px] md:h-[420px] lg:h-[520px] rounded-xl md:rounded-2xl overflow-hidden border-2 md:border-4 border-amber-500/20 shadow-lg'>
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={currentImageIndex}
                    src={getImageUrl(images[currentImageIndex])}
                    alt={product.name}
                    loading='lazy'
                    className={`absolute w-full h-full object-cover ${
                      product.isAccessible ? 'opacity-60 grayscale' : ''
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

                {product.isAccessible && (
                  <div className='absolute inset-0 bg-gradient-to-br from-red-900/60 to-green-900/60 backdrop-blur-sm z-20 flex items-center justify-center'>
                    <div className='text-center p-4 md:p-6 bg-gradient-to-r from-amber-900/80 to-red-900/80 rounded-xl md:rounded-2xl border border-amber-500/50'>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className='text-3xl md:text-4xl mb-2 md:mb-3'
                      >
                        🎅
                      </motion.div>
                      <span className='text-white text-lg md:text-xl font-semibold drop-shadow-lg'>
                        Товар з'явиться зовсім скоро!
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type='button'
                  onClick={() => paginate(-1)}
                  className='absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full p-2 md:p-3 shadow-lg z-30 hover:scale-110 transition-transform active:scale-95'
                  aria-label='Попереднє зображення'
                >
                  <FontAwesomeIcon icon={faChevronLeft} size='sm' />
                </button>

                <button
                  type='button'
                  onClick={() => paginate(1)}
                  className='absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full p-2 md:p-3 shadow-lg z-30 hover:scale-110 transition-transform active:scale-95'
                  aria-label='Наступне зображення'
                >
                  <FontAwesomeIcon icon={faChevronRight} size='sm' />
                </button>

                <div className='absolute top-3 md:top-4 right-3 md:right-4 bg-gradient-to-r from-red-600 to-amber-600 text-white px-3 md:px-4 py-1 md:py-2 rounded-full shadow-lg z-30'>
                  <span className='font-bold text-sm md:text-base'>
                    {calculatedPrice}
                  </span>
                </div>
              </div>

              <div className='flex gap-2 md:gap-3 mt-4 md:mt-6 justify-center flex-wrap'>
                {images.map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Preview ${index}`}
                      loading='lazy'
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-cover rounded-lg md:rounded-xl cursor-pointer border-2 shadow-md ${
                        index === currentImageIndex
                          ? 'border-amber-400 shadow-amber-500/50'
                          : 'border-amber-200/50'
                      }`}
                      onError={e => (e.target.src = zaglushka)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ======================= ПРАВАЯ ЧАСТЬ ======================= */}
            <div className='p-4 md:p-6 lg:p-8 md:w-1/2 flex flex-col justify-between bg-gradient-to-b from-red-900/10 to-green-900/10'>
              <div>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h1 className='text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2 drop-shadow-lg'>
                      {product.name}
                    </h1>
                    <div className='flex items-center flex-wrap gap-2 md:gap-4'>
                      <span className='text-lg md:text-xl text-amber-300 font-bold'>
                        {displayAmount}
                      </span>
                      <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className='text-amber-200 text-sm md:text-base'
                      >
                        <FaIcons.Star />
                        Новорічна пропозиція
                      </motion.span>
                    </div>
                  </div>
                </div>

                {/* ================== ВЫБОР ГРАММОВ ================== */}
                {isGramProduct && (
                  <div className='mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl md:rounded-2xl border border-orange-500/30'>
                    <label className='block text-amber-200 mb-2 md:mb-3 font-bold text-base md:text-lg flex items-center'>
                      <FontAwesomeIcon
                        icon={faWeightHanging}
                        className='mr-2'
                      />
                      Оберіть вагу (грам):
                    </label>
                    <div className='flex flex-wrap gap-2 md:gap-3'>
                      {gramOptions.map(g => (
                        <motion.button
                          key={g}
                          onClick={() => setSelectedGrams(g)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border font-medium transition-all text-sm md:text-base ${
                            selectedGrams === g
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500 shadow-lg'
                              : 'bg-white/10 text-amber-100 border-amber-300/30 hover:border-amber-300'
                          }`}
                        >
                          {g >= 1000 ? '1 кг' : `${g} г`}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ВЕДРО */}
                {product.bucket && (
                  <div className='mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-xl md:rounded-2xl border border-amber-500/30'>
                    <label className='block text-amber-200 mb-2 md:mb-3 font-bold text-base md:text-lg flex items-center'>
                      <FaIcons.Gift />
                      Спосіб покупки:
                    </label>

                    <div className='flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-4'>
                      <motion.button
                        type='button'
                        onClick={() => setSelectedBucketOption('weight')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl border font-medium transition-all text-sm md:text-base ${
                          selectedBucketOption === 'weight'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-500 shadow-lg'
                            : 'bg-white/10 text-amber-100 border-amber-300/30 hover:border-amber-300'
                        }`}
                      >
                        На вагу
                      </motion.button>

                      <motion.button
                        type='button'
                        onClick={() => setSelectedBucketOption('bucket')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl border font-medium transition-all text-sm md:text-base ${
                          selectedBucketOption === 'bucket'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-500 shadow-lg'
                            : 'bg-white/10 text-amber-100 border-amber-300/30 hover:border-amber-300'
                        }`}
                      >
                        У відрі 🎁
                      </motion.button>
                    </div>

                    {selectedBucketOption === 'weight' && (
                      <div className='mt-3 md:mt-4'>
                        <label className='block text-amber-200 mb-2 md:mb-3 font-medium'>
                          Оберіть вагу:
                        </label>
                        <div className='flex flex-wrap gap-2 md:gap-3'>
                          {weightOptions.map(w => (
                            <motion.button
                              key={w}
                              onClick={() => setSelectedWeight(w)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 md:px-4 py-1 md:py-2 rounded-lg border text-sm md:text-base ${
                                selectedWeight === w
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500'
                                  : 'bg-white/10 text-amber-100 border-amber-300/30 hover:border-amber-300'
                              }`}
                            >
                              {w} кг
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedBucketOption === 'bucket' && (
                      <div className='mt-3 md:mt-4'>
                        <label className='block text-amber-200 mb-2 md:mb-3 font-medium'>
                          Оберіть відро:
                        </label>
                        <div className='grid grid-cols-2 gap-2 md:gap-3'>
                          {bucketSizeOptions.map(opt => (
                            <motion.button
                              key={opt.value}
                              onClick={() => setSelectedBucketSize(opt.value)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border text-center text-sm md:text-base ${
                                selectedBucketSize === opt.value
                                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white border-red-500 shadow-lg'
                                  : 'bg-white/10 text-amber-100 border-amber-300/30 hover:border-amber-300'
                              }`}
                            >
                              <div>{opt.label}</div>
                              <div className='text-xs opacity-75'>
                                Новорічна упаковка
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ВЕСОВЫЕ (КГ) */}
                {!product.bucket &&
                  !isPieceProduct &&
                  !isLiquidProduct &&
                  !isGramProduct && (
                    <div className='mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl md:rounded-2xl border border-green-500/30'>
                      <label className='block text-amber-200 mb-2 md:mb-3 font-bold text-base md:text-lg flex items-center'>
                        <FaIcons.Tree />
                        Оберіть вагу:
                      </label>
                      <div className='flex flex-wrap gap-2 md:gap-3'>
                        {weightOptions.map(w => (
                          <motion.button
                            key={w}
                            onClick={() => setSelectedWeight(w)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl border text-sm md:text-base ${
                              selectedWeight === w
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500 shadow-lg'
                                : 'bg-white/10 text-amber-100 border-green-300/30 hover:border-green-300'
                            }`}
                          >
                            {w} кг
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* ШТУЧНЫЕ */}
                {isPieceProduct && (
                  <div className='mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl md:rounded-2xl border border-blue-500/30'>
                    <label className='block text-amber-200 mb-2 md:mb-3 font-bold text-base md:text-lg flex items-center'>
                      <FaIcons.Snowflake />
                      Оберіть кількість:
                    </label>
                    <div className='flex flex-wrap gap-2 md:gap-3'>
                      {pieceOptions.map(p => (
                        <motion.button
                          key={p}
                          onClick={() => setSelectedPieces(p)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl border text-sm md:text-base ${
                            selectedPieces === p
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-500 shadow-lg'
                              : 'bg-white/10 text-amber-100 border-blue-300/30 hover:border-blue-300'
                          }`}
                        >
                          {p} шт ❄️
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ЖИДКИЕ */}
                {isLiquidProduct && (
                  <div className='mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl md:rounded-2xl border border-purple-500/30'>
                    <label className='block text-amber-200 mb-2 md:mb-3 font-bold text-base md:text-lg'>
                      Оберіть об'єм:
                    </label>
                    <div className='flex flex-wrap gap-2 md:gap-3'>
                      {literOptions.map(l => (
                        <motion.button
                          key={l}
                          onClick={() => setSelectedLiters(l)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl border text-sm md:text-base ${
                            selectedLiters === l
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg'
                              : 'bg-white/10 text-amber-100 border-purple-300/30 hover:border-purple-300'
                          }`}
                        >
                          {l} л 🍶
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* КОЛИЧЕСТВО УПАКОВОК */}
                <div className='mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl md:rounded-2xl border border-amber-500/30'>
                  <label className='block text-amber-200 mb-2 md:mb-3 font-bold text-base md:text-lg'>
                    Кількість пакувань:
                  </label>
                  <div className='flex items-center max-w-xs'>
                    <motion.button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      whileTap={{ scale: 0.9 }}
                      className='px-3 md:px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-l-lg md:rounded-l-xl hover:from-red-700 hover:to-amber-700 active:scale-95'
                    >
                      -
                    </motion.button>
                    <div className='px-4 md:px-6 py-2 bg-gradient-to-r from-amber-900 to-yellow-900 text-white text-lg md:text-xl font-bold'>
                      {quantity}
                    </div>
                    <motion.button
                      onClick={() => setQuantity(quantity + 1)}
                      whileTap={{ scale: 0.9 }}
                      className='px-3 md:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-r-lg md:rounded-r-xl hover:from-green-700 hover:to-emerald-700 active:scale-95'
                    >
                      +
                    </motion.button>
                  </div>
                  <p className='text-amber-300/80 text-xs md:text-sm mt-2'>
                    ✨ Додайте більше для новорічного столу!
                  </p>
                </div>

                {/* СОСТАВ */}
                {product.compound && (
                  <div className='mb-6 md:mb-8 p-4 md:p-6 bg-red-50/60 rounded-xl md:rounded-2xl border border-emerald-200 shadow-sm'>
                    <h3 className='text-xl md:text-2xl font-bold text-emerald-600 mb-2'>
                      100% Натуральний склад
                    </h3>
                    <p className='text-red-500/80 text-xs md:text-sm mb-4'>
                      Без консервантів та хімії для вашого свята
                    </p>
                    <div className='space-y-3'>
                      {product.compound.split(',').map((ingredient, index) => {
                        const text = ingredient.trim().toLowerCase()
                        let icon = faCheck
                        if (text.includes('вітамін')) icon = faStar
                        if (text.includes('екстракт')) icon = faFlask
                        if (text.includes('олія')) icon = faTint
                        if (text.includes('рослин')) icon = faLeaf

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }} // Уменьшена задержка
                            className='flex items-center p-3 bg-white/70 rounded-lg border border-emerald-200 hover:border-emerald-400 transition-colors shadow-sm'
                          >
                            <FontAwesomeIcon
                              icon={icon}
                              className='text-red-500 mr-3 text-base'
                            />
                            <span className='text-red-700 font-medium text-sm md:text-base'>
                              {ingredient.trim()}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ======================= ОПИСАНИЕ ======================= */}
              {product.description && (
                <div className='space-y-4 md:space-y-6 mt-4 md:mt-5 mb-6 md:mb-10'>
                  {product.description.split('\n\n').map((part, index) => {
                    const isCooking = part.startsWith('Як готувати')
                    const isFeature = part.startsWith('Особливості')
                    const isDesc = part.startsWith('Опис')

                    const sectionBg = isCooking
                      ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-l-4 md:border-l-8 border-amber-500'
                      : isFeature
                      ? 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-l-4 md:border-l-8 border-emerald-500'
                      : isDesc
                      ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-l-4 md:border-l-8 border-blue-500'
                      : 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-l-4 md:border-l-8 border-purple-500'

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`relative overflow-hidden rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg ${sectionBg} backdrop-blur-sm`}
                      >
                        <p className='relative z-10 leading-relaxed text-base md:text-lg text-white/90'>
                          {part.replace(
                            /^(Як готувати|Особливості|Опис):?\s*/,
                            ''
                          )}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* ======================= КНОПКА КУПИТЬ ======================= */}
              <div className='sticky bottom-0 bg-gradient-to-b from-transparent via-red-900/20 to-red-900/40 pt-4 md:pt-0'>
                <motion.button
                  onClick={!product.isAccessible ? handleAddToCart : null}
                  disabled={product.isAccessible}
                  whileHover={!product.isAccessible ? { scale: 1.02 } : {}}
                  whileTap={!product.isAccessible ? { scale: 0.98 } : {}}
                  className={`w-full flex items-center justify-center px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl md:shadow-2xl transition-all duration-300
                    ${
                      product.isAccessible
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-red-500 hover:from-amber-600 hover:via-yellow-600 hover:to-red-600 active:scale-95'
                    }
                  `}
                >
                  <motion.div
                    animate={
                      !product.isAccessible ? { rotate: [0, 5, -5, 0] } : {} // Упрощена анимация
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      className='mr-2 md:mr-4 text-lg'
                    />
                  </motion.div>
                  <span className='text-sm md:text-base'>
                    {product.isAccessible
                      ? '🕐 Зʼявиться зовсім скоро!'
                      : `🎁 Додати у новорічний кошик (${calculatedPrice})`}
                  </span>
                </motion.button>

                <p className='text-center text-amber-300/70 text-xs md:text-sm mt-2 md:mt-3'>
                  🚚 Безкоштовна доставка по Запоріжжю від 800 грн
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='relative mt-8 md:mt-12 pt-4 md:pt-8 border-t border-amber-500/30'>
          <div className='text-center text-xs md:text-sm text-amber-200'>
            <p className='mb-2 md:mb-3'>
              З Новим Роком та Різдвом Христовим! Нехай ваш святковий стіл буде
              смачним! 🎅✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
