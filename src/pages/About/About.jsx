import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLeaf,
  faHeart,
  faAward,
  faUsers,
  faStore,
  faUtensils,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function About () {
  // Конфигурация анимаций
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  return (
    <div className='py-16 bg-[#FDFCFB] min-h-screen relative overflow-hidden'>
      {/* Декоративные элементы фона */}
      <div className='absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/20 rounded-full blur-[120px] -z-10' />
      <div className='absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-green-50/30 rounded-full blur-[120px] -z-10' />

      <div className='container mx-auto px-6'>
        {/* Hero Section */}
        <motion.div
          variants={container}
          initial='hidden'
          animate='visible'
          className='max-w-4xl mb-24'
        >
          <motion.p
            variants={item}
            className='text-orange-500 font-black uppercase tracking-[0.3em] text-xs mb-4'
          >
            Наша історія
          </motion.p>
          <motion.h1
            variants={item}
            className='text-5xl md:text-7xl font-black text-[#2D241E] tracking-tighter mb-8 leading-[0.9]'
          >
            Від сімейної традиції <br />
            <span className='text-orange-500'>до вашого столу</span>
          </motion.h1>
          <motion.p
            variants={item}
            className='text-xl text-gray-500 font-medium leading-relaxed max-w-2xl'
          >
            Ми не просто продаємо продукти — ми ділимося теплом домашнього
            затишку та якістю, яку обираємо для власних дітей.
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className='grid lg:grid-cols-2 gap-16 items-center mb-32'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className='relative'
          >
            <div className='absolute -inset-4 bg-orange-100/50 rounded-[3rem] -rotate-2 -z-10' />
            <img
              src='https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
              alt='Сімейна справа'
              className='rounded-[2.5rem] shadow-2xl w-full object-cover h-[500px]'
            />
            <div className='absolute bottom-8 right-8 bg-white p-6 rounded-3xl shadow-xl max-w-[200px] hidden md:block'>
              <p className='text-[#2D241E] font-black text-sm uppercase tracking-widest leading-tight'>
                10+ років досвіду
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            className='space-y-8'
          >
            <motion.h2
              variants={item}
              className='text-4xl font-black text-[#2D241E] tracking-tight'
            >
              Смак, який неможливо{' '}
              <span className='text-orange-500'>забути</span>
            </motion.h2>
            <motion.p
              variants={item}
              className='text-gray-500 text-lg leading-relaxed font-medium'
            >
              Royal Briner почався з невеликого виробництва, де головним
              правилом було: «Роби як для себе». Ми ретельно відбираємо кожного
              постачальника та контролюємо кожен етап приготування.
            </motion.p>

            <motion.div
              variants={item}
              className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4'
            >
              {[
                'Натуральні інгредієнти',
                'Сімейні традиції',
                'Без ГМО та консервантів',
                'Власна рецептура'
              ].map((tag, i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 bg-white p-4 rounded-2xl border border-orange-50 shadow-sm'
                >
                  <div className='w-2 h-2 rounded-full bg-orange-500' />
                  <span className='font-black text-[10px] uppercase tracking-widest text-[#2D241E]'>
                    {tag}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Values Section */}
        <div className='mb-32'>
          <div className='text-center mb-16'>
            <p className='text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2'>
              Чому ми?
            </p>
            <h2 className='text-4xl font-black text-[#2D241E]'>
              Наші фундаментальні цінності
            </h2>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {[
              {
                icon: faLeaf,
                color: 'bg-green-500',
                title: 'Натуральність',
                description:
                  'Використовуємо тільки екологічно чисті інгредієнти без зайвих добавок.'
              },
              {
                icon: faHeart,
                color: 'bg-orange-500',
                title: 'Любов',
                description:
                  'Кожна банка та кожен пакунок зібрані з щирою турботою про вас.'
              },
              {
                icon: faAward,
                color: 'bg-[#2D241E]',
                title: 'Якість',
                description:
                  'Зберігаємо автентичність смаків завдяки традиційним методам.'
              },
              {
                icon: faUsers,
                color: 'bg-blue-500',
                title: 'Довіра',
                description:
                  'Тисячі задоволених клієнтів по всій Україні — наше головне досягнення.'
              }
            ].map((val, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500 group'
              >
                <div
                  className={`w-14 h-14 ${val.color} rounded-2xl flex items-center justify-center mb-8 text-white text-xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}
                >
                  <FontAwesomeIcon icon={val.icon} />
                </div>
                <h3 className='text-xl font-black text-[#2D241E] mb-4'>
                  {val.title}
                </h3>
                <p className='text-gray-400 text-sm font-bold leading-relaxed'>
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='bg-[#2D241E] rounded-[3.5rem] p-10 md:p-20 text-center text-white relative overflow-hidden mb-12'
        >
          <div className='absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl' />
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl' />

          <div className='relative z-10 max-w-2xl mx-auto'>
            <div className='w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl shadow-xl rotate-12'>
              <FontAwesomeIcon icon={faUtensils} />
            </div>
            <h2 className='text-4xl md:text-5xl font-black mb-6 tracking-tighter'>
              Відчуйте справжній <br /> домашній смак
            </h2>
            <p className='text-gray-400 text-lg font-medium mb-12'>
              Замовляйте наші продукти вже сьогодні та переконайтеся в якості,
              створеній з любов'ю.
            </p>
            <Link
              to='/'
              className='inline-flex items-center gap-4 px-12 py-5 bg-white text-[#2D241E] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all shadow-2xl'
            >
              <span>До каталогу</span>
              <FontAwesomeIcon icon={faArrowRight} className='text-[10px]' />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
