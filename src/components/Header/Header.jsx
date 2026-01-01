import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import {
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaHome,
  FaInfoCircle,
  FaPhone,
  FaSnowflake,
  FaStar,
  FaGift
} from 'react-icons/fa'
import { useCartStore } from '../../store/cartStore'
import logo from '../../assets/logo1.jpg'

export function Header () {
  const [isOpen, setIsOpen] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const cartCount = useCartStore(state => state.cartCount())

  useEffect(() => {
    const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setIsIOS(isIOSDevice)
  }, [])

  // Блокировка скролла — iOS фикс
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navLinks = useMemo(
    () => [
      { name: 'Головна', path: '/', icon: <FaHome className='mr-2' /> },
      {
        name: 'Про нас',
        path: '/about',
        icon: <FaInfoCircle className='mr-2' />
      },
      { name: 'Контакти', path: '/contact', icon: <FaPhone className='mr-2' /> }
    ],
    []
  )

  // Лёгкие снежинки (очень мало элементов)
  const snowflakes = useMemo(
    () =>
      Array.from({ length: isIOS ? 3 : 6 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 1,
        duration: 3 + Math.random() * 3
      })),
    [isIOS]
  )

  const garlands = useMemo(
    () =>
      Array.from({ length: isIOS ? 10 : 16 }).map((_, i) => ({
        id: i,
        color: ['#dc2626', '#16a34a', '#fbbf24'][i % 3]
      })),
    [isIOS]
  )

  const handleLinkClick = () => setIsOpen(false)

  return (
    <header className='bg-gradient-to-b from-green-900 via-red-800 to-green-900 shadow-lg sticky top-0 z-50 overflow-hidden relative'>
      {/* ❄ Лёгкие снежинки только на десктопе */}
      {!isIOS && (
        <div className='absolute inset-0 pointer-events-none'>
          {snowflakes.map(flake => (
            <motion.div
              key={flake.id}
              className='absolute text-white/20'
              style={{ left: flake.left, top: '-10px' }}
              initial={{ y: -10 }}
              animate={{ y: '100vh' }}
              transition={{
                duration: flake.duration,
                delay: flake.delay,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <FaSnowflake className='text-[10px]' />
            </motion.div>
          ))}
        </div>
      )}

      {/* ✨ Упрощённые огоньки */}
      <div className='absolute top-0 left-0 right-0 h-[2px] flex justify-between'>
        {garlands.map((g, i) => (
          <motion.div
            key={g.id}
            className='w-[2px] h-[2px]'
            animate={!isIOS ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{
              duration: 1.4,
              delay: i * 0.12,
              repeat: Infinity
            }}
            style={{ backgroundColor: g.color }}
          />
        ))}
      </div>

      <div className='container mx-auto px-4 py-2 relative z-10'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center space-x-4 md:space-x-8'>
            {/* LOGO */}
            <Link
              to='/'
              className='flex items-center'
              onClick={handleLinkClick}
            >
              <div className='relative'>
                <div className='bg-gradient-to-br from-red-600 via-white to-green-600 p-1.5 md:p-2 rounded-full shadow-lg'>
                  <img
                    src={logo}
                    alt='Royal Brine'
                    className='w-6 h-6 md:w-8 md:h-8 rounded-full object-cover'
                  />
                </div>
                <FaStar className='absolute -top-0.5 -right-0.5 text-yellow-300 text-[8px] md:text-xs' />
              </div>

              <div className='ml-2 md:ml-3'>
                <div className='bg-gradient-to-r from-red-400 via-yellow-300 to-green-400 bg-clip-text text-transparent text-lg md:text-xl font-bold'>
                  Royal Brine
                </div>
              </div>
            </Link>

            {/* Desktop NAV */}
            <nav className='hidden md:flex items-center space-x-1'>
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className='px-3 py-1.5 rounded-lg flex items-center text-white hover:bg-white/20 border border-transparent hover:border-white/30 transition'
                >
                  <span className='mr-1.5'>{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* CART & BURGER */}
          <div className='flex items-center space-x-3 md:space-x-4'>
            <Link
              to='/cart'
              className='p-1.5 md:p-2 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center border border-white/30 relative'
              onClick={handleLinkClick}
            >
              <FaGift className='text-lg md:text-xl text-white' />
              {cartCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-yellow-500 text-white text-[10px] font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border border-white'>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* BURGER */}
            <button
              className='md:hidden text-xl z-50 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30'
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
            {/* overlay */}
            <motion.div
              className='fixed inset-0 bg-black/60 z-40'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* menu */}
            <motion.div
              className='fixed top-16 right-4 left-4 z-50 bg-gradient-to-b from-green-900 via-red-900 to-green-900 rounded-xl shadow-2xl border border-white/20 overflow-hidden'
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <div className='h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500' />

              <div className='divide-y divide-white/10'>
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={handleLinkClick}
                    className='px-4 py-3 flex items-center text-white hover:text-yellow-300'
                  >
                    <span className='mr-3 text-yellow-300'>{link.icon}</span>
                    {link.name}
                  </Link>
                ))}

                <Link
                  to='/cart'
                  onClick={handleLinkClick}
                  className='px-4 py-3 flex justify-between items-center text-white hover:text-yellow-300'
                >
                  <div className='flex items-center'>
                    <FaGift className='mr-3 text-yellow-300' />
                    Кошик
                  </div>
                  {cartCount > 0 && (
                    <span className='bg-gradient-to-r from-red-500 to-yellow-500 text-white text-xs font-bold rounded-full px-2 py-1'>
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
