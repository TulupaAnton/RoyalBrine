import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown,
  faStar,
  faCheckCircle,
  faLeaf,
  faGlassCheers
} from '@fortawesome/free-solid-svg-icons'

// Імпорт зображень
import picklesImg from '../../assets/pickles.jpg'
import meatsImg from '../../assets/мʼясніВироби.jpg'

const REVIEWS = [
  {
    id: 1,
    text: "Неймовірні копчення! М'ясо тане у роті, а запах вільхової тріски просто зводить з розуму.",
    author: 'Тетяна'
  },
  {
    id: 2,
    text: 'Найкращі соління, що я куштував. Огірочки хрумтять прямо як у бабусі в селі!',
    author: 'Олександр'
  },
  {
    id: 3,
    text: "Замовляли на свято м'ясну нарізку — гості були в захваті. Все свіже та натуральне.",
    author: 'Марія'
  }
]

export function Block () {
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % REVIEWS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [isHovered])

  const scrollToCategories = () => {
    const el = document.getElementById('categories')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className='relative min-h-screen bg-[#FDFCFB] flex items-center overflow-hidden pt-24 lg:pt-0'>
      <div className='absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-green-100/20 rounded-full blur-3xl pointer-events-none' />

      <div className='container mx-auto px-6 relative z-10'>
        <div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-16'>
          {/* ЛІВА ЧАСТИНА */}
          <div className='w-full lg:w-5/12'>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className='text-6xl lg:text-8xl font-black text-[#2D241E] leading-[0.9] mb-6 tracking-tighter'>
                Royal <br />
                <span className='text-orange-600 italic font-serif font-light'>
                  Brine
                </span>
              </h1>

              <p className='text-lg text-gray-600 mb-10 leading-relaxed max-w-md font-medium'>
                Найкраще з української кухні: від пікантних солінь до м'ясних і
                рибних шедеврів власного копчення.
              </p>

              {/* Відгуки */}
              <div
                className='bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-50 mb-10 relative overflow-hidden'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className='min-h-[110px] relative'>
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className='absolute inset-0'
                    >
                      <div className='flex text-orange-400 gap-1 mb-4'>
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            className='text-[10px]'
                          />
                        ))}
                      </div>
                      <p className='text-[#2D241E] italic text-lg leading-snug mb-4'>
                        "{REVIEWS[index].text}"
                      </p>
                      <span className='text-xs font-bold uppercase tracking-widest text-orange-900/40'>
                        {REVIEWS[index].author}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className='flex gap-1.5 mt-8'>
                  {REVIEWS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === index ? 'w-6 bg-orange-500' : 'w-2 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <motion.button
                onClick={scrollToCategories}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='w-full bg-[#2D241E] text-white py-6 px-10 rounded-3xl flex items-center justify-between group transition-all hover:bg-orange-600 shadow-2xl'
              >
                <div className='flex flex-col text-left'>
                  <span className='text-[10px] uppercase tracking-[0.4em] opacity-50 mb-1'>
                    Explore Menu
                  </span>
                  <span className='text-xl font-bold uppercase'>
                    Відкрити каталог
                  </span>
                </div>
                <div className='w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-orange-600 transition-all'>
                  <FontAwesomeIcon
                    icon={faArrowDown}
                    className='animate-bounce'
                  />
                </div>
              </motion.button>
            </motion.div>
          </div>

          {/* ПРАВА ЧАСТИНА: Фото та НОВА ПЛАШКА */}
          <div className='w-full lg:w-7/12 relative flex flex-col sm:flex-row gap-6 lg:h-[600px] items-center'>
            {/* НОВА ПЛАШКА "ФУРШЕТИ" */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20, rotate: 5 }}
              animate={{
                opacity: 1,
                y: [0, -10, 0], // Ефект плавання
                rotate: 5
              }}
              transition={{
                opacity: { delay: 1, duration: 0.5 },
                y: { repeat: Infinity, duration: 4, ease: 'easeInOut' } // Постійне плавання
              }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
              className='absolute -top-10 right-0 sm:right-10 z-40'
            >
              {/* <Link to='/catalog/buffet' className='block'>
                <div className='bg-white/90 backdrop-blur-md shadow-[0_15px_40px_rgba(234,88,12,0.15)] border border-orange-100 p-4 pr-8 rounded-2xl flex items-center gap-4 group'>
                  <div className='w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg'>
                    🥂
                  </div>
                  <div>
                    <div className='flex items-center gap-2 mb-0.5'>
                      <span className='bg-orange-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded'>
                        New
                      </span>
                    </div>
                    <p className='text-[#2D241E] font-black text-base uppercase tracking-tight group-hover:text-orange-600 transition-colors'>
                      Фуршетні бокси
                    </p>
                  </div>
                </div>
              </Link> */}
            </motion.div>

            {/* Картка Соління */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className='relative w-full sm:w-1/2 h-[400px] lg:h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl self-start lg:mt-12 group'
            >
              <Link to='/catalog/pickles' className='block w-full h-full'>
                <img
                  src={picklesImg}
                  alt='Соління'
                  className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-[#2D241E]/90 via-transparent to-transparent flex flex-col justify-end p-10'>
                  <h3 className='text-white text-3xl font-black uppercase mb-2'>
                    Соління
                  </h3>
                  <div className='flex items-center gap-2 text-orange-400'>
                    <FontAwesomeIcon icon={faCheckCircle} className='text-xs' />
                    <span className='text-[10px] font-bold uppercase tracking-[0.2em]'>
                      Organic Only
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Картка Копчення */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className='relative w-full sm:w-1/2 h-[400px] lg:h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl sm:-mt-20 lg:-mt-0 group'
            >
              <Link to='/catalog/meats' className='block w-full h-full'>
                <img
                  src={meatsImg}
                  alt='Копчення'
                  className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-[#2D241E]/90 via-transparent to-transparent flex flex-col justify-end p-10'>
                  <h3 className='text-white text-3xl font-black uppercase mb-2'>
                    Копчення
                  </h3>
                  <div className='flex items-center gap-2 text-orange-400'>
                    <FontAwesomeIcon icon={faCheckCircle} className='text-xs' />
                    <span className='text-[10px] font-bold uppercase tracking-[0.2em]'>
                      Natural Wood
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Круглий бейдж */}
            <div className='absolute hidden lg:flex top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500 rounded-full border-8 border-[#FDFCFB] items-center justify-center z-20 shadow-xl pointer-events-none select-none'>
              <span className='text-white font-black text-center leading-tight text-[10px] uppercase tracking-tighter'>
                Справжній
                <br />
                смак
                <br />
                100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
