import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons'
import {
  faHeart,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faUtensils,
  faLeaf
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'

export function Footer () {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-[#1A1614] text-white py-16 relative overflow-hidden'>
      {/* Декоративный элемент на фоне */}
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -mb-48 -mr-48' />

      <div className='max-w-screen-xl mx-auto px-6 relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24'>
          {/* Блок 1: О нас */}
          <div className='space-y-6'>
            <div className='flex items-center gap-3'>
              <h3 className='text-2xl font-black tracking-tight'>
                Royal <span className='text-orange-500'>Brine</span>
              </h3>
            </div>
            <p className='text-gray-400 text-sm leading-relaxed max-w-sm'>
              Ми віримо, що справжня їжа має бути домашньою. Готуємо з
              натуральних інгредієнтів за перевіреними рецептами, щоб ви могли
              насолоджуватися смаком дитинства щодня.
            </p>
            <div className='flex gap-4 pt-2'>
              <motion.a
                whileHover={{ y: -3 }}
                href='https://www.instagram.com/royal_brine/'
                className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-orange-500 transition-colors'
              >
                <FontAwesomeIcon icon={faInstagram} />
              </motion.a>
              <motion.a
                whileHover={{ y: -3 }}
                href='https://www.tiktok.com/@royal.brine'
                className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-orange-500 transition-colors'
              >
                <FontAwesomeIcon icon={faTiktok} />
              </motion.a>
            </div>
          </div>

          {/* Блок 2: Контакты */}
          <div>
            <h4 className='text-sm font-black uppercase tracking-[0.2em] text-orange-500 mb-8'>
              Контакти
            </h4>
            <ul className='space-y-5'>
              <li className='flex items-start gap-4 group'>
                <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-orange-400 transition-colors'>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className='text-sm' />
                </div>
                <div>
                  <p className='text-[10px] font-black uppercase text-gray-500'>
                    Локація
                  </p>
                  <p className='text-sm font-bold'>Запоріжжя, Україна</p>
                </div>
              </li>
              <li className='flex items-start gap-4 group'>
                <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-orange-400 transition-colors'>
                  <FontAwesomeIcon icon={faPhone} className='text-sm' />
                </div>
                <div>
                  <p className='text-[10px] font-black uppercase text-gray-500'>
                    Зателефонувати
                  </p>
                  <p className='text-sm font-bold'>+38 (099) 352-38-68</p>
                </div>
              </li>
              <li className='flex items-start gap-4 group'>
                <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-orange-400 transition-colors'>
                  <FontAwesomeIcon icon={faEnvelope} className='text-sm' />
                </div>
                <div>
                  <p className='text-[10px] font-black uppercase text-gray-500'>
                    Написати
                  </p>
                  <p className='text-sm font-bold'>royalbriner@gmail.com</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Блок 3: Ссылки */}
          <div>
            <h4 className='text-sm font-black uppercase tracking-[0.2em] text-orange-500 mb-8'>
              Навігація
            </h4>
            <ul className='space-y-4 text-sm font-bold'>
              <li>
                <Link
                  to='/'
                  className='text-gray-400 hover:text-white transition-colors flex items-center gap-2'
                >
                  <FontAwesomeIcon
                    icon={faLeaf}
                    className='text-[10px] text-orange-500/50'
                  />
                  Головна сторінка
                </Link>
              </li>
              <li>
                <Link
                  to='/catalog/pickles'
                  className='text-gray-400 hover:text-white transition-colors flex items-center gap-2'
                >
                  <FontAwesomeIcon
                    icon={faLeaf}
                    className='text-[10px] text-orange-500/50'
                  />
                  Наше меню
                </Link>
              </li>
              <li>
                <Link
                  to='/Contact'
                  className='text-gray-400 hover:text-white transition-colors flex items-center gap-2'
                >
                  <FontAwesomeIcon
                    icon={faLeaf}
                    className='text-[10px] text-orange-500/50'
                  />
                  Зворотній зв'язок
                </Link>
              </li>
              <li>
                <Link
                  to='/terms'
                  className='text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs opacity-60'
                >
                  Умови користування
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className='mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6'>
          <p className='text-xs text-gray-500 font-medium'>
            &copy; {currentYear}{' '}
            <span className='text-gray-300'>Royal Brine</span>. Всі права
            захищені.
          </p>
          <div className='flex items-center gap-2 text-xs text-gray-500'>
            <span>Зроблено з</span>
            <FontAwesomeIcon icon={faHeart} className='text-orange-500' />
            <span>для вашого затишку</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
