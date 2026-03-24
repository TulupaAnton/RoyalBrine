import React, { useState, useEffect, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faTimes,
  faStar,
  faTruck
} from '@fortawesome/free-solid-svg-icons'

// ─────────────────────────────────────────────
// Константы
// ─────────────────────────────────────────────
// Пасха в Україні 2026 — 5 квітня
const EASTER_DATE = new Date('2026-04-12T00:00:00')

const FEATURES = [
  '🫙 Домашній рецепт',
  '🌾 Без консервантів',
  '🎀 Святкове пакування',
  '📦 Доставка по місту'
]

function calcTimeLeft (target) {
  const diff = target - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000)
  }
}

// ─────────────────────────────────────────────
// Хук таймера
// ─────────────────────────────────────────────
function useCountdown (target) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(target))
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line
  return timeLeft
}

// ─────────────────────────────────────────────
// Единица таймера — memo: не ререндерит соседей
// ─────────────────────────────────────────────
const CountdownUnit = memo(function CountdownUnit ({ value, label }) {
  return (
    <div className='flex flex-col items-center'>
      <div className='w-14 h-14 sm:w-16 sm:h-16 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center mb-1.5'>
        <span className='text-xl sm:text-2xl font-black text-white tabular-nums leading-none'>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className='text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-orange-200'>
        {label}
      </span>
    </div>
  )
})

// ─────────────────────────────────────────────
// Изолированный блок таймера
// ─────────────────────────────────────────────
const EasterCountdown = memo(function EasterCountdown () {
  const { days, hours, minutes, seconds } = useCountdown(EASTER_DATE)
  return (
    <div className='text-center'>
      <p className='text-orange-200/70 text-[9px] font-black uppercase tracking-[0.25em] mb-3'>
        До Великодня залишилось
      </p>
      <div className='flex items-center gap-2 sm:gap-3'>
        <CountdownUnit value={days} label='Днів' />
        <span className='text-white/30 text-xl font-black pb-5' aria-hidden>
          :
        </span>
        <CountdownUnit value={hours} label='Годин' />
        <span className='text-white/30 text-xl font-black pb-5' aria-hidden>
          :
        </span>
        <CountdownUnit value={minutes} label='Хвилин' />
        <span className='text-white/30 text-xl font-black pb-5' aria-hidden>
          :
        </span>
        <CountdownUnit value={seconds} label='Секунд' />
      </div>
    </div>
  )
})

// ─────────────────────────────────────────────
// Варианты анимаций
// ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}
const fadeUpDelayed = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }
  }
}

// ═════════════════════════════════════════════
// 1. ANNOUNCEMENT BAR
// ═════════════════════════════════════════════
export function EasterAnnouncementBar () {
  const [visible, setVisible] = useState(true)
  const hide = useCallback(() => setVisible(false), [])

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key='easter-bar'
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className='relative z-50 overflow-hidden'
          style={{
            background:
              'linear-gradient(90deg, #92400e 0%, #d97706 45%, #b45309 75%, #92400e 100%)'
          }}
        >
          <div className='flex items-center justify-center gap-2 px-10 py-2.5 text-white min-h-[40px]'>
            <span
              className='hidden sm:inline select-none text-base'
              aria-hidden
            >
              🥚
            </span>

            {/* Короткий текст на мобиле, полный на sm+ */}
            <span className='text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-center leading-snug'>
              <span className='sm:hidden'>
                🌸 Паски — передзамовлення! Доставка по Запоріжжю 11 квітня 🚚
              </span>
              <span className='hidden sm:inline'>
                🌸 Паски зараз у передзамовленні — доставка по Запоріжжю у
                суботу, 11 квітня. Встигніть замовити!
              </span>
            </span>

            <Link
              to='/catalog/paska'
              className='hidden sm:inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ml-1 touch-manipulation'
            >
              Замовити{' '}
              <FontAwesomeIcon icon={faArrowRight} className='text-[8px]' />
            </Link>

            <span
              className='hidden sm:inline select-none text-base'
              aria-hidden
            >
              🌷
            </span>

            <button
              onClick={hide}
              aria-label='Закрити оголошення'
              className='absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 active:opacity-100 transition-opacity touch-manipulation'
            >
              <FontAwesomeIcon icon={faTimes} className='text-xs' />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═════════════════════════════════════════════
// 2. EASTER SECTION
// ═════════════════════════════════════════════
export function EasterSection ({ paskaImage }) {
  return (
    <section className='relative overflow-hidden'>
      <div
        className='relative flex items-center'
        style={{
          background:
            'linear-gradient(135deg, #431407 0%, #7c2d12 30%, #92400e 60%, #78350f 100%)'
        }}
      >
        {/* ── Декоративный фон ── */}
        <div
          className='absolute inset-0 pointer-events-none overflow-hidden'
          aria-hidden='true'
        >
          <div className='absolute -right-20 -top-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-orange-400/10 border border-orange-300/10' />
          <div className='absolute -right-10 -top-10 w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-orange-400/10 border border-orange-300/10' />

          <div
            className='hidden md:block absolute inset-0 opacity-5'
            style={{
              backgroundImage:
                'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />

          <svg
            className='absolute top-0 left-0 w-full'
            viewBox='0 0 1440 60'
            fill='none'
            preserveAspectRatio='none'
          >
            <path
              d='M0,30 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,0 L0,0 Z'
              fill='#FDFCFB'
            />
          </svg>

          <svg
            className='absolute bottom-0 left-0 w-full'
            viewBox='0 0 1440 60'
            fill='none'
            preserveAspectRatio='none'
          >
            <path
              d='M0,30 C360,60 720,0 1080,30 C1260,45 1380,38 1440,30 L1440,60 L0,60 Z'
              fill='#FDFCFB'
            />
          </svg>
        </div>

        {/* ── Контент ── */}
        <div className='relative z-10 w-full px-4 sm:px-6 pt-20 pb-20 sm:pt-24 sm:pb-24 md:pt-28 md:pb-28 max-w-7xl mx-auto'>
          <div className='flex flex-col lg:flex-row items-center gap-10 lg:gap-16'>
            {/* ── ЛЕВАЯ ЧАСТЬ ── */}
            <motion.div
              variants={fadeUp}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.15 }}
              className='flex-1 w-full text-center lg:text-left'
            >
              {/* Бейдж */}
              <div className='inline-flex items-center gap-2 bg-orange-400/20 border border-orange-300/30 px-4 py-1.5 rounded-full mb-5'>
                <span className='text-base' aria-hidden>
                  🌷
                </span>
                <span className='text-[10px] font-black uppercase tracking-[0.25em] text-orange-200'>
                  Великдень 2025
                </span>
                <span className='text-base' aria-hidden>
                  🌷
                </span>
              </div>

              {/* Заголовок */}
              <h2 className='text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black text-white leading-[0.92] tracking-tighter mb-4'>
                Паски до
                <br />
                <span className='text-orange-300 font-serif font-light italic'>
                  Великодня
                </span>
              </h2>

              <p className='text-orange-100/80 text-base sm:text-lg font-medium leading-relaxed mb-7 max-w-sm sm:max-w-md mx-auto lg:mx-0'>
                Пишні, запашні, з родзинками та ніжною глазур'ю — справжні
                домашні паски за бабусиним рецептом.{' '}
                <strong className='text-orange-300 font-black not-italic'>
                  Обмежена кількість!
                </strong>
              </p>

              {/* Теги */}
              <div className='flex flex-wrap gap-2 mb-5 justify-center lg:justify-start'>
                {FEATURES.map(f => (
                  <span
                    key={f}
                    className='bg-white/10 border border-white/15 text-white text-[11px] font-bold px-3 py-1.5 rounded-full'
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* ── ИНФО О ПРЕДЗАКАЗЕ И ДОСТАВКЕ ── */}
              <div className='inline-flex items-center gap-3 bg-orange-400/15 border border-orange-300/25 px-4 py-3 rounded-2xl mb-8 justify-center lg:justify-start'>
                <FontAwesomeIcon
                  icon={faTruck}
                  className='text-orange-300 text-sm flex-shrink-0'
                />
                <div className='text-left'>
                  <p className='text-white text-[12px] font-black uppercase tracking-wider leading-tight'>
                    Зараз приймаємо передзамовлення
                  </p>
                  <p className='text-orange-200/80 text-[11px] font-medium mt-0.5'>
                    🚚 Доставка по Запоріжжю — субота, 11 квітня
                  </p>
                </div>
              </div>

              {/* Кнопки */}
              <div className='flex flex-col xs:flex-row gap-3 justify-center lg:justify-start'>
                <Link
                  to='/catalog/paska'
                  className='inline-flex items-center justify-center gap-2.5 bg-orange-400 hover:bg-orange-300 active:bg-orange-500 transition-colors text-[#431407] font-black py-4 px-7 rounded-2xl text-[13px] uppercase tracking-wider shadow-xl shadow-orange-950/40 touch-manipulation'
                >
                  Замовити паску
                  <FontAwesomeIcon icon={faArrowRight} className='text-xs' />
                </Link>
                <Link
                  to='/contact'
                  className='inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 transition-colors text-white font-black py-4 px-7 rounded-2xl text-[13px] uppercase tracking-wider touch-manipulation'
                >
                  Запитати більше
                </Link>
              </div>
            </motion.div>

            {/* ── ПРАВАЯ ЧАСТЬ ── */}
            <motion.div
              variants={fadeUpDelayed}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.15 }}
              className='flex-1 w-full flex flex-col items-center gap-7 pb-4'
            >
              {/* Фото паски */}
              <div className='relative'>
                <div className='w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-[6px] border-orange-400/30 shadow-2xl shadow-orange-950/50'>
                  {paskaImage ? (
                    <img
                      src={paskaImage}
                      alt='Домашня паска'
                      className='w-full h-full object-cover'
                      loading='lazy'
                      decoding='async'
                    />
                  ) : (
                    <div className='w-full h-full bg-orange-900/40 flex items-center justify-center'>
                      <span
                        className='text-6xl sm:text-7xl'
                        role='img'
                        aria-label='паска'
                      >
                        🧁
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className='absolute -top-3 -right-3 w-11 h-11 sm:w-14 sm:h-14 bg-orange-400 rounded-full flex items-center justify-center shadow-lg text-lg sm:text-2xl animate-spin'
                  style={{ animationDuration: '14s' }}
                  aria-hidden='true'
                >
                  ✨
                </div>

                <div className='absolute -bottom-4 -left-2 sm:-left-4 bg-white rounded-2xl px-3 py-1.5 shadow-xl'>
                  <div className='flex items-center gap-1.5'>
                    <div className='flex text-orange-400 gap-0.5'>
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className='text-[7px]'
                        />
                      ))}
                    </div>
                    <span className='text-[9px] font-black text-gray-700 uppercase tracking-wide whitespace-nowrap'>
                      Топ сезону
                    </span>
                  </div>
                </div>
              </div>

              {/* Таймер */}
              <EasterCountdown />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
