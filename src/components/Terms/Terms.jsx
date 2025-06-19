import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function Terms () {
  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white py-12'>
      <div className='container mx-auto px-4 max-w-4xl'>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-3xl font-bold text-gray-800 mb-6'
        >
          Умови використання
        </motion.h1>

        <div className='w-20 h-1 bg-amber-500 rounded-full mb-8'></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='bg-white rounded-xl shadow-md p-6 space-y-4 text-gray-700'
        >
          <p>
            Користуючись цим сайтом, ви погоджуєтесь із наведеними нижче
            умовами. Якщо ви не згодні з ними — будь ласка, не використовуйте
            наш вебсайт.
          </p>

          <h2 className='text-lg font-semibold text-gray-800'>
            1. Достовірність інформації
          </h2>
          <p>
            Ви зобов’язуєтесь надавати точну та повну інформацію при оформленні
            замовлення.
          </p>

          <h2 className='text-lg font-semibold text-gray-800'>
            2. Авторські права
          </h2>
          <p>
            Весь контент (тексти, зображення, логотипи) є власністю сайту або
            його партнерів. Будь-яке копіювання заборонено без письмової згоди.
          </p>

          <h2 className='text-lg font-semibold text-gray-800'>
            3. Зміни в умовах
          </h2>
          <p>
            Ми маємо право змінювати ці умови в будь-який момент. Актуальна
            версія завжди доступна на цій сторінці.
          </p>

          <div className='pt-6 text-sm text-gray-600'>
            Перейдіть до нашої{' '}
            <Link to='/privacy' className='text-amber-600 hover:underline'>
              політики конфіденційності
            </Link>
            .
          </div>
        </motion.div>
      </div>
    </div>
  )
}
