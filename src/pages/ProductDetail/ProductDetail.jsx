import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { database } from '../../lib/productSuperbase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
  faCartPlus,
  faUtensils,
  faInfoCircle,
  faBan,
  faLeaf
} from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '../../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.jpg'
import { toast } from 'react-hot-toast'

const weightOptions = [0.5, 1, 2, 3]
const pieceOptions = [1, 2, 3, 5, 10]
const literOptions = [1, 2, 3, 5]
const gramOptions = [100, 250, 500, 1000]
const bucketSizeOptions = [
  { value: 1, label: '1 кг' },
  { value: 3, label: '3 кг' },
  { value: 5, label: '5 кг' }
]

export function ProductDetail () {
  const { category, id } = useParams()
  const addToCart = useCartStore(state => state.addToCart)

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

  const inStock = product?.isAccessible === true

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

  const basePrice = useMemo(() => {
    if (!product) return 0
    const { isPieceProduct, isGramProduct, isLiquidProduct } = productType
    let p = product.price.replace(' грн', '')
    if (isPieceProduct) p = p.replace('/шт', '')
    if (isLiquidProduct) p = p.replace('/л', '')
    if (isGramProduct) p = p.replace('/100 гр', '').replace('/100гр', '')
    return parseFloat(p)
  }, [product, productType])

  const { calculatedPrice, displayAmount } = useMemo(() => {
    if (!product) return { calculatedPrice: '0 грн', displayAmount: '' }
    const { isPieceProduct, isGramProduct, isLiquidProduct } = productType
    const isBucketProduct = product.bucket === true
    let price = 0
    let amount = ''

    if (isPieceProduct) {
      price = (basePrice * selectedPieces).toFixed(2)
      amount = `${selectedPieces} шт`
    } else if (isLiquidProduct) {
      price = (basePrice * selectedLiters).toFixed(2)
      amount = `${selectedLiters} л`
    } else if (isGramProduct) {
      price = ((basePrice / 100) * selectedGrams).toFixed(2)
      amount =
        selectedGrams >= 1000
          ? `${selectedGrams / 1000} кг`
          : `${selectedGrams} гр`
    } else if (isBucketProduct && selectedBucketOption === 'bucket') {
      price = (basePrice * selectedBucketSize).toFixed(2)
      amount = `${selectedBucketSize} кг (відро)`
    } else {
      price = (basePrice * selectedWeight).toFixed(2)
      amount = `${selectedWeight} кг`
    }

    return {
      calculatedPrice: `${Math.round(price)} грн`,
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

  const handleAddToCart = () => {
    if (!inStock) return
    addToCart(
      { ...product, price: calculatedPrice, weight: displayAmount, quantity },
      category
    )
    toast.success(`${product.name} додано!`, {
      icon: '🌿',
      style: {
        borderRadius: '20px',
        background: '#1a1a1a',
        color: '#fff',
        padding: '16px 20px',
        fontWeight: 'bold',
        fontSize: '15px'
      }
    })
  }

  const images = useMemo(
    () => (product?.images?.length > 0 ? product.images : [zaglushka]),
    [product]
  )
  const getImageUrl = useCallback(img => {
    if (!img || img === zaglushka) return zaglushka
    return new URL(`../../assets/products/${img}`, import.meta.url).href
  }, [])

  if (loading)
    return (
      <div className='min-h-screen bg-[#F7F4EF] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-12 h-12 border-[3px] border-orange-400 border-t-transparent rounded-full animate-spin' />
          <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
            Завантаження
          </span>
        </div>
      </div>
    )

  // ── Shared blocks (rendered in both mobile + desktop) ──────────────────

  const SelectorsBlock = () => (
    <div className='space-y-6'>
      {productType.isGramProduct && (
        <SectionBlock label='Скільки грамів?'>
          <div className='grid grid-cols-4 gap-2'>
            {gramOptions.map(g => (
              <OptionButton
                key={g}
                label={g >= 1000 ? `${g / 1000}кг` : `${g}г`}
                active={selectedGrams === g}
                onClick={() => setSelectedGrams(g)}
                accent='dark'
              />
            ))}
          </div>
        </SectionBlock>
      )}

      {product.bucket && (
        <SectionBlock label='Як запакувати?'>
          <div className='flex gap-1.5 p-1.5 bg-gray-100 rounded-2xl mb-3'>
            {['weight', 'bucket'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedBucketOption(type)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedBucketOption === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400'
                }`}
              >
                {type === 'weight' ? '⚖️ На вагу' : '🧺 У відрі'}
              </button>
            ))}
          </div>
          <div className='grid grid-cols-3 gap-2'>
            {(selectedBucketOption === 'weight'
              ? weightOptions
              : bucketSizeOptions
            ).map(opt => {
              const val = typeof opt === 'object' ? opt.value : opt
              const isActive =
                (selectedBucketOption === 'weight'
                  ? selectedWeight
                  : selectedBucketSize) === val
              return (
                <OptionButton
                  key={val}
                  label={`${val} кг`}
                  active={isActive}
                  accent='orange'
                  onClick={() =>
                    selectedBucketOption === 'weight'
                      ? setSelectedWeight(val)
                      : setSelectedBucketSize(val)
                  }
                />
              )
            })}
          </div>
        </SectionBlock>
      )}

      {!product.bucket && !productType.isGramProduct && (
        <SectionBlock label="Оберіть об'єм:">
          <div className='grid grid-cols-4 gap-2'>
            {(productType.isPieceProduct
              ? pieceOptions
              : productType.isLiquidProduct
              ? literOptions
              : weightOptions
            ).map(v => {
              const isActive =
                (productType.isPieceProduct
                  ? selectedPieces
                  : productType.isLiquidProduct
                  ? selectedLiters
                  : selectedWeight) === v
              return (
                <OptionButton
                  key={v}
                  label={`${v} ${
                    productType.isPieceProduct
                      ? 'шт'
                      : productType.isLiquidProduct
                      ? 'л'
                      : 'кг'
                  }`}
                  active={isActive}
                  accent='dark'
                  onClick={() => {
                    if (productType.isPieceProduct) setSelectedPieces(v)
                    else if (productType.isLiquidProduct) setSelectedLiters(v)
                    else setSelectedWeight(v)
                  }}
                />
              )
            })}
          </div>
        </SectionBlock>
      )}
    </div>
  )

  const CTABlock = ({ compact = false }) => (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <span className='text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-0.5'>
            Підсумок
          </span>
          <AnimatePresence mode='wait'>
            <motion.span
              key={calculatedPrice}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`block font-black leading-none ${
                compact ? 'text-3xl' : 'text-[2rem]'
              } ${!inStock ? 'text-gray-300' : 'text-gray-900'}`}
            >
              {calculatedPrice}
            </motion.span>
          </AnimatePresence>
          <span className='text-[12px] font-semibold text-orange-500 mt-0.5 block'>
            {displayAmount}
          </span>
        </div>

        {inStock && (
          <div className='flex items-center bg-gray-100 rounded-2xl overflow-hidden'>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className='w-11 h-11 flex items-center justify-center text-xl font-black text-gray-500 hover:bg-gray-200 transition-colors'
            >
              −
            </button>
            <span className='w-9 text-center text-[17px] font-black text-gray-900 select-none'>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className='w-11 h-11 flex items-center justify-center text-xl font-black text-gray-500 hover:bg-gray-200 transition-colors'
            >
              +
            </button>
          </div>
        )}
      </div>

      <button
        disabled={!inStock}
        onClick={handleAddToCart}
        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.15em] text-[13px] transition-all active:scale-[0.97] ${
          !inStock
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-orange-600'
        }`}
        style={inStock ? { boxShadow: '0 8px 24px rgba(249,115,22,0.22)' } : {}}
      >
        <FontAwesomeIcon
          icon={!inStock ? faBan : faCartPlus}
          className={!inStock ? 'text-red-300' : 'text-orange-400'}
        />
        {!inStock ? 'Немає в наявності' : 'Додати до замовлення'}
      </button>

      {!inStock && (
        <p className='text-center text-[11px] text-gray-400 font-medium mt-2.5 leading-snug'>
          Товар тимчасово відсутній. Ви можете переглянути склад та ціни.
        </p>
      )}
    </div>
  )

  return (
    <div className='min-h-screen bg-[#F7F4EF] font-sans'>
      {/* ══════════════════════════════════════
          DESKTOP  (md+)
      ══════════════════════════════════════ */}
      <div className='hidden md:block'>
        {/* Breadcrumb header */}
        <header className='border-b border-gray-200 bg-[#F7F4EF]/90 backdrop-blur-md sticky top-0 z-30'>
          <div className='max-w-6xl mx-auto px-8 py-4 flex items-center gap-3'>
            <Link
              to={`/catalog/${category}`}
              className='flex items-center gap-2.5 text-gray-500 hover:text-gray-900 transition-colors group'
            >
              <span className='w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 group-hover:border-gray-400 transition-colors'>
                <FontAwesomeIcon icon={faChevronLeft} size='xs' />
              </span>
              <span className='text-xs font-bold uppercase tracking-widest'>
                Назад до списку
              </span>
            </Link>
            <span className='text-gray-300 select-none'>·</span>
            <span className='text-xs font-bold text-gray-400 truncate max-w-xs'>
              {product.name}
            </span>
          </div>
        </header>

        {/* Two-column layout */}
        <div className='max-w-6xl mx-auto px-8 py-12'>
          <div className='grid grid-cols-2 gap-16 items-start'>
            {/* LEFT — sticky photo */}
            <div className='sticky top-24'>
              <div className='relative aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm'>
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={currentImageIndex}
                    src={getImageUrl(images[currentImageIndex])}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute inset-0 w-full h-full object-cover ${
                      !inStock ? 'grayscale opacity-70' : ''
                    }`}
                  />
                </AnimatePresence>

                {!inStock && (
                  <div className='absolute inset-0 bg-black/30 flex items-center justify-center z-10'>
                    <div className='bg-black/65 backdrop-blur-sm text-white px-5 py-2.5 rounded-full flex items-center gap-2'>
                      <FontAwesomeIcon
                        icon={faBan}
                        className='text-red-400 text-xs'
                      />
                      <span className='text-[11px] font-black uppercase tracking-widest'>
                        Немає в наявності
                      </span>
                    </div>
                  </div>
                )}

                {images.length > 1 && (
                  <div className='absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10'>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          prev => (prev - 1 + images.length) % images.length
                        )
                      }
                      className='w-10 h-10 rounded-full bg-white/90 border border-gray-100 shadow flex items-center justify-center hover:bg-white transition-colors'
                    >
                      <FontAwesomeIcon
                        icon={faChevronLeft}
                        size='sm'
                        className='text-gray-700'
                      />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(prev => (prev + 1) % images.length)
                      }
                      className='w-10 h-10 rounded-full bg-white/90 border border-gray-100 shadow flex items-center justify-center hover:bg-white transition-colors'
                    >
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        size='sm'
                        className='text-gray-700'
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className='flex gap-2 mt-3'>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                        i === currentImageIndex
                          ? 'border-gray-900'
                          : 'border-transparent opacity-55 hover:opacity-85'
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        className='w-full h-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className='flex items-start justify-between gap-4 mb-2'>
                <h1 className='text-4xl font-black text-gray-900 leading-tight'>
                  {product.name}
                </h1>
                {inStock ? (
                  <span className='flex-shrink-0 mt-1.5 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide'>
                    <FontAwesomeIcon icon={faLeaf} className='text-[10px]' />{' '}
                    Свіжий
                  </span>
                ) : (
                  <span className='flex-shrink-0 mt-1.5 flex items-center gap-1.5 bg-red-50 text-red-400 border border-red-100 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide'>
                    <FontAwesomeIcon icon={faBan} className='text-[10px]' />{' '}
                    Відсутній
                  </span>
                )}
              </div>
              <p className='text-sm text-gray-400 font-medium mb-8'>
                {product.price}
              </p>

              <div className='h-px bg-gray-200 mb-8' />

              <SelectorsBlock />

              {product.compound && (
                <div className='bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-6'>
                  <h4 className='flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2'>
                    <FontAwesomeIcon icon={faUtensils} /> Склад
                  </h4>
                  <p className='text-gray-700 text-sm font-medium leading-relaxed'>
                    {product.compound}
                  </p>
                </div>
              )}

              {product.description && (
                <div className='flex gap-3 mt-5'>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className='text-orange-300 mt-0.5 flex-shrink-0'
                  />
                  <p className='text-gray-400 text-sm leading-relaxed italic'>
                    {product.description}
                  </p>
                </div>
              )}

              <div className='h-px bg-gray-200 my-8' />

              <CTABlock compact />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE  (< md)
      ══════════════════════════════════════ */}
      <div className='md:hidden'>
        {/* Full-bleed hero image */}
        <div
          className='relative w-full'
          style={{ height: '58vmax', maxHeight: '65vh', minHeight: 280 }}
        >
          <div
            className='absolute top-0 left-0 right-0 z-20 flex items-center px-4 pt-12 pb-4'
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)'
            }}
          >
            <Link
              to={`/catalog/${category}`}
              className='w-11 h-11 flex items-center justify-center rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 text-white active:scale-90 transition-transform'
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Link>
            <span className='ml-3 text-white/80 font-bold text-[11px] uppercase tracking-[0.2em]'>
              До списку
            </span>
          </div>

          <AnimatePresence mode='wait'>
            <motion.img
              key={currentImageIndex}
              src={getImageUrl(images[currentImageIndex])}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`absolute inset-0 w-full h-full object-cover ${
                !inStock ? 'grayscale' : ''
              }`}
            />
          </AnimatePresence>

          {!inStock && (
            <div className='absolute inset-0 bg-black/40 flex items-center justify-center z-10'>
              <div className='bg-black/70 backdrop-blur-sm text-white px-5 py-2.5 rounded-full flex items-center gap-2'>
                <FontAwesomeIcon
                  icon={faBan}
                  className='text-red-400 text-xs'
                />
                <span className='text-[11px] font-black uppercase tracking-widest'>
                  Немає в наявності
                </span>
              </div>
            </div>
          )}

          {images.length > 1 && (
            <>
              <div className='absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between z-10'>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      prev => (prev - 1 + images.length) % images.length
                    )
                  }
                  className='w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white'
                >
                  <FontAwesomeIcon icon={faChevronLeft} size='sm' />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex(prev => (prev + 1) % images.length)
                  }
                  className='w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white'
                >
                  <FontAwesomeIcon icon={faChevronRight} size='sm' />
                </button>
              </div>
              <div className='absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10'>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`rounded-full transition-all ${
                      i === currentImageIndex
                        ? 'w-5 h-1.5 bg-white'
                        : 'w-1.5 h-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div
            className='absolute bottom-0 left-0 right-0 h-16 z-10'
            style={{
              background: 'linear-gradient(to bottom, transparent, #F7F4EF)'
            }}
          />
        </div>

        {/* Sliding content card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 200,
            delay: 0.1
          }}
          className='relative z-10 -mt-6 bg-[#F7F4EF] rounded-t-[2.5rem] px-5 pb-48'
        >
          <div className='pt-7 pb-5'>
            <div className='flex items-start justify-between gap-3 mb-2'>
              <h1 className='text-[1.85rem] font-black text-gray-900 leading-tight flex-1'>
                {product.name}
              </h1>
              {inStock && (
                <span className='flex-shrink-0 mt-1 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide'>
                  <FontAwesomeIcon icon={faLeaf} className='text-[10px]' />{' '}
                  Свіжий
                </span>
              )}
            </div>
            <p className='text-sm text-gray-400 font-medium'>{product.price}</p>
          </div>

          <div className='h-px bg-gray-200 mb-6' />

          <SelectorsBlock />

          {product.compound && (
            <div className='bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-6'>
              <h4 className='flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2'>
                <FontAwesomeIcon icon={faUtensils} /> Склад
              </h4>
              <p className='text-gray-700 text-[15px] font-medium leading-relaxed'>
                {product.compound}
              </p>
            </div>
          )}

          {product.description && (
            <div className='flex gap-3 mt-5'>
              <FontAwesomeIcon
                icon={faInfoCircle}
                className='text-orange-300 mt-0.5 flex-shrink-0'
              />
              <p className='text-gray-400 text-[15px] leading-relaxed italic'>
                {product.description}
              </p>
            </div>
          )}
        </motion.div>

        {/* Fixed bottom purchase bar */}
        <div className='fixed bottom-0 left-0 right-0 z-50'>
          <div className='h-5 bg-gradient-to-t from-[#F7F4EF] to-transparent' />
          <div className='bg-[#F7F4EF] px-4 pb-8 pt-1'>
            <div className='bg-white rounded-[2rem] shadow-[0_-4px_30px_rgba(0,0,0,0.08)] border border-gray-100 px-4 pt-4 pb-4'>
              <CTABlock />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Helpers ─── */

function SectionBlock ({ label, children }) {
  return (
    <div>
      <label className='text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 block mb-3'>
        {label}
      </label>
      {children}
    </div>
  )
}

function OptionButton ({ label, active, onClick, accent = 'dark' }) {
  const activeClass =
    accent === 'orange'
      ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
      : 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200'

  return (
    <button
      onClick={onClick}
      className={`py-3.5 rounded-2xl text-sm font-black border-2 transition-all active:scale-95 hover:scale-[1.02] ${
        active
          ? activeClass
          : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}
