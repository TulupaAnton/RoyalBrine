import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faClock,
  faPhone,
  faPaperPlane
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
        toast.success('✅ Повідомлення успішно надіслано!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light'
        })
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
          theme: 'light'
        })
      })
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-16 px-4 relative overflow-hidden'>
      <div className='absolute top-20 left-10 w-24 h-24 rounded-full bg-amber-200 opacity-30 blur-xl'></div>
      <div className='absolute bottom-40 right-20 w-16 h-16 rounded-full bg-amber-300 opacity-40 blur-xl'></div>
      <div className='absolute top-1/3 right-1/4 w-10 h-10 rounded-full bg-amber-400 opacity-20 blur-lg'></div>

      <div className='max-w-6xl mx-auto relative z-10'>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className='text-4xl md:text-5xl font-bold text-gray-800 mb-6'>
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800'>
              Зв’яжіться з нами
            </span>
          </h1>
          <div className='w-24 h-1.5 bg-amber-500 mx-auto rounded-full'></div>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <motion.div
            className='bg-white rounded-2xl shadow-xl p-8'
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className='text-2xl font-bold text-gray-800 mb-8 flex items-center'>
              <FontAwesomeIcon
                icon={faPaperPlane}
                className='text-amber-500 mr-3 text-xl'
              />
              Напишіть нам
            </h2>

            <form className='space-y-6' onSubmit={sendEmail}>
              <div>
                <label
                  htmlFor='email'
                  className='block text-gray-700 mb-2 flex items-center'
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className='mr-2 text-amber-500'
                  />
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  placeholder='Ваш email'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all duration-300 hover:shadow-md'
                  required
                />
              </div>

              <div>
                <label htmlFor='name' className='block text-gray-700 mb-2'>
                  Ваше ім’я
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  placeholder='Ваше ім’я'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all duration-300 hover:shadow-md'
                  required
                />
              </div>

              <div>
                <label htmlFor='message' className='block text-gray-700 mb-2'>
                  Повідомлення
                </label>
                <textarea
                  id='message'
                  name='message'
                  rows='5'
                  placeholder='Ваше повідомлення'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all duration-300 hover:shadow-md'
                  required
                ></textarea>
              </div>

              <motion.button
                type='submit'
                className='w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Надіслати повідомлення</span>
                <FontAwesomeIcon icon={faPaperPlane} className='ml-3' />
              </motion.button>
            </form>
          </motion.div>

          <div className='space-y-8'>
            <motion.div
              className='bg-white rounded-2xl shadow-xl p-8'
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
                <FontAwesomeIcon
                  icon={faClock}
                  className='text-amber-500 mr-3'
                />
                ГОДИНИ РОБОТИ
              </h2>
              <div className='space-y-2 text-gray-600'>
                <p>з понеділка по неділю</p>
                <p>з 8:00 до 22:00</p>
              </div>
            </motion.div>

            <motion.div
              className='bg-white rounded-2xl shadow-xl p-8'
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
                <FontAwesomeIcon
                  icon={faPhone}
                  className='text-amber-500 mr-3'
                />
                ЗАТЕЛЕФОНУЙТЕ НАМ
              </h2>
              <div className='space-y-4'>
                <a
                  href='tel:+380631234567'
                  className='block text-gray-600 hover:text-amber-600 transition-colors duration-300 flex items-center'
                >
                  <span className='bg-amber-100 text-amber-700 rounded-full w-8 h-8 flex items-center justify-center mr-3'>
                    1
                  </span>
                  +38 (099) 352-38-68
                </a>
                <a
                  href='tel:+380501234567'
                  className='block text-gray-600 hover:text-amber-600 transition-colors duration-300 flex items-center'
                >
                  <span className='bg-amber-100 text-amber-700 rounded-full w-8 h-8 flex items-center justify-center mr-3'>
                    2
                  </span>
                  +38 (050) 020-36-93
                </a>
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
