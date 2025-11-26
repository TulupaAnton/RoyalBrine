import React, { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faEnvelope,
  faClock,
  faComments
} from '@fortawesome/free-solid-svg-icons'
import AOS from 'aos'
import 'aos/dist/aos.css'
import emailjs from 'emailjs-com'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function Contacts () {
  const formRef = useRef()

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    })
  }, [])

  const validateForm = () => {
    const form = formRef.current
    const name = form['name'].value.trim()
    const email = form['email'].value.trim()
    const phone = form['phone'].value.trim()
    const message = form['message'].value.trim()

    const nameRegex = /^[А-Яа-яЇїІіЄєҐґA-Za-z\s'-]{2,}$/u
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?\d{10,15}$/

    if (!nameRegex.test(name)) {
      toast.error("Ім'я має містити лише літери та бути не коротше 2 символів")
      return false
    }

    if (!emailRegex.test(email)) {
      toast.error('Введіть коректний email')
      return false
    }

    if (phone && !phoneRegex.test(phone)) {
      toast.error(
        'Телефон має містити тільки цифри (можна з +) і бути довжиною від 10'
      )
      return false
    }

    if (message.length < 5) {
      toast.error('Повідомлення має містити щонайменше 5 символів')
      return false
    }

    return true
  }

  const sendEmail = e => {
    e.preventDefault()

    if (!validateForm()) return

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        toast.success('✅ Повідомлення успішно надіслано!', {
          position: 'top-center'
        })
        formRef.current.reset()
      })
      .catch(() => {
        toast.error('❌ Помилка при надсиланні повідомлення', {
          position: 'top-center'
        })
      })
  }

  return (
    <div className='py-16 bg-gradient-to-b from-amber-50 to-white min-h-screen overflow-x-hidden'>
      <ToastContainer />
      <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16' data-aos='fade-up'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent'>
            Наші контакти
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Ми завжди раді вашому дзвінку або листу
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-12 mb-20'>
          <div className='space-y-8' data-aos='fade-right'>
            <div className='grid sm:grid-cols-2 gap-6'>
              <div
                className='bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300'
                data-aos='fade-up'
                data-aos-delay='100'
              >
                <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='text-amber-500 mr-3'
                  />
                  Телефони
                </h3>
                <ul className='space-y-2'>
                  <li className='text-gray-600 hover:text-amber-600 transition-colors'>
                    <a href='tel:+380500203693'>+38 (050) 020-36-93</a>
                  </li>
                </ul>
              </div>

              <div
                className='bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300'
                data-aos='fade-up'
                data-aos-delay='200'
              >
                <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className='text-amber-500 mr-3'
                  />
                  Email
                </h3>
                <ul className='space-y-2'>
                  <li className='text-gray-600 hover:text-amber-600 transition-colors break-all'>
                    <a href='mailto:royalbriner@gmail.com'>
                      royalbriner@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className='bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300'
              data-aos='fade-up'
              data-aos-delay='300'
            >
              <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                <FontAwesomeIcon
                  icon={faClock}
                  className='text-amber-500 mr-3'
                />
                Графік роботи
              </h3>
              <ul className='space-y-2'>
                <li className='flex justify-between text-gray-600'>
                  <span>Пн-Пт:</span>
                  <span className='font-medium'>08:00 - 22:00</span>
                </li>
                <li className='flex justify-between text-gray-600'>
                  <span>Сб:</span>
                  <span className='font-medium'>8:00 - 20:00</span>
                </li>
                <li className='flex justify-between text-gray-600'>
                  <span>Нд:</span>
                  <span className='font-medium'>8:00 - 18:00</span>
                </li>
                <li className='pt-2 text-gray-500 text-sm'>
                  Консультації доступні цілодобово
                </li>
              </ul>
            </div>
          </div>

          {/* Форма */}
          <div
            className='bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300'
            data-aos='fade-left'
          >
            <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
              <FontAwesomeIcon
                icon={faComments}
                className='text-amber-500 mr-3'
              />
              Написати нам
            </h2>
            <form ref={formRef} onSubmit={sendEmail} className='space-y-4'>
              <div>
                <label htmlFor='name' className='block text-gray-700 mb-2'>
                  Ваше ім'я
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all'
                  placeholder="Введіть ваше ім'я"
                  required
                />
              </div>

              <div>
                <label htmlFor='email' className='block text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all'
                  placeholder='Введіть ваш email'
                  required
                />
              </div>

              <div>
                <label htmlFor='phone' className='block text-gray-700 mb-2'>
                  Телефон
                </label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all'
                  placeholder='Введіть ваш телефон'
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
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all'
                  placeholder='Введіть ваше повідомлення'
                  required
                ></textarea>
              </div>

              <button
                type='submit'
                className='w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg'
              >
                Надіслати повідомлення
              </button>
            </form>
          </div>
        </div>

        <div
          className='bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 md:p-12 text-center text-white overflow-hidden'
          data-aos='fade-up'
        >
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-2xl md:text-3xl font-bold mb-4'>
              Залишились питання?
            </h2>
            <p className='text-xl mb-6 opacity-90'>
              Наші менеджери завжди готові допомогти вам з вибором продуктів або
              відповісти на будь-які запитання
            </p>
            <div className='flex flex-col sm:flex-row justify-center gap-4'>
              <a
                href='tel:+380500203693'
                className='inline-block px-6 py-3 bg-white text-amber-600 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-300 shadow-lg'
              >
                Зателефонувати
              </a>
              <a
                href='mailto:royalbriner@gmail.com'
                className='inline-block px-6 py-3 border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-colors duration-300 shadow-lg'
              >
                Написати email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
