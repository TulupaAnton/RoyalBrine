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
import { FaSnowflake, FaTree, FaGift, FaStar } from 'react-icons/fa'

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
  const [selectedGrams, setSelectedGrams] = useState(100) // По умолчанию 100г
  const [selectedBucketOption, setSelectedBucketOption] = useState('weight')
  const [selectedBucketSize, setSelectedBucketSize] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Новогодние снежинки
  const snowflakes = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 5 + 2,
    delay: Math.random() * 5
  }))

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

  // ===== determine product type =====
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

  const isBucketProduct = product.bucket === true

  // ===== base price =====
  const getBasePrice = () => {
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
  }

  const basePrice = getBasePrice()

  // ===== calc final price =====
  const getCalculatedPrice = () => {
    if (isPieceProduct) return (basePrice * selectedPieces).toFixed(2) + ' грн'
    if (isLiquidProduct) return (basePrice * selectedLiters).toFixed(2) + ' грн'
    if (isGramProduct)
      return ((basePrice / 100) * selectedGrams).toFixed(2) + ' грн'
    if (isBucketProduct && selectedBucketOption === 'bucket')
      return (basePrice * selectedBucketSize).toFixed(2) + ' грн'
    return (basePrice * selectedWeight).toFixed(2) + ' грн'
  }

  const calculatedPrice = getCalculatedPrice()

  const getDisplayAmount = () => {
    if (isPieceProduct) return selectedPieces + ' шт'
    if (isLiquidProduct) return selectedLiters + ' л'
    if (isGramProduct)
      return selectedGrams >= 1000
        ? selectedGrams / 1000 + ' кг'
        : selectedGrams + ' гр'
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

    toast.success(`🎁 ${product.name} додано до новорічного кошика!`)
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
  const gramOptions = [80, 100, 250, 500, 1000]
  const bucketSizeOptions = [
    { value: 1, label: '1 кг' },
    { value: 3, label: '3 кг' },
    { value: 5, label: '5 кг' },
    { value: 10, label: '10 кг' }
  ]

  // ===== UI =====
  return (
    <div className='min-h-screen bg-gradient-to-b from-green-950 via-red-900 to-green-950 py-8 relative overflow-hidden'>
      {/* Анимированные снежинки */}
      <div className='absolute inset-0 pointer-events-none'>
        {snowflakes.map(flake => (
          <motion.div
            key={flake.id}
            className='absolute text-white/10'
            style={{
              left: flake.left,
              fontSize: `${flake.size}px`
            }}
            initial={{ y: -50 }}
            animate={{ y: '100vh' }}
            transition={{
              duration: 3 + Math.random() * 5,
              delay: flake.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <FaSnowflake />
          </motion.div>
        ))}
      </div>

      <div className='container mx-auto px-4 lg:px-8 relative z-10'>
        {/* Новогодние хлебные крошки */}
        <Link
          to={`/catalog/${category}`}
          className='inline-flex items-center text-amber-300 hover:text-yellow-300 transition mb-8 text-sm font-medium group'
        >
          <motion.div
            className='mr-3'
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
        <div className='bg-gradient-to-br from-red-900/90 via-green-900/90 to-red-900/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden max-w-6xl mx-auto border border-amber-500/30'>
          <div className='md:flex'>
            {/* ======================= ГАЛЕРЕЯ ======================= */}
            <div className='w-full lg:w-[60%] overflow-hidden flex flex-col items-center p-4 lg:p-10 relative'>
              <div className='relative w-full h-[420px] sm:h-[480px] lg:h-[620px] rounded-2xl overflow-hidden border-4 border-amber-500/20 shadow-xl'>
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
                    <div className='text-center p-6 bg-gradient-to-r from-amber-900/80 to-red-900/80 rounded-2xl border border-amber-500/50'>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className='text-4xl mb-3'
                      >
                        🎅
                      </motion.div>
                      <span className='text-white text-xl font-semibold drop-shadow-lg'>
                        Товар з'явиться зовсім скоро!
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type='button'
                  onClick={() => paginate(-1)}
                  className='absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full p-2 lg:p-4 shadow-lg z-30 hover:scale-110 transition-transform'
                >
                  <FontAwesomeIcon icon={faChevronLeft} size='lg' />
                </button>

                <button
                  type='button'
                  onClick={() => paginate(1)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full p-2 lg:p-4 shadow-lg z-30 hover:scale-110 transition-transform'
                >
                  <FontAwesomeIcon icon={faChevronRight} size='lg' />
                </button>

                <div className='absolute top-4 right-4 bg-gradient-to-r from-red-600 to-amber-600 text-white px-4 py-2 rounded-full shadow-lg z-30'>
                  <span className='font-bold'>{calculatedPrice}</span>
                </div>
              </div>

              <div className='flex gap-3 mt-6 justify-center flex-wrap'>
                {images.map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={
                        new URL(`../../assets/products/${img}`, import.meta.url)
                          .href
                      }
                      alt={`Preview ${index}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 lg:w-28 lg:h-28 object-cover rounded-xl cursor-pointer border-2 shadow-lg ${
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
            <div className='p-8 md:w-1/2 flex flex-col justify-between bg-gradient-to-b from-red-900/10 to-green-900/10'>
              <div>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h1 className='text-3xl lg:text-4xl font-extrabold text-white mb-2 drop-shadow-lg'>
                      {product.name}
                    </h1>
                    <div className='flex items-center space-x-4'>
                      <span className='text-xl text-amber-300 font-bold'>
                        {displayAmount}
                      </span>
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className='text-amber-200'
                      >
                        <FaStar className='inline mr-1' />
                        Новорічна пропозиція
                      </motion.span>
                    </div>
                  </div>
                </div>

                {/* ================== ВЫБОР ГРАММОВ ================== */}
                {isGramProduct && (
                  <div className='mb-6 p-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl border border-orange-500/30'>
                    <label className='block text-amber-200 mb-3 font-bold text-lg flex items-center'>
                      <FontAwesomeIcon
                        icon={faWeightHanging}
                        className='mr-2'
                      />
                      Оберіть вагу (грам):
                    </label>
                    <div className='flex flex-wrap gap-3'>
                      {gramOptions.map(g => (
                        <motion.button
                          key={g}
                          onClick={() => setSelectedGrams(g)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-3 rounded-xl border font-medium transition-all ${
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
                  <div className='mb-6 p-6 bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-2xl border border-amber-500/30'>
                    <label className='block text-amber-200 mb-3 font-bold text-lg flex items-center'>
                      <FaGift className='mr-2' />
                      Спосіб покупки:
                    </label>

                    <div className='flex flex-wrap gap-3 mb-4'>
                      <motion.button
                        type='button'
                        onClick={() => setSelectedBucketOption('weight')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-5 py-3 rounded-xl border font-medium transition-all ${
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
                        className={`px-5 py-3 rounded-xl border font-medium transition-all ${
                          selectedBucketOption === 'bucket'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-500 shadow-lg'
                            : 'bg-white/10 text-amber-100 border-amber-300/30 hover:border-amber-300'
                        }`}
                      >
                        У відрі 🎁
                      </motion.button>
                    </div>

                    {selectedBucketOption === 'weight' && (
                      <div className='mt-4'>
                        <label className='block text-amber-200 mb-3 font-medium'>
                          Оберіть вагу:
                        </label>
                        <div className='flex flex-wrap gap-3'>
                          {weightOptions.map(w => (
                            <motion.button
                              key={w}
                              onClick={() => setSelectedWeight(w)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 rounded-lg border ${
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
                      <div className='mt-4'>
                        <label className='block text-amber-200 mb-3 font-medium'>
                          Оберіть відро:
                        </label>
                        <div className='grid grid-cols-2 gap-3'>
                          {bucketSizeOptions.map(opt => (
                            <motion.button
                              key={opt.value}
                              onClick={() => setSelectedBucketSize(opt.value)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-3 rounded-xl border text-center ${
                                selectedBucketSize === opt.value
                                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white border-red-500 shadow-lg'
                                  : 'bg-white/10 text-amber-100 border-amber-300/30 hover:border-amber-300'
                              }`}
                            >
                              <div className='text-lg'>{opt.label}</div>
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
                    <div className='mb-6 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-500/30'>
                      <label className='block text-amber-200 mb-3 font-bold text-lg flex items-center'>
                        <FaTree className='mr-2' />
                        Оберіть вагу:
                      </label>
                      <div className='flex flex-wrap gap-3'>
                        {weightOptions.map(w => (
                          <motion.button
                            key={w}
                            onClick={() => setSelectedWeight(w)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-5 py-3 rounded-xl border ${
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
                  <div className='mb-6 p-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl border border-blue-500/30'>
                    <label className='block text-amber-200 mb-3 font-bold text-lg flex items-center'>
                      <FaSnowflake className='mr-2' />
                      Оберіть кількість:
                    </label>
                    <div className='flex flex-wrap gap-3'>
                      {pieceOptions.map(p => (
                        <motion.button
                          key={p}
                          onClick={() => setSelectedPieces(p)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-5 py-3 rounded-xl border ${
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
                  <div className='mb-6 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/30'>
                    <label className='block text-amber-200 mb-3 font-bold text-lg'>
                      Оберіть об'єм:
                    </label>
                    <div className='flex flex-wrap gap-3'>
                      {literOptions.map(l => (
                        <motion.button
                          key={l}
                          onClick={() => setSelectedLiters(l)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-5 py-3 rounded-xl border ${
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
                <div className='mb-6 p-6 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-2xl border border-amber-500/30'>
                  <label className='block text-amber-200 mb-3 font-bold text-lg'>
                    Кількість пакувань:
                  </label>
                  <div className='flex items-center max-w-xs'>
                    <motion.button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      whileTap={{ scale: 0.9 }}
                      className='px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-l-xl hover:from-red-700 hover:to-amber-700'
                    >
                      -
                    </motion.button>
                    <div className='px-6 py-2 bg-gradient-to-r from-amber-900 to-yellow-900 text-white text-xl font-bold'>
                      {quantity}
                    </div>
                    <motion.button
                      onClick={() => setQuantity(quantity + 1)}
                      whileTap={{ scale: 0.9 }}
                      className='px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-r-xl hover:from-green-700 hover:to-emerald-700'
                    >
                      +
                    </motion.button>
                  </div>
                  <p className='text-amber-300/80 text-sm mt-2'>
                    ✨ Додайте більше для новорічного столу!
                  </p>
                </div>

                {/* СОСТАВ */}
                {product.compound && (
                  <div className='mb-8 p-8 bg-red-50/60 rounded-2xl border border-emerald-200 shadow-md'>
                    <h3 className='text-2xl font-bold text-emerald-600 mb-2'>
                      100% Натуральний склад
                    </h3>
                    <p className='text-red-500/80 text-sm mb-6'>
                      Без консервантів та хімії для вашого свята
                    </p>
                    <div className='space-y-4'>
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
                            transition={{ delay: index * 0.1 }}
                            className='flex items-center p-4 bg-white/70 rounded-xl border border-emerald-200 hover:border-emerald-400 transition-colors shadow-sm'
                          >
                            <FontAwesomeIcon
                              icon={icon}
                              className='text-red-500 mr-4 text-lg'
                            />
                            <span className='text-red-700 font-medium'>
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
              <div className='space-y-8 mt-5 mb-10'>
                {product.description.split('\n\n').map((part, index) => {
                  const isCooking = part.startsWith('Як готувати')
                  const isFeature = part.startsWith('Особливості')
                  const isDesc = part.startsWith('Опис')

                  const sectionBg = isCooking
                    ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-l-8 border-amber-500'
                    : isFeature
                    ? 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-l-8 border-emerald-500'
                    : isDesc
                    ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-l-8 border-blue-500'
                    : 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-l-8 border-purple-500'

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`relative overflow-hidden rounded-3xl p-8 shadow-xl ${sectionBg} backdrop-blur-sm`}
                    >
                      <p className='relative z-10 leading-relaxed text-lg text-white/90'>
                        {part.replace(
                          /^(Як готувати|Особливості|Опис):?\s*/,
                          ''
                        )}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              {/* ======================= КНОПКА КУПИТЬ ======================= */}
              <div className='sticky bottom-0'>
                <motion.button
                  onClick={!product.isAccessible ? handleAddToCart : null}
                  disabled={product.isAccessible}
                  whileHover={!product.isAccessible ? { scale: 1.02 } : {}}
                  whileTap={!product.isAccessible ? { scale: 0.98 } : {}}
                  className={`w-full flex items-center justify-center px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300
                    ${
                      product.isAccessible
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-red-500 hover:from-amber-600 hover:via-yellow-600 hover:to-red-600 active:scale-95'
                    }
                  `}
                >
                  <motion.div
                    animate={
                      !product.isAccessible ? { rotate: [0, 10, -10, 0] } : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      className='mr-4 text-xl'
                    />
                  </motion.div>
                  {product.isAccessible
                    ? '🕐 Зʼявиться зовсім скоро!'
                    : `🎁 Додати у новорічний кошик (${calculatedPrice})`}
                </motion.button>

                <p className='text-center text-amber-300/70 text-sm mt-3'>
                  🚚 Безкоштовна доставка по Запоріжжю від 800 грн
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='relative mt-12 pt-8 border-t border-amber-500/30'>
          <div className='text-center text-sm text-amber-200'>
            <p className='mb-3'>
              З Новим Роком та Різдвом Христовим! Нехай ваш святковий стіл буде
              смачним! 🎅✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
