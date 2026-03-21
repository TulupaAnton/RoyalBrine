import React, { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
  faCartPlus,
  faCheckCircle,
  faPlay,
  faFire,
  faStar,
  faClock,
  faHeart,
  faLeaf,
  faWeightHanging
} from '@fortawesome/free-solid-svg-icons'
import { useCartStore } from '../../store/cartStore'
import { toast, Toaster } from 'react-hot-toast'
import paska1 from '../../assets/products/paska1.jpg'
import paska2 from '../../assets/products/paska2.jpg'
import paska3 from '../../assets/products/paska3.jpg'
import zaglushka from '../../assets/zaglushka.jpg'

// Weight options per paska (only for paskas with hasFilling or specific weight config)
const WEIGHT_OPTIONS = {
  zavarna: [
    { id: '500', label: '500 г', priceRaw: 300 },
    { id: '300', label: '300 г', priceRaw: 180 }
  ],
  vershkova: [
    { id: '500', label: '500 г', priceRaw: 310 },
    { id: '300', label: '300 г', priceRaw: 190 }
  ]
}

// Filling extra prices per weight
// Key: `${paskaId}-${weightId}-${fillingId}`
const FILLING_EXTRAS = {
  'zavarna-500-pistachio': 210,
  'zavarna-500-tres-leches': 250,
  'zavarna-300-pistachio': 126,
  'zavarna-300-tres-leches': 150,
  'vershkova-500-pistachio': 210,
  'vershkova-500-tres-leches': 250,
  'vershkova-300-pistachio': 126,
  'vershkova-300-tres-leches': 150
}

const PASKAS = [
  {
    id: 'zavarna',
    name: 'Заварна паска ',
    subtitle: 'з додаванням заварного тіста',
    badgeIcon: faFire,
    description:
      'Ніжна паска на заварному тісті з родзинками. Неймовірно волога, ароматна, з глибоким смаком і золотистою скоринкою. Ідеальна структура тіста — пориста, але щільна. ',
    price: '180 грн',
    priceRaw: 180,
    images: [paska1, paska2, paska3],
    videoUrl: null,
    color: '#C9873A',
    bgLight: '#FEF3E2',
    hasFilling: true,
    hasWeightChoice: true
  },
  {
    id: 'vershkova',
    name: 'Вершкова паска з шоколадом',
    subtitle: 'з шоколадними дропсами',
    badgeIcon: faStar,
    description:
      'Повітряна вершкова паска з преміум-шоколадними дропсами. Тане в роті, з вершковим ароматом та шоколадними вкрапленнями у кожному шматочку. Приготовлено на натуральних вершках без замінників.',
    price: '190 грн',
    priceRaw: 190,
    images: [paska1, paska2, paska3],
    videoUrl: null,
    color: '#6B3A2A',
    bgLight: '#F5EAE5',
    hasFilling: true,
    hasWeightChoice: true
  },
  {
    id: 'paneton',
    name: 'Панетон',
    subtitle: 'італійська традиція',
    badge: 'Преміум',
    badgeIcon: faStar,
    description:
      'Класичний італійський панетон за автентичним рецептом. Висока, легка, з ніжною пористою текстурою та неповторним ароматом ванілі й цитрусу. Тісто дозріває 48 годин для ідеальної структури.',
    weight: '600 г',
    price: '220 грн',
    priceRaw: 220,
    images: [paska1, paska2, paska3],
    videoUrl: null,
    color: '#A07840',
    bgLight: '#FDF3DC',
    hasFilling: false,
    hasWeightChoice: false,
    disabledMsg: 'Вже печемо! Скоро буде готовий 🔥',
    availableSoon: true
  },
  {
    id: 'kraffin',
    name: 'Крафін',
    subtitle: 'croissant + muffin',
    badge: 'Трендовий',
    badgeIcon: faFire,
    description:
      'Неймовірний гібрид круасана та мафіна з хрусткими шарами листкового тіста. Апетитний розлом та карамельна скоринка залишать незабутні враження. Кожен шар просочується ніжним кремом.',
    weight: '350 г',
    price: '190 грн',
    priceRaw: 190,
    images: [zaglushka, zaglushka, zaglushka],
    videoUrl: null,
    color: '#8B5E3C',
    bgLight: '#FBF0E8',
    hasFilling: false,
    hasWeightChoice: false,
    disabledMsg: "Готуємо з любов'ю, скоро буде ✨",
    availableSoon: true
  }
]

const FILLINGS = [
  {
    id: 'raisin',
    emoji: '🍇',
    name: 'Звичайна з родзинками',
    description: 'Класична домашня паска з родзинками',
    price: null
  },
  {
    id: 'pistachio',
    emoji: '🍓',
    name: 'Фісташкова з полуницею',
    description: 'Ніжний фісташковий крем + полуничний крем ',
    price: true // dynamic, see FILLING_EXTRAS
  },
  {
    id: 'tres-leches',
    emoji: '🥛',
    name: 'Молочна ',
    description: 'маскарпоне, згущене молоко, вершковий сир',
    price: true // dynamic, see FILLING_EXTRAS
  }
]

/* ─── HELPERS ────────────────────────────────────────────── */
function getFillingExtra (paskaId, weightId, fillingId) {
  if (!fillingId || fillingId === 'raisin') return 0
  const key = `${paskaId}-${weightId}-${fillingId}`
  return FILLING_EXTRAS[key] || 0
}

function getFillingPriceLabel (paskaId, weightId, fillingId) {
  const extra = getFillingExtra(paskaId, weightId, fillingId)
  return extra ? `+${extra} грн` : null
}

/* ─── WEIGHT SELECTOR ────────────────────────────────────── */
function WeightSelector ({ paska, selectedWeight, onSelect }) {
  const options = WEIGHT_OPTIONS[paska.id]
  if (!options) return null

  return (
    <div className='mb-7'>
      <div className='mb-3 flex items-center gap-2'>
        <FontAwesomeIcon
          icon={faWeightHanging}
          style={{ color: paska.color }}
          className='text-sm'
        />
        <span
          className='text-[11px] font-black uppercase tracking-widest'
          style={{ color: paska.color }}
        >
          Оберіть вагу
        </span>
      </div>
      <div className='flex gap-3'>
        {options.map(opt => {
          const isSelected = selectedWeight === opt.id
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(opt.id)}
              className='flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1'
              style={{
                background: isSelected ? paska.color + '12' : 'white',
                borderColor: isSelected ? paska.color : '#F0EFEC'
              }}
            >
              <span
                className='text-lg font-black'
                style={{ color: isSelected ? paska.color : '#2D241E' }}
              >
                {opt.label}
              </span>
              <span
                className='text-sm font-extrabold'
                style={{ color: isSelected ? paska.color : '#6B7280' }}
              >
                {opt.priceRaw} грн
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── AVAILABLE SOON BANNER ──────────────────────────────── */
function AvailableSoonBanner ({ paska }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className='rounded-[2rem] overflow-hidden mb-6'
      style={{
        background: `linear-gradient(135deg, ${paska.bgLight} 0%, ${paska.bgLight}cc 100%)`
      }}
    >
      <div className='relative flex flex-col items-center justify-center py-12 px-6 text-center'>
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className='text-6xl mb-4 select-none'
        >
          🍞
        </motion.div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className='flex items-center gap-2 mb-4'
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [-6, 0, -6], opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut'
              }}
              className='text-2xl select-none'
            >
              ♨️
            </motion.div>
          ))}
        </motion.div>

        <div
          className='inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-white text-[11px] font-black uppercase tracking-widest shadow-sm'
          style={{ background: paska.color }}
        >
          <FontAwesomeIcon icon={faClock} className='text-[10px]' />
          Незабаром
        </div>

        <h3 className='text-xl font-black mb-2' style={{ color: paska.color }}>
          {paska.disabledMsg}
        </h3>
        <p className='text-sm text-gray-500 font-medium leading-relaxed max-w-xs'>
          Цей виріб зараз готується. Слідкуйте за оновленнями — ми повідомимо,
          щойно він з'явиться!
        </p>

        <div className='mt-6 flex items-center gap-3'>
          <div className='flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white shadow-sm'>
            <FontAwesomeIcon icon={faHeart} className='text-rose-400 text-sm' />
            <span className='text-xs font-black text-gray-600'>
              Зберегти у списку бажань
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── PAGE COMPONENT ─────────────────────────────────────── */
export function PaskaProductPage () {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCartStore()

  const paska = useMemo(() => PASKAS.find(p => p.id === id), [id])

  // Default weight: first option if hasWeightChoice, else null
  const defaultWeight = paska?.hasWeightChoice
    ? WEIGHT_OPTIONS[paska.id]?.[0]?.id ?? null
    : null

  const [selectedWeight, setSelectedWeight] = useState(defaultWeight)
  const [selectedFilling, setSelectedFilling] = useState(FILLINGS[0].id)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [added, setAdded] = useState(false)

  if (!paska) {
    return (
      <div className='min-h-screen bg-[#FDFCFB] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-400 font-bold mb-4'>Пасочку не знайдено</p>
          <Link to='/' className='text-orange-600 font-black underline'>
            На головну
          </Link>
        </div>
      </div>
    )
  }

  // Resolve current base price
  const currentWeightOption = paska.hasWeightChoice
    ? WEIGHT_OPTIONS[paska.id]?.find(w => w.id === selectedWeight)
    : null

  const basePrice = currentWeightOption
    ? currentWeightOption.priceRaw
    : paska.priceRaw
  const currentWeight = currentWeightOption
    ? currentWeightOption.label
    : paska.weight ?? ''

  const activeFilling = paska.hasFilling
    ? FILLINGS.find(f => f.id === selectedFilling)
    : null

  const fillingExtra =
    paska.hasFilling && activeFilling
      ? getFillingExtra(paska.id, selectedWeight, activeFilling.id)
      : 0

  const totalPrice = basePrice + fillingExtra

  const handleAddToCart = () => {
    if (paska.availableSoon) return

    const cartItem = {
      id: paska.hasFilling
        ? `paska-${paska.id}-${selectedWeight}-${selectedFilling}`
        : `paska-${paska.id}-${selectedWeight}`,
      name: paska.name,
      subtitle: activeFilling
        ? `Начинка: ${activeFilling.name}`
        : paska.subtitle,
      price: `${totalPrice} грн`,
      priceRaw: totalPrice,
      weight: currentWeight,
      images: [paska.images[photoIdx]],
      category: 'paska',
      filling: activeFilling?.name || null,
      fillingEmoji: activeFilling?.emoji || null,
      design: photoIdx + 1,
      designLabel: `Дизайн №${photoIdx + 1}`
    }
    addToCart(cartItem, 'paska')
    setAdded(true)
    toast.success('Пасочку додано до кошика! 🐣', { duration: 2000 })
    setTimeout(() => setAdded(false), 2500)
  }

  const prevPhoto = () =>
    setPhotoIdx(prev => (prev === 0 ? paska.images.length - 1 : prev - 1))
  const nextPhoto = () =>
    setPhotoIdx(prev => (prev === paska.images.length - 1 ? 0 : prev + 1))

  return (
    <div className='min-h-screen bg-[#FDFCFB] text-[#2D241E] pb-40'>
      <Toaster position='top-center' />

      {/* ── HEADER ── */}
      <header className='sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-xl border-b border-gray-100'>
        <div className='container mx-auto px-4 py-4 flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='w-11 h-11 flex items-center justify-center bg-white shadow-sm border border-gray-100 rounded-full text-gray-800 flex-shrink-0'
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className='min-w-0'>
            <p className='text-[10px] font-black uppercase tracking-widest text-gray-400'>
              Великодні Паски
            </p>
            <h1 className='text-base sm:text-lg font-black tracking-tight leading-tight line-clamp-1'>
              {paska.name}
            </h1>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 py-6 max-w-2xl'>
        {/* ── PHOTO GALLERY ── */}
        <div
          className='relative rounded-[2.5rem] overflow-hidden mb-6 bg-gray-100'
          style={{ aspectRatio: '1/1' }}
        >
          <AnimatePresence mode='wait'>
            <motion.img
              key={photoIdx}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={paska.images[photoIdx]}
              alt={paska.name}
              className={`w-full h-full object-cover ${
                paska.availableSoon ? 'grayscale-[50%] opacity-80' : ''
              }`}
            />
          </AnimatePresence>

          {/* Бейдж поточного дизайну */}
          {!paska.availableSoon && (
            <div className='absolute top-5 right-5 z-10 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full'>
              Дизайн №{photoIdx + 1}
            </div>
          )}

          {/* Available soon overlay */}
          {paska.availableSoon && (
            <div className='absolute inset-0 bg-gradient-to-t from-[#1a1009]/70 via-transparent to-transparent flex flex-col items-center justify-end p-6'>
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className='flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-5 py-2.5 mb-2'
              >
                <FontAwesomeIcon
                  icon={faClock}
                  className='text-orange-300 text-sm'
                />
                <span className='text-white text-xs font-black uppercase tracking-wider'>
                  Вже печемо
                </span>
              </motion.div>
            </div>
          )}

          {/* Nav arrows */}
          {paska.images.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className='absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md z-10'
              >
                <FontAwesomeIcon icon={faChevronLeft} className='text-sm' />
              </button>
              <button
                onClick={nextPhoto}
                className='absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md z-10'
              >
                <FontAwesomeIcon icon={faChevronRight} className='text-sm' />
              </button>
            </>
          )}

          {/* Dots + video button */}
          <div className='absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10'>
            {paska.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === photoIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
            {paska.videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className='ml-1 w-7 h-7 bg-black/60 backdrop-blur rounded-full flex items-center justify-center shadow-md'
                title='Відео розлому'
              >
                <FontAwesomeIcon
                  icon={faPlay}
                  className='text-white text-[9px]'
                />
              </button>
            )}
          </div>

          {/* Badge */}
          <div
            className='absolute top-5 left-5 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md z-10'
            style={{ background: paska.color }}
          >
            <FontAwesomeIcon icon={paska.badgeIcon} className='text-[8px]' />
            {paska.badge}
          </div>
        </div>

        {/* ── THUMBNAILS ── */}
        {paska.images.length > 1 && (
          <div className='flex gap-3 mb-6 overflow-x-auto no-scrollbar'>
            {paska.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all relative ${
                  i === photoIdx ? 'shadow-md' : 'border-transparent opacity-50'
                }`}
                style={{
                  borderColor: i === photoIdx ? paska.color : 'transparent'
                }}
              >
                <img src={img} alt='' className='w-full h-full object-cover' />
                <div className='absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-black rounded px-1 leading-tight'>
                  №{i + 1}
                </div>
              </button>
            ))}
            {paska.videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className='flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-900 flex items-center justify-center border-2 border-transparent opacity-70 hover:opacity-100 transition-all'
              >
                <FontAwesomeIcon icon={faPlay} className='text-white text-sm' />
              </button>
            )}
          </div>
        )}

        {/* ── TITLE & PRICE ── */}
        <div className='mb-5'>
          <p
            className='text-[10px] font-black uppercase tracking-widest mb-1 opacity-70'
            style={{ color: paska.color }}
          >
            {paska.subtitle}
          </p>
          <h2 className='text-2xl sm:text-3xl font-black text-[#2D241E] leading-tight mb-3'>
            {paska.name}
          </h2>
          <div className='flex items-baseline gap-3'>
            <span
              className='text-3xl sm:text-4xl font-extrabold'
              style={{ color: paska.color }}
            >
              {totalPrice} грн
            </span>
            <span className='text-sm text-gray-400 font-medium'>
              {currentWeight}
            </span>
          </div>
          {fillingExtra > 0 && (
            <p className='text-xs text-gray-400 font-medium mt-1'>
              Паска {basePrice} грн + начинка +{fillingExtra} грн
            </p>
          )}
        </div>

        {/* ── DESCRIPTION ── */}
        <div className='bg-gray-50 rounded-2xl px-5 py-5 mb-7'>
          <p className='text-sm sm:text-base text-gray-600 leading-relaxed font-medium'>
            {paska.description}
          </p>
        </div>

        {/* ── WEIGHT SELECTOR ── */}
        {paska.hasWeightChoice && !paska.availableSoon && (
          <WeightSelector
            paska={paska}
            selectedWeight={selectedWeight}
            onSelect={setSelectedWeight}
          />
        )}

        {/* ── ВИБРАНИЙ ДИЗАЙН ІНФО-РЯДОК ── */}
        {!paska.availableSoon && (
          <div
            className='rounded-2xl px-5 py-3 mb-6 flex items-center gap-3 border'
            style={{
              background: paska.bgLight,
              borderColor: paska.color + '33'
            }}
          >
            <span className='text-lg'>📸</span>
            <p className='text-sm font-black' style={{ color: paska.color }}>
              Обраний дизайн:{' '}
              <span className='font-black'>№{photoIdx + 1}</span>
              <span className='font-medium text-gray-500 ml-2 text-xs'>
                (перегляньте фото вище, щоб обрати інший)
              </span>
            </p>
          </div>
        )}

        {/* ── AVAILABLE SOON BANNER ── */}
        {paska.availableSoon && <AvailableSoonBanner paska={paska} />}

        {/* ── FILLING SELECTOR ── */}
        {paska.hasFilling && !paska.availableSoon && (
          <div className='mb-8'>
            <div className='mb-4'>
              <div
                className='w-full flex items-center justify-center gap-3 py-4 rounded-2xl mb-2 shadow-sm'
                style={{ background: paska.color }}
              >
                <span className='text-xl'>🎁</span>
                <span className='text-base font-black text-white uppercase tracking-[0.15em]'>
                  ОБЕРІТЬ НАЧИНКУ
                </span>
              </div>
              <p className='text-center text-[11px] text-gray-400 font-bold uppercase tracking-widest'>
                за замовчуванням — ізюм
              </p>
            </div>

            <div className='space-y-3'>
              {FILLINGS.map(filling => {
                const isSelected = selectedFilling === filling.id
                const priceLabel =
                  filling.id !== 'raisin'
                    ? getFillingPriceLabel(paska.id, selectedWeight, filling.id)
                    : null
                return (
                  <motion.button
                    key={filling.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFilling(filling.id)}
                    className='w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left'
                    style={{
                      background: isSelected ? paska.color + '12' : 'white',
                      borderColor: isSelected ? paska.color : '#F0EFEC'
                    }}
                  >
                    <span className='text-2xl sm:text-3xl flex-shrink-0'>
                      {filling.emoji}
                    </span>
                    <div className='flex-grow min-w-0'>
                      <p
                        className='font-black text-sm sm:text-base'
                        style={{ color: isSelected ? paska.color : '#2D241E' }}
                      >
                        {filling.name}
                        {!priceLabel && (
                          <span className='ml-2 text-[9px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider'>
                            дефолт
                          </span>
                        )}
                      </p>
                      <p className='text-[11px] sm:text-xs text-gray-400 font-medium mt-0.5'>
                        {filling.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0'>
                      <span className='text-[11px] font-black text-gray-400'>
                        {priceLabel || 'Без доплати'}
                      </span>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className='w-6 h-6 rounded-full flex items-center justify-center'
                            style={{ background: paska.color }}
                          >
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className='text-white text-[10px]'
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── NO FILLING INFO ── */}
        {!paska.hasFilling && !paska.availableSoon && (
          <div
            className='rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 border'
            style={{
              background: paska.bgLight,
              borderColor: paska.color + '33'
            }}
          >
            <FontAwesomeIcon
              icon={faLeaf}
              style={{ color: paska.color }}
              className='text-lg flex-shrink-0'
            />
            <p className='text-sm font-bold' style={{ color: paska.color }}>
              Цей виріб виготовляється за класичним рецептом без додаткової
              начинки.
            </p>
          </div>
        )}

        {/* ── ADD TO CART ── */}
        <div className='fixed bottom-0 left-0 right-0 p-4 bg-[#FDFCFB]/90 backdrop-blur-xl border-t border-gray-100 z-30 md:relative md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:backdrop-blur-none md:border-0'>
          <div className='container mx-auto max-w-2xl'>
            {paska.availableSoon ? (
              <div className='w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 bg-gray-100 text-gray-400 cursor-not-allowed'>
                <FontAwesomeIcon icon={faClock} />
                Скоро з'явиться
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className='w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl text-white'
                style={{ background: added ? '#22C55E' : paska.color }}
              >
                {added ? (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Додано до кошика!
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCartPlus} />
                    Додати до кошика · {totalPrice} грн
                  </>
                )}
              </motion.button>
            )}

            {!paska.availableSoon && activeFilling && (
              <p className='text-center text-[11px] text-gray-400 font-medium mt-2'>
                {activeFilling.emoji} {activeFilling.name} · ⚖️ {currentWeight}{' '}
                · 📸 Дизайн №{photoIdx + 1}
              </p>
            )}
            {!paska.availableSoon && !activeFilling && (
              <p className='text-center text-[11px] text-gray-400 font-medium mt-2'>
                {paska.subtitle} · ⚖️ {currentWeight} · 📸 Дизайн №
                {photoIdx + 1}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* ── VIDEO MODAL ── */}
      <AnimatePresence>
        {showVideo && paska.videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4'
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className='w-full max-w-md rounded-3xl overflow-hidden'
              onClick={e => e.stopPropagation()}
            >
              <video
                src={paska.videoUrl}
                controls
                autoPlay
                className='w-full rounded-3xl'
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PaskaProductPage
