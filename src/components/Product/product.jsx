import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCrown,
  faArrowRight,
  faLeaf,
  faLock // Додав іконку замка
} from '@fortawesome/free-solid-svg-icons'

// Імпорт зображень (залишається без змін)
import semiFinishedImage from '../../assets/напівфабрикати.jpg'
import culinariya from '../../assets/culinary.jpg'
import pickles from '../../assets/pickles.jpg'
import salad from '../../assets/salad.jpg'
import meats from '../../assets/мʼясніВироби.jpg'
import fish from '../../assets/FishSRC.jpg'
import buffet from '../../assets/buffet.jpg'

const categories = [
  {
    id: 'pickles',
    name: 'Соління',
    description: 'Традиційні домашні соління та маринади за старими рецептами',
    image: pickles,
    catalogLink: '/catalog/pickles',
    icon: '🥒',
    isHit: true,
    isAvailable: true // ДОСТУПНО
  },
  {
    id: 'meats',
    name: 'Мʼясні вироби',
    description: 'Натуральне копчення на вільховій трісці',
    image: meats,
    catalogLink: '/catalog/meats',
    icon: '🥩',
    isHit: false,
    isAvailable: true
  },
  {
    id: 'fish',
    name: 'Рибні делікатеси',
    description: 'Свіжа та копчена риба до вашого столу',
    image: fish,
    catalogLink: '/catalog/fish',
    icon: '🐟',
    isHit: false,
    isAvailable: true
  },
  {
    id: 'cooking',
    name: 'Кулінарія',
    description: 'Готові домашні страви ',
    image: culinariya,
    catalogLink: '/catalog/cooking',
    icon: '🍲',
    isHit: false,
    isAvailable: true
  },
  {
    id: 'semi-finished',
    name: 'Напівфабрикати',
    description: 'Ручна ліпка: пельмені, вареники та голубці',
    image: semiFinishedImage,
    catalogLink: '/catalog/semi-finished',
    icon: '🥟',
    isHit: false,
    isAvailable: true
  },
  {
    id: 'salads',
    name: 'Салати',
    description: 'Свіжі та поживні салати на кожен день',
    image: salad,
    catalogLink: '/catalog/salad',
    icon: '🥗',
    isHit: false,
    isAvailable: true
  },
  {
    id: 'buffet',
    name: 'Фуршет',
    description: 'Канапе, закуски та міні-страви для свят і подій',
    image: buffet,
    catalogLink: '/catalog/buffet',
    icon: '🍢',
    isHit: false,
    isAvailable: false // ТИМЧАСОВО НЕДОСТУПНО (наприклад)
  }
]

export function Product () {
  return (
    <section
      id='categories'
      className='relative py-24 bg-[#FDFCFB] overflow-hidden'
    >
      <div className='absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-32 -mt-32' />
      <div className='absolute bottom-0 left-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -ml-32 -mb-32' />

      <div className='relative z-10 container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-20'
        >
          <div className='flex items-center justify-center gap-2 mb-4 text-orange-500'>
            <FontAwesomeIcon icon={faLeaf} className='text-sm' />
            <span className='text-[10px] font-black uppercase tracking-[0.3em] text-gray-400'>
              Наше Меню
            </span>
            <FontAwesomeIcon icon={faLeaf} className='text-sm' />
          </div>
          <h2 className='text-4xl md:text-6xl font-black text-[#2D241E] mb-6 tracking-tight'>
            Домашня <span className='text-orange-500'>Комора</span>
          </h2>
          <p className='text-gray-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed'>
            Тільки натуральні інгредієнти та перевірені часом рецепти.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10'>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className={`relative rounded-[2.5rem] overflow-hidden bg-white shadow-sm transition-all duration-500 flex flex-col h-full border-2 
                ${!cat.isAvailable ? 'grayscale opacity-70' : ''} 
                ${
                  cat.isHit && cat.isAvailable
                    ? 'border-orange-400/30 ring-8 ring-orange-50'
                    : 'border-transparent hover:border-orange-100'
                }`}
              >
                {/* Бейдж ХИТ */}
                {cat.isHit && cat.isAvailable && (
                  <div className='absolute top-6 right-6 z-20 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2'>
                    <FontAwesomeIcon icon={faCrown} className='text-[10px]' />
                    <span className='text-[10px] font-black uppercase tracking-wider'>
                      Хіт сезону
                    </span>
                  </div>
                )}

                {/* Бейдж "НЕЗАБАРОМ" якщо недоступно */}
                {!cat.isAvailable && (
                  <div className='absolute inset-0 z-30 bg-[#2D241E]/40 backdrop-blur-[2px] flex items-center justify-center'>
                    <div className='bg-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3'>
                      <FontAwesomeIcon
                        icon={faLock}
                        className='text-orange-500 text-xs'
                      />
                      <span className='text-[10px] font-black uppercase tracking-widest text-[#2D241E]'>
                        Скоро у продажу
                      </span>
                    </div>
                  </div>
                )}

                {/* Зображення */}
                <div className='block relative h-64 overflow-hidden group'>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      cat.isAvailable ? 'group-hover:scale-110' : ''
                    }`}
                    loading='lazy'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-[#2D241E]/40 to-transparent opacity-60' />
                  <div className='absolute bottom-6 left-6 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-2xl'>
                    {cat.icon}
                  </div>
                </div>

                <div className='p-8 flex flex-col flex-grow'>
                  <h3
                    className={`text-2xl font-black mb-3 ${
                      cat.isHit && cat.isAvailable
                        ? 'text-orange-600'
                        : 'text-[#2D241E]'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p className='text-gray-500 text-sm leading-relaxed mb-8 flex-grow font-medium'>
                    {cat.description}
                  </p>

                  {/* Кнопка або Заглушка */}
                  {cat.isAvailable ? (
                    <Link
                      to={cat.catalogLink}
                      className={`mt-auto inline-flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all active:scale-95
                        ${
                          cat.isHit
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                            : 'bg-[#2D241E] text-white hover:bg-orange-600 shadow-md'
                        }`}
                    >
                      Переглянути
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className='text-[10px] opacity-60'
                      />
                    </Link>
                  ) : (
                    <div className='mt-auto py-4 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] bg-gray-100 text-gray-400 text-center'>
                      Очікується
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
