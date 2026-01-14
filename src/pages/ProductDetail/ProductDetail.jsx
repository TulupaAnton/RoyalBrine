import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { database } from '../../lib/productSuperbase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
  faCartPlus,
  faUtensils,
  faWeightHanging,
  faBoxOpen,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '../../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import zaglushka from '../../assets/zaglushka.jpg'
import { toast } from 'react-hot-toast'

// Опции выбора (логика Supabase сохранена)
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

  // ========= ЛОГИКА ЦЕН (БЕЗ ИЗМЕНЕНИЙ) =========
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
    if (product.isAccessible) return
    addToCart(
      { ...product, price: calculatedPrice, weight: displayAmount, quantity },
      category
    )
    toast.success(`${product.name} додано!`, {
      icon: '🌿',
      style: {
        borderRadius: '20px',
        background: '#111',
        color: '#fff',
        padding: '16px',
        fontWeight: 'bold'
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
      <div className='min-h-screen bg-[#FDFCFB] flex items-center justify-center'>
        <div className='w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )

  return (
    <div className='min-h-screen bg-[#FDFCFB] pb-32 font-sans'>
      {/* SHAPKA БЕЗ КОРЗИНЫ И ЛИШНИХ НАЗВАНИЙ */}
      <header className='sticky top-0 z-40 bg-[#FDFCFB]/90 backdrop-blur-md'>
        <div className='container mx-auto px-4 py-4 flex items-center'>
          <Link
            to={`/catalog/${category}`}
            className='w-12 h-12 flex items-center justify-center bg-white shadow-sm border border-gray-100 rounded-2xl text-gray-800 active:scale-90 transition-all'
          >
            <FontAwesomeIcon icon={faChevronLeft} size='lg' />
          </Link>
          <span className='ml-4 font-bold text-gray-400 uppercase tracking-widest text-xs'>
            Назад до списку
          </span>
        </div>
      </header>

      <main className='container mx-auto px-4 max-w-4xl'>
        <div className='flex flex-col gap-8'>
          {/* КРУПНОЕ ФОТО */}
          <div className='relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-md border border-gray-50'>
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentImageIndex}
                src={getImageUrl(images[currentImageIndex])}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                className='w-full h-full object-cover'
              />
            </AnimatePresence>

            {images.length > 1 && (
              <div className='absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between'>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      prev => (prev - 1 + images.length) % images.length
                    )
                  }
                  className='w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center active:scale-90 transition-all'
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex(prev => (prev + 1) % images.length)
                  }
                  className='w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center active:scale-90 transition-all'
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>

          {/* ИНФОРМАЦИЯ КРУПНО */}
          <div className='flex flex-col px-2'>
            <h2 className='text-3xl md:text-5xl font-black text-gray-900 leading-[1.1] mb-4'>
              {product.name}
            </h2>

            <div className='flex items-center gap-4 mb-8'>
              <div className='bg-orange-100 text-orange-700 px-4 py-2 rounded-2xl text-base font-black'>
                {displayAmount}
              </div>
              <span className='text-gray-400 font-bold text-sm uppercase tracking-wide'>
                Свіжий врожай ✨
              </span>
            </div>

            {/* ВЫБОР (КРУПНЫЕ КНОПКИ) */}
            <div className='space-y-10'>
              {/* Граммы */}
              {productType.isGramProduct && (
                <div>
                  <label className='text-sm font-black uppercase text-gray-400 tracking-widest block mb-4'>
                    Скільки грамів?
                  </label>
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                    {gramOptions.map(g => (
                      <button
                        key={g}
                        onClick={() => setSelectedGrams(g)}
                        className={`py-4 rounded-[1.5rem] text-lg font-bold transition-all border-2 ${
                          selectedGrams === g
                            ? 'bg-gray-900 border-gray-900 text-white shadow-xl'
                            : 'bg-white border-gray-100 text-gray-500'
                        }`}
                      >
                        {g} г
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ведро / Вес */}
              {product.bucket && (
                <div className='bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm'>
                  <label className='text-sm font-black uppercase text-gray-400 tracking-widest block mb-4'>
                    Як запакувати?
                  </label>
                  <div className='flex gap-2 mb-6 p-1.5 bg-gray-50 rounded-[1.5rem]'>
                    {['weight', 'bucket'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedBucketOption(type)}
                        className={`flex-1 py-4 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${
                          selectedBucketOption === type
                            ? 'bg-white text-gray-900 shadow-md'
                            : 'text-gray-400'
                        }`}
                      >
                        {type === 'weight' ? 'На вагу' : 'У відрі 🧺'}
                      </button>
                    ))}
                  </div>
                  <div className='grid grid-cols-3 gap-3'>
                    {(selectedBucketOption === 'weight'
                      ? weightOptions
                      : bucketSizeOptions
                    ).map(opt => {
                      const val = typeof opt === 'object' ? opt.value : opt
                      return (
                        <button
                          key={val}
                          onClick={() =>
                            selectedBucketOption === 'weight'
                              ? setSelectedWeight(val)
                              : setSelectedBucketSize(val)
                          }
                          className={`py-4 rounded-2xl text-base font-black border-2 transition-all ${
                            (selectedBucketOption === 'weight'
                              ? selectedWeight
                              : selectedBucketSize) === val
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-gray-50 text-gray-400'
                          }`}
                        >
                          {val} кг
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Обычный выбор кг/шт */}
              {!product.bucket && !productType.isGramProduct && (
                <div>
                  <label className='text-sm font-black uppercase text-gray-400 tracking-widest block mb-4'>
                    Оберіть об'єм:
                  </label>
                  <div className='grid grid-cols-3 gap-3'>
                    {(productType.isPieceProduct
                      ? pieceOptions
                      : productType.isLiquidProduct
                      ? literOptions
                      : weightOptions
                    ).map(v => (
                      <button
                        key={v}
                        onClick={() => {
                          if (productType.isPieceProduct) setSelectedPieces(v)
                          else if (productType.isLiquidProduct)
                            setSelectedLiters(v)
                          else setSelectedWeight(v)
                        }}
                        className={`py-4 rounded-[1.5rem] text-lg font-black transition-all border-2 ${
                          (productType.isPieceProduct
                            ? selectedPieces
                            : productType.isLiquidProduct
                            ? selectedLiters
                            : selectedWeight) === v
                            ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                            : 'bg-white border-gray-100 text-gray-500'
                        }`}
                      >
                        {v}{' '}
                        {productType.isPieceProduct
                          ? 'шт'
                          : productType.isLiquidProduct
                          ? 'л'
                          : 'кг'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Состав */}
              {product.compound && (
                <div className='bg-gray-50 p-6 rounded-[2rem]'>
                  <h4 className='text-sm font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2'>
                    <FontAwesomeIcon
                      icon={faUtensils}
                      className='text-orange-500'
                    />{' '}
                    Склад продукту:
                  </h4>
                  <p className='text-gray-700 font-medium leading-relaxed text-lg'>
                    {product.compound}
                  </p>
                </div>
              )}

              {/* Описание */}
              {product.description && (
                <div className='flex gap-4 p-4'>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className='text-orange-300 mt-1'
                  />
                  <p className='text-gray-500 text-lg leading-relaxed italic'>
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* ПЛАВАЮЩИЙ БЛОК ПОКУПКИ */}
            <div className='fixed bottom-8 left-4 right-4 z-50 md:static md:mt-12'>
              <div className='bg-white/95 backdrop-blur-xl p-5 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:shadow-none md:bg-transparent md:p-0'>
                <div className='flex items-center justify-between mb-5 px-2'>
                  <div className='flex flex-col'>
                    <span className='text-[11px] font-black uppercase text-gray-400 tracking-widest'>
                      Підсумок:
                    </span>
                    <span className='text-4xl font-black text-gray-900'>
                      {calculatedPrice}
                    </span>
                  </div>

                  {/* Количество упаковок */}
                  <div className='flex items-center bg-gray-100 rounded-[1.5rem] p-1.5'>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className='w-12 h-12 flex items-center justify-center text-2xl font-black text-gray-500 active:scale-90'
                    >
                      –
                    </button>
                    <span className='w-10 text-center font-black text-xl text-gray-900'>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className='w-12 h-12 flex items-center justify-center text-2xl font-black text-gray-500 active:scale-90'
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  disabled={product.isAccessible}
                  onClick={handleAddToCart}
                  className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all active:scale-95
                    ${
                      product.isAccessible
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-gray-900 text-white hover:bg-orange-600 shadow-2xl shadow-orange-200'
                    }
                  `}
                >
                  <FontAwesomeIcon icon={faCartPlus} size='lg' />
                  <span className='font-black uppercase tracking-[0.2em] text-base'>
                    {product.isAccessible
                      ? 'Очікується'
                      : 'Додати до замовлення'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
