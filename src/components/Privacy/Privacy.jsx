import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function Privacy () {
  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white py-12'>
      <div className='container mx-auto px-4 max-w-4xl'>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-3xl font-bold text-gray-800 mb-6'
        >
          Політика конфіденційності
        </motion.h1>

        <div className='w-20 h-1 bg-amber-500 rounded-full mb-8'></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='bg-white rounded-xl shadow-md p-6 space-y-4 text-gray-700'
        >
          <p>
            Ця політика пояснює, які дані ми збираємо, з якою метою, як їх
            зберігаємо та які у вас є права.
          </p>

          <h2 className='text-lg font-semibold text-gray-800'>
            1. Які дані ми збираємо
          </h2>
          <p>При оформленні замовлення або запиті ми можемо збирати:</p>
          <ul className='list-disc list-inside pl-4'>
            <li>Ім’я та прізвище</li>
            <li>Номер телефону</li>
            <li>Email</li>
            <li>Адресу доставки</li>
          </ul>

          <h2 className='text-lg font-semibold text-gray-800'>
            2. Як ми використовуємо ваші дані
          </h2>
          <p>Ваші дані потрібні для:</p>
          <ul className='list-disc list-inside pl-4'>
            <li>оформлення замовлення та доставки</li>
            <li>зв’язку з вами</li>
            <li>підтримки клієнтів</li>
            <li>(опціонально) інформування про новинки</li>
          </ul>

          <h2 className='text-lg font-semibold text-gray-800'>
            3. Хто має доступ до даних
          </h2>
          <p>
            Ми не передаємо ваші дані третім особам, за винятком служб доставки
            та платіжних систем — лише для виконання замовлення.
          </p>

          <h2 className='text-lg font-semibold text-gray-800'>
            4. Захист інформації
          </h2>
          <p>
            Ми застосовуємо технічні та організаційні заходи для захисту ваших
            даних від несанкціонованого доступу.
          </p>

          <h2 className='text-lg font-semibold text-gray-800'>5. Ваші права</h2>
          <p>Ви маєте право:</p>
          <ul className='list-disc list-inside pl-4'>
            <li>перевірити, які дані ми зберігаємо</li>
            <li>змінити або видалити ці дані</li>
            <li>відкликати згоду на обробку</li>
          </ul>

          <div className='pt-6 text-sm text-gray-600'>
            Перейдіть до наших{' '}
            <Link to='/terms' className='text-amber-600 hover:underline'>
              умов використання
            </Link>
            .
          </div>
        </motion.div>
      </div>
    </div>
  )
}
