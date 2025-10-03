import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo2.png'
import zaglushka from '../../assets/zaglushka.png'
import semiFinishedImage from '../../assets/semiFinished.png'
import culinariya from '../../assets/culinariya.png'
import smoked from '../../assets/kopchena.png'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { motion } from 'framer-motion'

const categories = [
  {
    id: 'pickles',
    name: 'Соління',
    description: 'Традиційні домашні соління та маринади',
    image: zaglushka,
    catalogLink: '/catalog/pickles',
    comingSoon: false
  },
  {
    id: 'smoked',
    name: 'Копченості',
    description: 'Мʼясні та рибні копченості гарячого та холодного копчення',
    image: smoked,
    catalogLink: '/catalog/smoked',
    comingSoon: false
  },
  {
    id: 'cooking',
    name: 'Кулінарія',
    description: 'Домашня кулінарія за домашніми рецептами',
    image: culinariya,
    catalogLink: '/catalog/cooking',
    comingSoon: false
  },
  {
    id: 'semi-finished',
    name: 'Напівфабрикати',
    description: 'Домашні пельмені, вареники та інші напівфабрикати',
    image: semiFinishedImage,
    catalogLink: '/catalog/semi-finished',
    comingSoon: false
  }
]

export function Product () {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      mirror: false
    })
  }, [])

  return (
    <div
      id='categories' // <-- Цей ID потрібен для скролу
      className='min-h-[35rem] bg-cover bg-center bg-no-repeat bg-fixed relative py-20 overflow-hidden'
      style={{ backgroundImage: `url(${logo})` }}
    >
      {/* Ефект паралаксу та накладання */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-black/30'></div>
      <div className='absolute inset-0 bg-noise opacity-10'></div>

      {/* Декоративні елементи */}
      <div className='absolute top-1/4 left-10 w-32 h-32 bg-amber-400 rounded-full mix-blend-overlay opacity-20 filter blur-xl'></div>
      <div className='absolute bottom-1/3 right-20 w-40 h-40 bg-amber-500 rounded-full mix-blend-overlay opacity-15 filter blur-xl'></div>

      <div className='relative z-10 container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-100 drop-shadow-lg'>
              Наші категорії
            </span>
          </h2>
          <div className='w-24 h-1 bg-amber-400 mx-auto rounded-full'></div>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className='group'
              data-aos='zoom-in'
              data-aos-delay={200 + i * 100}
            >
              <div className='bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col border border-white/20 relative'>
                {/* Стрічка "Скоро" */}
                {category.comingSoon && (
                  <div className='absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-20'>
                    Скоро
                  </div>
                )}

                <div className='relative overflow-hidden h-48'>
                  <motion.img
                    src={category.image}
                    alt={category.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      category.comingSoon ? 'opacity-60 grayscale' : ''
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                </div>

                <div className='p-6 flex flex-col flex-grow'>
                  <h3 className='text-xl font-bold text-gray-800 mb-3 text-center'>
                    {category.name}
                  </h3>
                  <p className='text-gray-600 mb-6 text-center flex-grow'>
                    {category.description}
                  </p>
                  <motion.div
                    whileHover={{ scale: category.comingSoon ? 1 : 1.05 }}
                    whileTap={{ scale: category.comingSoon ? 1 : 0.95 }}
                    className='mt-auto'
                  >
                    {category.comingSoon ? (
                      <span className='block w-full max-w-xs mx-auto text-center bg-gray-300 text-gray-600 py-3 px-6 rounded-full transition-all duration-300 shadow-inner cursor-not-allowed'>
                        У розробці
                      </span>
                    ) : (
                      <Link
                        to={category.catalogLink}
                        className='block w-full max-w-xs mx-auto text-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg'
                      >
                        До каталогу
                      </Link>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
