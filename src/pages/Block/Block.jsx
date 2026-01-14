import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faUtensils,
  faHeart
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons'

export function Block () {
  const hour = new Date().getHours()

  const ctaText =
    hour < 11
      ? 'Смачний сніданок'
      : hour < 17
      ? 'Домашній обід'
      : 'Затишна вечеря'

  const scrollToCategories = () => {
    const el = document.getElementById('categories')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className='relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#FDFCFB]'>
      {/* Мягкие статические фоновые акценты для объема */}
      <div className='absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-100/40 rounded-full blur-[120px]' />
      <div className='absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-green-50/60 rounded-full blur-[120px]' />

      {/* Контент */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className='relative z-10 max-w-4xl text-center px-6'
      >
        {/* Бейдж сверху */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className='inline-flex items-center gap-2 bg-white border border-orange-100 px-4 py-1.5 rounded-full shadow-sm mb-8'
        >
          <FontAwesomeIcon icon={faHeart} className='text-orange-400 text-xs' />
          <span className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-500'>
            Зроблено з любов'ю
          </span>
        </motion.div>

        {/* Заголовок */}
        <h1 className='text-6xl md:text-8xl font-black mb-6 text-[#2D241E] tracking-tight'>
          Royal <span className='text-orange-500'>Brine</span>
        </h1>

        <p className='text-lg md:text-2xl text-gray-600 font-medium mb-12 max-w-xl mx-auto leading-relaxed'>
          Справжня домашня кулінарія, що зігріває серце та дарує затишок 🧺
        </p>

        {/* Кнопка */}
        <div className='flex flex-col items-center'>
          <motion.button
            whileHover={{
              scale: 1.03,
              boxShadow: '0 20px 40px -15px rgba(45, 36, 30, 0.2)'
            }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToCategories}
            className='inline-flex items-center gap-4 bg-[#2D241E] text-white px-12 py-6 rounded-2xl shadow-xl text-lg font-bold transition-all'
          >
            <FontAwesomeIcon icon={faUtensils} className='text-orange-400' />
            {ctaText}
            <FontAwesomeIcon
              icon={faArrowRight}
              className='text-sm opacity-50'
            />
          </motion.button>
        </div>

        {/* Разделитель и Соцсети */}
        <div className='mt-20 flex flex-col items-center'>
          <div className='w-16 h-[1px] bg-orange-100 mb-10' />

          <div className='flex flex-wrap justify-center gap-10 md:gap-16'>
            {/* Instagram */}
            <motion.a
              href='https://www.instagram.com/royal_brine/'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-4 group'
              whileHover={{ y: -3 }}
            >
              <div className='w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-orange-200 group-hover:shadow-md transition-all duration-300'>
                <FontAwesomeIcon
                  icon={faInstagram}
                  className='text-2xl text-[#2D241E]'
                />
              </div>
              <div className='text-left'>
                <span className='block font-bold text-[#2D241E] text-base'>
                  Instagram
                </span>
                <span className='text-xs text-gray-400 font-medium'>
                  Життя нашої кухні
                </span>
              </div>
            </motion.a>

            {/* TikTok */}
            <motion.a
              href='https://www.tiktok.com/@royal.brine'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-4 group'
              whileHover={{ y: -3 }}
            >
              <div className='w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-orange-200 group-hover:shadow-md transition-all duration-300'>
                <FontAwesomeIcon
                  icon={faTiktok}
                  className='text-2xl text-[#2D241E]'
                />
              </div>
              <div className='text-left'>
                <span className='block font-bold text-[#2D241E] text-base'>
                  TikTok
                </span>
                <span className='text-xs text-gray-400 font-medium'>
                  Наші смачні відео
                </span>
              </div>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
