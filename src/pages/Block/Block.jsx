import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'

// Детекция iOS
const isIOS =
  typeof navigator !== 'undefined' &&
  /iPhone|iPad|iPod/i.test(navigator.userAgent)

export function Block () {
  // Контейнер
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  // Элементы
  const item = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  // Оптимизированные blobs (без spring)
  const blob = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  // Смарт-CTA
  const hour = new Date().getHours()
  let ctaText = 'До каталогу'
  if (hour < 10) ctaText = 'Смакуйте зранку'
  else if (hour < 16) ctaText = 'Обідній вибір'
  else ctaText = 'Ситна вечеря'

  const scrollToCategories = () => {
    const el = document.getElementById('categories')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className='relative w-full px-4 py-24 md:p-32 text-center min-h-[80vh] overflow-hidden flex items-center justify-center font-serif'>
      {/* Видео фон — облегчённая версия для iPhone */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className={
          'absolute inset-0 w-full h-full object-cover z-0 ' +
          (isIOS ? 'opacity-10' : 'opacity-20 blur-[2px]')
        }
      >
        <source src='./src/assets/footage.mp4' type='video/mp4' />
        Ваш браузер не підтримує відео.
      </video>

      {/* Блики/шары — blur выключен для iOS */}
      <div className='absolute inset-0 overflow-hidden z-0'>
        <motion.div
          variants={blob}
          initial='hidden'
          animate='visible'
          style={{
            willChange: 'transform, opacity',
            WebkitTransform: 'translateZ(0)',
            filter: isIOS ? 'none' : 'blur(40px)'
          }}
          className='absolute top-[-40px] left-[-40px] w-48 h-48 rounded-full bg-amber-400 opacity-30'
        />

        <motion.div
          variants={blob}
          initial='hidden'
          animate='visible'
          style={{
            willChange: 'transform, opacity',
            WebkitTransform: 'translateZ(0)',
            filter: isIOS ? 'none' : 'blur(40px)'
          }}
          className='absolute top-1/3 right-0 w-60 h-60 rounded-full bg-orange-400 opacity-25'
        />

        <motion.div
          variants={blob}
          initial='hidden'
          animate='visible'
          style={{
            willChange: 'transform, opacity',
            WebkitTransform: 'translateZ(0)',
            filter: isIOS ? 'none' : 'blur(40px)'
          }}
          className='absolute bottom-[-40px] left-1/4 w-64 h-64 rounded-full bg-amber-600 opacity-20'
        />
      </div>

      {/* Контент */}
      <motion.div
        variants={container}
        initial='hidden'
        animate='visible'
        className='relative z-10 max-w-4xl'
      >
        <motion.p
          variants={item}
          style={{
            willChange: 'transform, opacity',
            WebkitTransform: 'translateZ(0)'
          }}
          className='text-sm md:text-lg italic text-amber-700 mb-3'
        >
          Свіжі домашні страви з доставкою по Запоріжжю.
        </motion.p>

        <motion.h1
          variants={item}
          animate={isIOS ? {} : { opacity: [1, 0.7, 1] }}
          transition={
            isIOS ? {} : { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          }
          style={{
            willChange: 'transform, opacity',
            WebkitTransform: 'translateZ(0)'
          }}
          className='text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent 
                     bg-gradient-to-r from-amber-800 via-orange-700 to-yellow-600 drop-shadow-md'
        >
          Royal Brine
        </motion.h1>

        <motion.p
          variants={item}
          style={{
            willChange: 'transform, opacity',
            WebkitTransform: 'translateZ(0)'
          }}
          className='text-xl md:text-2xl text-amber-900 opacity-90 mb-10 leading-relaxed'
        >
          Смачно. Швидко. По-домашньому.
        </motion.p>

        <motion.div variants={item}>
          <button
            onClick={scrollToCategories}
            style={{
              WebkitTransform: 'translateZ(0)',
              willChange: 'transform'
            }}
            className='inline-flex items-center justify-center bg-amber-800 text-white px-8 py-4 rounded-full 
                       mt-4 hover:bg-orange-700 transition-all duration-300 hover:scale-105 shadow-lg 
                       hover:shadow-amber-600/40 group'
          >
            <span className='text-lg font-medium'>{ctaText}</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className='ml-3 text-base transition-transform group-hover:translate-x-1'
            />
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
