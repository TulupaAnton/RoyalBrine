import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo2.png'
import semiFinishedImage from '../../assets/semiFinished.png'
import culinariya from '../../assets/culinary.png'
import smoked from '../../assets/kopchena.png'
import pickles from '../../assets/pickles.png'
import salad from '../../assets/salad.jpg'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { motion } from 'framer-motion'

const categories = [
  {
    id: 'pickles',
    name: 'Соління',
    description: 'Традиційні домашні соління та маринади',
    image: pickles,
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
  },
  {
    id: 'salads',
    name: 'Салати',
    description: 'Смачні салати на будь-який смак',
    image: salad,
    catalogLink: '/catalog/salad',
    comingSoon: false
  }
]

export function Product () {
  return (
    <div
      id='categories'
      className='min-h-[35rem] bg-cover bg-center bg-no-repeat bg-fixed relative py-20 overflow-hidden'
      style={{ backgroundImage: `url(${logo})` }}
    >
      {/* Затемнение */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-black/40'></div>

      <div className='relative z-10 container mx-auto px-4'>
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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

        {/* Категории */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className='group'
            >
              <div className='bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col relative'>
                {/* Стрічка "Скоро" */}
                {category.comingSoon && (
                  <div className='absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-20'>
                    Скоро
                  </div>
                )}

                {/* Картинка */}

                <div className='relative overflow-hidden h-48'>
                  <motion.img
                    src={category.image}
                    alt={category.name}
                    loading='lazy'
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      category.comingSoon ? 'opacity-60 grayscale' : ''
                    }`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/25 to-transparent'></div>
                </div>

                <div className='p-6 flex flex-col flex-grow'>
                  <h3 className='text-xl font-bold text-gray-800 mb-3 text-center'>
                    {category.name}
                  </h3>

                  <p className='text-gray-600 mb-6 text-center flex-grow'>
                    {category.description}
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='mt-auto'
                  >
                    {category.comingSoon ? (
                      <span className='block w-full max-w-xs mx-auto text-center bg-gray-300 text-gray-600 py-3 px-6 rounded-full shadow-inner cursor-not-allowed'>
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
