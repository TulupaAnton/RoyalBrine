import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLeaf,
  faHeart,
  faAward,
  faUsers,
  faStore
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'

export function About () {
  // Анимации
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  return (
    <div className='py-16 bg-gradient-to-b from-amber-50 to-white min-h-screen'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Hero Section */}
        <motion.div
          variants={container}
          initial='hidden'
          animate='visible'
          className='text-center mb-16'
        >
          <motion.h1
            variants={item}
            className='text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent'
          >
            Наша історія
          </motion.h1>
          <motion.p
            variants={item}
            className='text-xl text-gray-600 max-w-3xl mx-auto'
          >
            Від сімейної традиції до вашого столу - ми створюємо якісні продукти
            з любов'ю та турботою.
          </motion.p>
        </motion.div>

        {/* About Content */}
        <div className='grid md:grid-cols-2 gap-12 items-center mb-20'>
          <motion.div
            variants={container}
            initial='hidden'
            animate='visible'
            className='space-y-6'
          >
            <motion.h2
              variants={item}
              className='text-3xl font-bold text-gray-800'
            >
              Смак, який варто спробувати
            </motion.h2>
            <motion.p variants={item} className='text-gray-600'>
              Наш магазин - це сімейна справа, яка почалася з невеликої ферми у
              серці України.
            </motion.p>
            <motion.p variants={item} className='text-gray-600'>
              Кожен наш продукт - це результат багаторічного досвіду та
              ретельного відбору.
            </motion.p>
            <motion.div variants={item} className='flex flex-wrap gap-4 pt-4'>
              <span className='px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium'>
                Натуральні інгредієнти
              </span>
              <span className='px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium'>
                Сімейні традиції
              </span>
              <span className='px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium'>
                Якість перевірена часом
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className='rounded-2xl overflow-hidden shadow-xl'
          >
            <img
              src='https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
              alt='Family farm'
              className='w-full h-auto object-cover transition-transform duration-500 hover:scale-105'
            />
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='py-12'
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-3xl font-bold text-center text-gray-800 mb-12'
          >
            Наші цінності
          </motion.h2>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {[
              {
                icon: faLeaf,
                title: 'Натуральність',
                description:
                  'Використовуємо тільки екологічно чисті інгредієнти'
              },
              {
                icon: faHeart,
                title: 'Любов до справи',
                description: 'Готуємо з дусі, як для себе'
              },
              {
                icon: faAward,
                title: 'Традиційні рецепти',
                description: 'Зберігаємо автентичність смаків'
              },
              {
                icon: faUsers,
                title: 'Клієнтоорієнтованість',
                description: 'Ваше задоволення - наш пріоритет'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className='bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center'
              >
                <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600 text-2xl'>
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                  {item.title}
                </h3>
                <p className='text-gray-600'>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 md:p-12 text-center text-white my-12'
        >
          <div className='max-w-3xl mx-auto'>
            <FontAwesomeIcon icon={faStore} className='text-3xl mb-6' />
            <h2 className='text-3xl font-bold mb-4'>
              Відчуйте справжній смак разом з нами
            </h2>
            <p className='text-xl mb-6 opacity-90'>
              Замовляйте наші продукти вже сьогодні та насолоджуйтесь якістю,
              створеною з любов'ю.
            </p>
            <a
              href='/'
              className='inline-block px-8 py-3 bg-white text-amber-600 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-300 shadow-lg'
            >
              До каталогу
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
