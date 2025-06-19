import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function Refund () {
  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white py-12'>
      <div className='container mx-auto px-4 max-w-4xl'>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-3xl font-bold text-gray-800 mb-6'
        >
          Правила та умови повернення коштів
        </motion.h1>

        <div className='w-20 h-1 bg-amber-500 rounded-full mb-8'></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='bg-white rounded-xl shadow-md p-6 space-y-4 text-gray-700'
        >
          <p>
            Ми поважаємо права споживачів та дотримуємось законодавства України,
            зокрема Закону України "Про захист прав споживачів" та Постанови
            Кабінету Міністрів №172.
          </p>

          <h2 className='text-lg font-semibold text-gray-800'>
            1. Товари, що не підлягають поверненню
          </h2>
          <p>
            Згідно з Постановою КМУ №172 від 19.03.1994,{' '}
            <strong>
              продовольчі товари належної якості не підлягають поверненню або
              обміну
            </strong>
            . Це включає:
          </p>
          <ul className='list-disc list-inside pl-4'>
            <li>Упаковані продукти харчування</li>
            <li>Світлочутливі або швидкопсувні товари</li>
            <li>Товари з порушенням цілісності упаковки</li>
          </ul>

          <h2 className='text-lg font-semibold text-gray-800'>
            2. Повернення товару неналежної якості
          </h2>
          <ul className='list-disc list-inside pl-4'>
            <li>
              У разі виявлення браку або простроченого терміну придатності ви
              маєте право на обмін або повернення коштів.
            </li>
            <li>
              Необхідно звернутися до нас протягом <strong>24 годин</strong> з
              моменту отримання замовлення.
            </li>
            <li>
              Для підтвердження необхідно надати фото- або відеодокази
              (упаковка, чек, дефект тощо).
            </li>
          </ul>

          <h2 className='text-lg font-semibold text-gray-800'>
            3. Порядок повернення коштів
          </h2>
          <ul className='list-disc list-inside pl-4'>
            <li>
              Після підтвердження дефекту кошти повертаються протягом{' '}
              <strong>7 робочих днів</strong>.
            </li>
            <li>
              Повернення здійснюється тим самим способом, яким було здійснено
              оплату.
            </li>
          </ul>

          <h2 className='text-lg font-semibold text-gray-800'>
            4. Контактна інформація
          </h2>
          <p>
            Для оформлення повернення напишіть нам на електронну пошту або
            вкажіть номер замовлення та суть проблеми у формі зворотного
            зв’язку.
          </p>

          <div className='pt-6 text-sm text-gray-600'>
            Дивіться також наші{' '}
            <Link to='/terms' className='text-amber-600 hover:underline'>
              умови використання
            </Link>{' '}
            та{' '}
            <Link to='/privacy' className='text-amber-600 hover:underline'>
              політику конфіденційності
            </Link>
            .
          </div>
        </motion.div>
      </div>
    </div>
  )
}
