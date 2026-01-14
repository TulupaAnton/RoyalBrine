import React, { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faEnvelope,
  faClock,
  faComments,
  faPaperPlane,
  faMapMarkerAlt
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
      toast.error("Ім'я має бути не коротше 2 символів")
      return false
    }
    if (!emailRegex.test(email)) {
      toast.error('Введіть коректний email')
      return false
    }
    if (phone && !phoneRegex.test(phone)) {
      toast.error('Невірний формат телефону')
      return false
    }
    if (message.length < 5) {
      toast.error('Повідомлення занадто коротке')
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
        toast.success('✅ Повідомлення надіслано!')
        formRef.current.reset()
      })
      .catch(() => {
        toast.error('❌ Помилка надсилання')
      })
  }

  return (
    <div className='py-16 bg-[#FDFCFB] min-h-screen overflow-x-hidden relative'>
      {/* Мягкие декоративные пятна на фоне */}
      <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[120px] -z-10' />
      <div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-50/40 rounded-full blur-[120px] -z-10' />

      <ToastContainer position='top-center' autoClose={3000} hideProgressBar />

      <div className='max-w-screen-xl mx-auto px-6'>
        {/* Header */}
        <div className='text-left mb-16' data-aos='fade-up'>
          <p className='text-orange-500 font-black uppercase tracking-[0.3em] text-xs mb-4'>
            Зворотній зв'язок
          </p>
          <h1 className='text-5xl md:text-6xl font-black text-[#2D241E] tracking-tighter mb-6'>
            Наші <span className='text-orange-500'>контакти</span>
          </h1>
          <p className='text-lg text-gray-500 max-w-2xl font-medium leading-relaxed'>
            Ми завжди на зв’язку, щоб допомогти вам із замовленням або
            відповісти на запитання щодо нашої продукції.
          </p>
        </div>

        <div className='grid lg:grid-cols-[1fr_1.2fr] gap-16 mb-20'>
          {/* Инфо-блоки */}
          <div className='space-y-10' data-aos='fade-right'>
            <div className='grid sm:grid-cols-2 lg:grid-cols-1 gap-6'>
              {/* Телефони */}
              <div className='bg-white rounded-[2rem] p-8 shadow-sm border border-orange-50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500'>
                <div className='w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-200'>
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <h3 className='text-xl font-black text-[#2D241E] mb-4'>
                  Телефони
                </h3>
                <ul className='space-y-3 font-bold text-gray-600'>
                  <li className='hover:text-orange-500 transition-colors'>
                    <a href='tel:+380993523868'>+38 (099) 352-38-68</a>
                  </li>
                  <li className='hover:text-orange-500 transition-colors'>
                    <a href='tel:+380500203693'>+38 (050) 020-36-93</a>
                  </li>
                </ul>
              </div>

              {/* Email & Location */}
              <div className='bg-white rounded-[2rem] p-8 shadow-sm border border-orange-50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500'>
                <div className='w-12 h-12 bg-[#2D241E] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-200'>
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <h3 className='text-xl font-black text-[#2D241E] mb-4'>
                  Пошта та локація
                </h3>
                <p className='text-gray-600 font-bold mb-2'>
                  royalbriner@gmail.com
                </p>
                <p className='text-gray-400 text-sm font-medium'>
                  Запоріжжя, Україна
                </p>
              </div>
            </div>

            {/* Графік */}
            <div className='bg-white rounded-[2rem] p-8 shadow-sm border border-orange-50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center'>
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <h3 className='text-xl font-black text-[#2D241E]'>
                  Графік роботи
                </h3>
              </div>
              <div className='space-y-4 font-bold'>
                <div className='flex justify-between items-center py-2 border-b border-gray-50'>
                  <span className='text-gray-400 uppercase text-[10px] tracking-widest'>
                    Пн — Пт
                  </span>
                  <span className='text-[#2D241E]'>08:00 - 22:00</span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-gray-50'>
                  <span className='text-gray-400 uppercase text-[10px] tracking-widest'>
                    Сб — Нд
                  </span>
                  <span className='text-[#2D241E]'>08:00 - 18:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Форма */}
          <div
            className='bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-orange-50 relative'
            data-aos='fade-left'
          >
            <div className='absolute -top-6 -right-6 w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-3xl shadow-xl rotate-12 hidden md:flex'>
              <FontAwesomeIcon icon={faComments} />
            </div>

            <h2 className='text-3xl font-black text-[#2D241E] mb-8'>
              Напишіть нам
            </h2>
            <form ref={formRef} onSubmit={sendEmail} className='space-y-6'>
              <div className='grid md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                    Ваше ім'я
                  </label>
                  <input
                    type='text'
                    name='name'
                    className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold transition-all'
                    placeholder="Ім'я"
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                    Email
                  </label>
                  <input
                    type='email'
                    name='email'
                    className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold transition-all'
                    placeholder='mail@example.com'
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                  Телефон
                </label>
                <input
                  type='tel'
                  name='phone'
                  className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold transition-all'
                  placeholder='+380...'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2'>
                  Повідомлення
                </label>
                <textarea
                  name='message'
                  rows='4'
                  className='w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold transition-all'
                  placeholder='Ваше запитання...'
                  required
                ></textarea>
              </div>

              <button
                type='submit'
                className='w-full py-5 bg-[#2D241E] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-gray-100 flex items-center justify-center gap-3'
              >
                <span>Надіслати</span>
                <FontAwesomeIcon icon={faPaperPlane} className='text-[10px]' />
              </button>
            </form>
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className='bg-[#2D241E] rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden'
          data-aos='fade-up'
        >
          <div className='absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl' />
          <div className='relative z-10 max-w-2xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-black mb-6 tracking-tight'>
              Залишились запитання?
            </h2>
            <p className='text-gray-400 font-medium text-lg mb-10'>
              Ми з радістю допоможемо обрати найкращі страви для вашого столу
              або обговоримо деталі співпраці.
            </p>
            <div className='flex flex-col sm:flex-row justify-center gap-4'>
              <a
                href='tel:+380993523868'
                className='px-10 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#2D241E] transition-all'
              >
                Зателефонувати
              </a>
              <a
                href='mailto:royalbriner@gmail.com'
                className='px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all'
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
