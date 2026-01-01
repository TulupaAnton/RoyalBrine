import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faClock,
  faPhone,
  faPaperPlane,
  faGift,
  faStar,
  faSnowflake,
  faTree
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import AOS from 'aos'
import 'aos/dist/aos.css'
import emailjs from 'emailjs-com'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ContactSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    })
  }, [])

  const sendEmail = e => {
    e.preventDefault()

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        e.target,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        toast.success(
          '🎅 Повідомлення успішно надіслано! Дякуємо за ваше звернення!',
          {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
            style: {
              background: 'linear-gradient(135deg, #16a34a 0%, #dc2626 100%)',
              color: 'white'
            }
          }
        )
        e.target.reset()
      })
      .catch(() => {
        toast.error('❌ Помилка при надсиланні. Спробуйте ще раз.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
          style: {
            background: '#dc2626',
            color: 'white'
          }
        })
      })
  }

  // Создаем снежинки для анимации
  const snowflakes = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 8 + 3,
    delay: Math.random() * 5
  }))

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-red-50 to-amber-50 py-16 px-4 relative overflow-hidden'>
      {/* Анимированные снежинки */}
      <div className='absolute inset-0 pointer-events-none z-0'>
        {snowflakes.map(flake => (
          <motion.div
            key={flake.id}
            className='absolute text-blue-300/30'
            style={{
              left: flake.left,
              fontSize: `${flake.size}px`
            }}
            initial={{ y: -50 }}
            animate={{ y: '100vh' }}
            transition={{
              duration: 3 + Math.random() * 5,
              delay: flake.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <FontAwesomeIcon icon={faSnowflake} />
          </motion.div>
        ))}
      </div>

      {/* Новогодние шары-декорации */}
      <div className='absolute top-20 left-10 w-32 h-32'>
        <motion.div
          className='w-full h-full rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-20 blur-2xl'
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        ></motion.div>
      </div>

      <div className='absolute bottom-40 right-20 w-24 h-24'>
        <motion.div
          className='w-full h-full rounded-full bg-gradient-to-br from-green-500 to-emerald-500 opacity-20 blur-2xl'
          animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        ></motion.div>
      </div>

      <div className='absolute top-1/3 right-1/4 w-20 h-20'>
        <motion.div
          className='w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 opacity-15 blur-xl'
          animate={{ scale: [1, 1.2, 1], rotate: [0, -180, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        ></motion.div>
      </div>

      <div className='max-w-6xl mx-auto relative z-10'>
        {/* Новогодний заголовок */}
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className='inline-flex items-center justify-center mb-4'>
            <FontAwesomeIcon
              icon={faTree}
              className='text-green-500 text-2xl mr-4'
            />
            <FontAwesomeIcon icon={faGift} className='text-red-500 text-2xl' />
            <FontAwesomeIcon
              icon={faStar}
              className='text-yellow-500 text-2xl ml-4'
            />
          </div>

          <h1 className='text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-serif'>
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 drop-shadow-sm'>
              Зв'яжіться з нами у свята! 🎄
            </span>
          </h1>
          <p className='text-gray-600 text-lg max-w-2xl mx-auto mb-6'>
            Готуємо ваші новорічні замовлення з особливою турботою та любов'ю
          </p>
          <div className='relative inline-block'>
            <div className='w-32 h-1.5 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 mx-auto rounded-full'></div>
            <motion.div
              className='absolute top-0 left-0 w-4 h-4 bg-yellow-300 rounded-full shadow-lg'
              animate={{ x: [0, 128, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Форма обратной связи с новогодним дизайном */}
          <motion.div
            className='bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-8 border border-white/50 relative overflow-hidden'
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Новогодний декор углов */}
            <div className='absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full opacity-10 blur-lg'></div>
            <div className='absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full opacity-10 blur-lg'></div>

            {/* Блестящая рамка при hover */}
            <div className='absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-red-400 group-hover:via-yellow-400 group-hover:to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

            <h2 className='text-2xl font-bold text-gray-800 mb-8 flex items-center'>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className='text-red-500 mr-3 text-xl'
                />
              </motion.div>
              <span className='bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent'>
                Напишіть нам для новорічного замовлення
              </span>
            </h2>

            <form className='space-y-6' onSubmit={sendEmail}>
              <div>
                <label
                  htmlFor='email'
                  className='block text-gray-700 mb-2 flex items-center'
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className='mr-2 text-red-500'
                    />
                  </motion.div>
                  Email для зв'язку
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  placeholder='Ваш email'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300 hover:shadow-md hover:border-red-300'
                  required
                />
              </div>

              <div>
                <label htmlFor='name' className='block text-gray-700 mb-2'>
                  <span className='inline-flex items-center'>
                    <FontAwesomeIcon
                      icon={faGift}
                      className='mr-2 text-green-500 text-sm'
                    />
                    Ваше ім'я
                  </span>
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  placeholder='Ваше ім`я'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300 hover:shadow-md hover:border-green-300'
                  required
                />
              </div>

              <div>
                <label htmlFor='message' className='block text-gray-700 mb-2'>
                  <span className='inline-flex items-center'>
                    <FontAwesomeIcon
                      icon={faStar}
                      className='mr-2 text-yellow-500 text-sm'
                    />
                    Ваше новорічне повідомлення
                  </span>
                </label>
                <textarea
                  id='message'
                  name='message'
                  rows='5'
                  placeholder='Опишіть ваше новорічне замовлення або поставте запитання...'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-300 hover:shadow-md hover:border-yellow-300'
                  required
                ></textarea>
              </div>

              <motion.button
                type='submit'
                className='w-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 hover:from-red-700 hover:via-yellow-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center group relative overflow-hidden'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Блестящий эффект */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                <span className='relative'>
                  Відправити новорічне повідомлення
                </span>
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className='ml-3 relative'
                />
              </motion.button>
            </form>
          </motion.div>

          <div className='space-y-8'>
            {/* Рабочие часы с новогодней темой */}

            {/* Контакты с праздничным оформлением */}
            <motion.div
              className='bg-gradient-to-br from-white to-red-50 rounded-3xl shadow-2xl p-8 border border-white/50 relative overflow-hidden'
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {/* Декор */}
              <div className='absolute -bottom-2 -left-2 w-8 h-8 bg-red-400 rounded-full opacity-20'></div>

              <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='text-red-500 mr-3'
                  />
                </motion.div>
                <span className='bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'>
                  ЗАТЕЛЕФОНУЙТЕ НАМ
                </span>
              </h2>
              <div className='space-y-4'>
                <motion.a
                  href='tel:+380631234567'
                  className='block text-gray-700 hover:text-red-600 transition-all duration-300 flex items-center p-3 bg-gradient-to-r from-white to-red-50 rounded-xl hover:shadow-lg group'
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className='bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 shadow-lg'
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className='font-bold'>🎁</span>
                  </motion.div>
                  <div>
                    <p className='font-semibold'>Новорічні замовлення:</p>
                    <p className='text-xl font-bold group-hover:text-red-600'>
                      +38 (099) 352-38-68
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                      Доступний Viber, Telegram
                    </p>
                  </div>
                </motion.a>

                <motion.a
                  href='tel:+380501234567'
                  className='block text-gray-700 hover:text-green-600 transition-all duration-300 flex items-center p-3 bg-gradient-to-r from-white to-green-50 rounded-xl hover:shadow-lg group'
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className='bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 shadow-lg'
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <span className='font-bold'>🎄</span>
                  </motion.div>
                  <div>
                    <p className='font-semibold'>Питання та консультації:</p>
                    <p className='text-xl font-bold group-hover:text-green-600'>
                      +38 (050) 020-36-93
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                      Консультації щодо меню
                    </p>
                  </div>
                </motion.a>
              </div>

              {/* Новогоднее сообщение */}
              <div className='mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200'>
                <p className='text-center text-gray-700'>
                  <span className='font-bold text-red-500'>🎅 Увага!</span>{' '}
                  Зв'язок у свята може зайняти трохи більше часу через велику
                  кількість замовлень.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default ContactSection
