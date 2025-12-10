import React, { useMemo } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faGift, faStar } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons'
// iOS detection
const isIOS =
  typeof navigator !== 'undefined' &&
  /iPhone|iPad|iPod/i.test(navigator.userAgent)

export function Block () {
  const hour = new Date().getHours()

  const ctaText =
    hour < 10
      ? 'Ранкові набори'
      : hour < 16
      ? 'Святковий обід'
      : 'Новорічна вечеря'

  const snowflakes = useMemo(
    () =>
      Array.from({ length: isIOS ? 0 : 6 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2
      })),
    []
  )

  const scrollToCategories = () => {
    const el = document.getElementById('categories')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className='relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#7c2d12] to-[#064e3b]'>
      {/* Лёгкие снежинки (ТОЛЬКО на десктопе) */}
      {!isIOS &&
        snowflakes.map(flake => (
          <motion.div
            key={flake.id}
            className='absolute text-white/20 text-xs'
            style={{ left: flake.left, top: '-10px' }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: '100vh', opacity: [0, 1, 0] }}
            transition={{
              duration: 6,
              delay: flake.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            ❄
          </motion.div>
        ))}

      {/* Контент */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='relative z-10 max-w-4xl text-center px-6'
      >
        {/* Заголовок */}
        <h1 className='text-4xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-yellow-300 via-red-400 to-green-400 bg-clip-text text-transparent'>
          Royal Brine
        </h1>

        <p className='text-lg md:text-2xl text-yellow-100 opacity-90 mb-10'>
          Святково • Смачно • По-домашньому 🎄
        </p>

        {/* Кнопка */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={scrollToCategories}
          className='inline-flex items-center gap-4 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 
                     text-white px-10 py-5 rounded-full shadow-xl text-lg font-bold transition-all'
        >
          {ctaText}
          <FontAwesomeIcon icon={faArrowRight} />
        </motion.button>

        {/* Текст под кнопкой */}
        <div className='mt-10 text-sm md:text-base text-yellow-200'>
          🎄 Замовляйте до 26 грудня (включно) — гарантована доставка на
          святковий стіл! <br />
        </div>
        <div className='mb-6 flex flex-col items-center mt-10'>
          <h3 className='text-lg font-bold mb-4 uppercase flex items-center justify-center'>
            <FontAwesomeIcon icon={faStar} className='text-yellow-400 mr-2' />
            <span className='bg-gradient-to-r  from-yellow-300 via-amber-300 to-red-300 bg-clip-text text-transparent'>
              Наші Соцмережі
            </span>
          </h3>

          <ul className='text-amber-100 text-sm space-y-4 flex flex-col items-center'>
            <li>
              <motion.a
                href='https://www.instagram.com/royal_brine/'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-red-300 flex items-center space-x-2 transition-all duration-300 hover:scale-105 group'
                whileHover={{ x: 5 }}
              >
                <motion.div
                  className='w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center shadow-lg'
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FontAwesomeIcon
                    icon={faInstagram}
                    className='w-4 h-4 text-white'
                  />
                </motion.div>
                <div className='text-center'>
                  <span className='font-medium'>Instagram</span>
                  <p className='text-xs text-gray-400 group-hover:text-gray-300'>
                    Новорічні акції та рецепти
                  </p>
                </div>
              </motion.a>
            </li>

            <li>
              <motion.a
                href='https://www.tiktok.com/@royal.brine'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-green-300 flex items-center space-x-2 transition-all duration-300 hover:scale-105 group'
                whileHover={{ x: 5 }}
              >
                <motion.div
                  className='w-8 h-8 rounded-full bg-gradient-to-r from-black to-gray-800 flex items-center justify-center shadow-lg'
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FontAwesomeIcon
                    icon={faTiktok}
                    className='w-4 h-4 text-white'
                  />
                </motion.div>
                <div className='text-center'>
                  <span className='font-medium'>TikTok</span>
                  <p className='text-xs text-gray-400 group-hover:text-gray-300'>
                    Новорічні відео та ідеї
                  </p>
                </div>
              </motion.a>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Лёгкие glow-слои */}
      <div className='absolute -top-32 -left-32 w-96 h-96 bg-red-500/20 rounded-full blur-3xl' />
      <div className='absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-green-500/20 rounded-full blur-3xl' />
    </section>
  )
}
