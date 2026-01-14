import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faPhone,
  faPaperPlane,
  faStar,
  faHeart,
  faUtensils,
  faComments
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
          '🌿 Повідомлення надіслано! Ми скоро звʼяжемось з вами.',
          {
            position: 'top-right',
            autoClose: 4000,
            theme: 'colored',
            style: {
              background: '#2D241E',
              color: 'white'
            }
          }
        )
        e.target.reset()
      })
      .catch(() => {
        toast.error('❌ Помилка при надсиланні. Спробуйте ще раз.', {
          position: 'top-right',
          theme: 'colored'
        })
      })
  }

  return (
    <div className='min-h-screen bg-[#FDFCFB] py-16 px-4 relative overflow-hidden'>
      {/* Мягкие фоновые акценты */}
      <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[100px]' />
      <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-50/50 rounded-full blur-[100px]' />

      <div className='max-w-6xl mx-auto relative z-10'>
        {/* Заголовок в домашнем стиле */}
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className='inline-flex items-center justify-center mb-6 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-50'>
            <FontAwesomeIcon
              icon={faHeart}
              className='text-orange-400 text-sm mr-3'
            />
            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>
              Завжди на зв'язку
            </span>
          </div>

          <h1 className='text-4xl md:text-6xl font-black text-[#2D241E] mb-6 tracking-tight'>
            Маєте <span className='text-orange-500'>запитання?</span>
          </h1>
          <p className='text-gray-500 text-lg max-w-2xl mx-auto mb-8 font-medium'>
            Ми завжди раді поспілкуватися про наші страви, допомогти з вибором
            або обговорити ваше індивідуальне замовлення.
          </p>
          <div className='w-24 h-1 bg-orange-100 mx-auto rounded-full' />
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Форма обратной связи */}
          <motion.div
            className='bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8 md:p-10 relative'
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className='text-2xl font-black text-[#2D241E] mb-8 flex items-center gap-3'>
              <div className='w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white'>
                <FontAwesomeIcon icon={faComments} className='text-sm' />
              </div>
              Напишіть нам
            </h2>

            <form className='space-y-5' onSubmit={sendEmail}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-2'>
                  <label className='text-[11px] font-black uppercase tracking-wider text-gray-400 ml-2'>
                    Ваше Ім'я
                  </label>
                  <input
                    type='text'
                    name='name'
                    placeholder='Олександр'
                    className='w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold text-[#2D241E]'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[11px] font-black uppercase tracking-wider text-gray-400 ml-2'>
                    Ваш Номер Телефону
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    placeholder='+38 (0__) ___-__-__'
                    className='w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold text-[#2D241E]'
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[11px] font-black uppercase tracking-wider text-gray-400 ml-2'>
                  Ваше повідомлення
                </label>
                <textarea
                  name='message'
                  rows='5'
                  placeholder='Що вас цікаве?'
                  className='w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold text-[#2D241E] resize-none'
                  required
                ></textarea>
              </div>

              <motion.button
                type='submit'
                className='w-full bg-[#2D241E] text-white font-black py-5 px-6 rounded-2xl transition-all shadow-lg hover:bg-orange-600 flex items-center justify-center gap-3 uppercase tracking-widest text-xs'
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Надіслати листа</span>
                <FontAwesomeIcon icon={faPaperPlane} className='text-[10px]' />
              </motion.button>
            </form>
          </motion.div>

          <div className='space-y-8 flex flex-col justify-center'>
            {/* Контакты */}
            <motion.div
              className='bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8 md:p-10'
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className='text-2xl font-black text-[#2D241E] mb-8'>
                Наші контакти
              </h2>

              <div className='space-y-6'>
                {/* Телефон 1 */}
                <motion.a
                  href='tel:+380993523868'
                  className='flex items-center p-4 rounded-[1.8rem] hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100 group'
                  whileHover={{ x: 5 }}
                >
                  <div className='w-14 h-14 bg-[#2D241E] text-white rounded-2xl flex items-center justify-center mr-5 shadow-lg shadow-gray-200 transition-colors group-hover:bg-orange-500'>
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div>
                    <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1'>
                      Для замовлень
                    </p>
                    <p className='text-xl font-black text-[#2D241E]'>
                      +38 (099) 352-38-68
                    </p>
                    <p className='text-xs text-gray-500 font-medium'>
                      Viber, Telegram
                    </p>
                  </div>
                </motion.a>

                {/* Телефон 2 */}
                <motion.a
                  href='tel:+380500203693'
                  className='flex items-center p-4 rounded-[1.8rem] hover:bg-green-50 transition-all border border-transparent hover:border-green-100 group'
                  whileHover={{ x: 5 }}
                >
                  <div className='w-14 h-14 bg-gray-100 text-[#2D241E] rounded-2xl flex items-center justify-center mr-5 transition-colors group-hover:bg-green-500 group-hover:text-white'>
                    <FontAwesomeIcon icon={faUtensils} />
                  </div>
                  <div>
                    <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1'>
                      Консультації
                    </p>
                    <p className='text-xl font-black text-[#2D241E]'>
                      +38 (050) 020-36-93
                    </p>
                    <p className='text-xs text-gray-500 font-medium'>
                      Питання щодо складу та меню
                    </p>
                  </div>
                </motion.a>
              </div>

              {/* Мягкая карточка режима работы */}
              <div className='mt-10 p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50 flex items-start gap-4'>
                <div className='text-orange-500 mt-1'>
                  <FontAwesomeIcon icon={faStar} className='text-xs' />
                </div>
                <p className='text-sm text-gray-600 font-medium leading-relaxed'>
                  Ми приймаємо ваші замовлення щодня. Відправка та доставка
                  здійснюється згідно з графіком роботи кухні, про який ми
                  повідомимо під час підтвердження.
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
