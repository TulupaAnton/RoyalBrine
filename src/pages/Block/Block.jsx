import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'

export function Block () {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 14
      }
    }
  }

  const blob = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 60,
        damping: 12
      }
    }
  }

  return (
    <div className='relative w-full px-4 py-24 md:p-32 text-center min-h-[80vh] bg-gradient-to-br from-yellow-100 via-amber-200 to-orange-100 overflow-hidden flex items-center justify-center font-serif'>
      {/* Анімовані фоновані елементи */}
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div
          variants={blob}
          initial='hidden'
          animate='visible'
          transition={{ delay: 0.2 }}
          className='absolute top-[-40px] left-[-40px] w-48 h-48 rounded-full bg-amber-400 opacity-30 blur-2xl animate-pulse'
        ></motion.div>
        <motion.div
          variants={blob}
          initial='hidden'
          animate='visible'
          transition={{ delay: 0.4 }}
          className='absolute top-1/3 right-0 w-60 h-60 rounded-full bg-orange-400 opacity-25 blur-2xl animate-pulse'
        ></motion.div>
        <motion.div
          variants={blob}
          initial='hidden'
          animate='visible'
          transition={{ delay: 0.6 }}
          className='absolute bottom-[-40px] left-1/4 w-64 h-64 rounded-full bg-amber-600 opacity-20 blur-2xl animate-pulse'
        ></motion.div>
      </div>

      <motion.div
        variants={container}
        initial='hidden'
        animate='visible'
        className='relative z-10 max-w-4xl'
      >
        <motion.h1
          variants={item}
          className='text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-800 via-orange-700 to-yellow-600 drop-shadow-md'
        >
          Royal Brine
        </motion.h1>

        <motion.p
          variants={item}
          className='text-xl md:text-2xl text-amber-900 opacity-90 mb-10 leading-relaxed'
        >
          Відкрийте для себе вишукані смаки наших напівфабрикатів преміум-класу.
          Ідеально збалансовані інгредієнти та ретельний підхід до виробництва
          роблять кожен наш продукт маленьким кулінарним шедевром.
        </motion.p>

        <motion.div variants={item}>
          <Link
            to='/catalog/semi-finished'
            className='inline-flex items-center justify-center bg-amber-800 text-white px-8 py-4 rounded-full mt-4 hover:bg-orange-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-600/40 group'
          >
            <span className='text-lg font-medium'>До каталогу</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className='ml-3 text-base transition-transform group-hover:translate-x-1'
            />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
