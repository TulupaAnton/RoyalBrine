import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import {
  FaBars,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaPhone,
  FaShoppingBasket,
  FaUtensils
} from 'react-icons/fa'
import { useCartStore } from '../../store/cartStore'
import logo from '../../assets/logo1.jpg'

export function Header () {
  const [isOpen, setIsOpen] = useState(false)
  const cartCount = useCartStore(state => state.cartCount())

  // Блокировка скролла при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navLinks = useMemo(
    () => [
      { name: 'Головна', path: '/', icon: <FaHome /> },
      { name: 'Про нас', path: '/about', icon: <FaInfoCircle /> },
      { name: 'Контакти', path: '/contact', icon: <FaPhone /> }
    ],
    []
  )

  const handleLinkClick = () => setIsOpen(false)

  return (
    <header className='bg-[#FDFCFB]/80 backdrop-blur-md sticky top-0 z-50 border-b border-orange-50'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center'>
          {/* LOGO SECTION */}
          <Link
            to='/'
            className='flex items-center group'
            onClick={handleLinkClick}
          >
            <div className='relative'>
              <div className='bg-white p-1 rounded-2xl shadow-sm border border-orange-100 transition-transform group-hover:scale-105'>
                <img
                  src={logo}
                  alt='Royal Brine'
                  className='w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover'
                />
              </div>
              <div className='absolute -bottom-1 -right-1 bg-orange-500 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center'>
                <div className='w-1.5 h-1.5 bg-white rounded-full' />
              </div>
            </div>

            <div className='ml-3'>
              <h1 className='text-[#2D241E] text-xl md:text-2xl font-black leading-tight tracking-tighter'>
                Royal <span className='text-orange-500'>Brine</span>
              </h1>
              <p className='text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 leading-none'>
                Домашня Кухня
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className='hidden md:flex items-center bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100'>
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className='px-5 py-2 rounded-xl flex items-center text-[#2D241E] text-sm font-black uppercase tracking-widest hover:bg-white hover:text-orange-500 hover:shadow-sm transition-all'
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ACTIONS (CART & MENU) */}
          <div className='flex items-center gap-2 md:gap-4'>
            <Link
              to='/cart'
              className='w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#2D241E] text-white flex items-center justify-center relative shadow-lg shadow-gray-200 transition-transform active:scale-90 hover:bg-orange-600'
              onClick={handleLinkClick}
            >
              <FaShoppingBasket className='text-lg' />
              {cartCount > 0 && (
                <span className='absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#FDFCFB] animate-bounce'>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* BURGER BUTTON */}
            <button
              className='md:hidden w-10 h-10 rounded-2xl bg-white border border-gray-100 text-[#2D241E] flex items-center justify-center text-lg shadow-sm'
              onClick={() => setIsOpen(prev => !prev)}
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className='fixed inset-0 bg-[#2D241E]/40 backdrop-blur-sm z-40'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className='fixed top-20 right-4 left-4 z-50 bg-white rounded-[2rem] shadow-2xl border border-orange-50 overflow-hidden'
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className='p-3'>
                <div className='flex flex-col gap-1'>
                  {navLinks.map((link, i) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={handleLinkClick}
                      className='flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-orange-50 transition-colors group'
                    >
                      <div className='w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-colors'>
                        {link.icon}
                      </div>
                      <span className='text-[#2D241E] font-black uppercase tracking-widest text-sm'>
                        {link.name}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className='mt-3 pt-3 border-t border-gray-50'>
                  <Link
                    to='/cart'
                    onClick={handleLinkClick}
                    className='flex items-center justify-between px-6 py-5 bg-[#2D241E] rounded-[1.5rem] text-white'
                  >
                    <div className='flex items-center gap-4'>
                      <FaShoppingBasket className='text-orange-500' />
                      <span className='font-black uppercase tracking-widest text-sm'>
                        Ваш кошик
                      </span>
                    </div>
                    {cartCount > 0 && (
                      <span className='bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase'>
                        {cartCount} страв
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
