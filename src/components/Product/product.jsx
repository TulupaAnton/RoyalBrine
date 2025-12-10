import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaGift } from 'react-icons/fa'

import logo from '../../assets/logo2.jpg'
import semiFinishedImage from '../../assets/напівфабрикати.jpg'
import culinariya from '../../assets/culinary.jpg'
import pickles from '../../assets/pickles.jpg'
import salad from '../../assets/salad.jpg'
import meats from '../../assets/мʼясніВироби.jpg'
import fish from '../../assets/FishSRC.jpg'

// iOS detect
const isIOS =
  typeof navigator !== 'undefined' &&
  /iPhone|iPad|iPod/i.test(navigator.userAgent)

// Categories
const categories = [
  {
    id: 'pickles',
    name: 'Соління',
    description: 'Традиційні домашні соління та маринади',
    image: pickles,
    catalogLink: '/catalog/pickles',
    icon: '🥒'
  },
  {
    id: 'meats',
    name: 'Мʼясні вироби',
    description: 'Домашні копчення та мʼясні делікатеси',
    image: meats,
    catalogLink: '/catalog/meats',
    icon: '🥩'
  },
  {
    id: 'fish',
    name: 'Рибні вироби',
    description: 'Рибні страви для святкового столу',
    image: fish,
    catalogLink: '/catalog/fish',
    icon: '🐟'
  },
  {
    id: 'cooking',
    name: 'Кулінарія',
    description: 'Домашні страви та гарніри',
    image: culinariya,
    catalogLink: '/catalog/cooking',
    icon: '🍲'
  },
  {
    id: 'semi-finished',
    name: 'Напівфабрикати',
    description: 'Пельмені, вареники та заготовки',
    image: semiFinishedImage,
    catalogLink: '/catalog/semi-finished',
    icon: '🥟'
  },
  {
    id: 'salads',
    name: 'Салати',
    description: 'Салати та закуски на будь-який смак',
    image: salad,
    catalogLink: '/catalog/salad',
    icon: '🥗'
  }
]

export function Product () {
  // ❄ Оптимизированные снежинки — CSS + лёгкая генерация
  const snowflakes = useMemo(
    () =>
      Array.from({ length: isIOS ? 6 : 10 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${8 + Math.random() * 10}px`,
        delay: `${Math.random() * 4}s`,
        duration: `${6 + Math.random() * 5}s`,
        drift: `${-20 + Math.random() * 40}px`
      })),
    []
  )

  return (
    <section
      id='categories'
      className='relative py-20 bg-cover bg-center overflow-hidden'
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(17,24,39,0.92), rgba(17,24,39,0.96)), url(${logo})`
      }}
    >
      {/* ❄ Снежинки */}
      <div className='absolute inset-0 pointer-events-none z-0'>
        {snowflakes.map(s => (
          <div
            key={s.id}
            className='snowflake'
            style={{
              left: s.left,
              fontSize: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
              '--drift': s.drift
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className='relative z-10 container mx-auto px-4'>
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-red-400 to-green-400 bg-clip-text text-transparent'>
            Категорії Royal Brine
          </h2>

          <p className='mt-4 text-amber-100 text-lg max-w-2xl mx-auto'>
            Обирайте найсмачніші домашні страви для святкового столу 🎄
          </p>

          <div className='mt-6 w-32 h-1 mx-auto bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full' />
        </motion.div>

        {/* Категории */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={!isIOS ? { y: -4 } : {}}
            >
              <div className='rounded-2xl overflow-hidden bg-white/95 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col'>
                {/* IMG */}
                <Link
                  to={cat.catalogLink}
                  className='block relative h-56 overflow-hidden'
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className='w-full h-full object-cover transition-transform duration-500 hover:scale-105'
                    loading='lazy'
                  />

                  <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />

                  <div className='absolute top-4 left-4 w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-white text-xl'>
                    {cat.icon}
                  </div>
                </Link>

                {/* TEXT */}
                <div className='p-6 flex flex-col flex-grow'>
                  <h3 className='text-2xl font-bold text-gray-800 mb-2'>
                    {cat.name}
                  </h3>

                  <p className='text-gray-600 mb-6 flex-grow'>
                    {cat.description}
                  </p>

                  <Link
                    to={cat.catalogLink}
                    className='mt-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 text-white py-3 px-6 rounded-full font-bold shadow-md hover:shadow-lg transition'
                  >
                    До каталогу →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
