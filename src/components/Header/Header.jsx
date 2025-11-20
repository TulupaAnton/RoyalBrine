import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaHome,
  FaBoxes,
  FaInfoCircle,
  FaPhone,
  FaHeart
} from 'react-icons/fa'
import { useCartStore } from '../../store/cartStore'
import logo from '../../assets/logo1.jpg'

export function Header () {
  const [isOpen, setIsOpen] = useState(false)
  const cartCount = useCartStore(state => state.cartCount())

  const navLinks = [
    { name: 'Головна', path: '/', icon: <FaHome className='mr-2' /> },
    {
      name: 'Про нас',
      path: '/about',
      icon: <FaInfoCircle className='mr-2' />
    },
    { name: 'Контакти', path: '/contact', icon: <FaPhone className='mr-2' /> }
  ]

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <header className='bg-gradient-to-b from-amber-800 to-amber-900 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-90'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='flex items-center space-x-8'
          >
            <Link to='/' className='flex items-center'>
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='text-2xl font-bold text-white flex items-center'
              >
                <motion.span
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className='bg-gradient-to-br from-amber-500 to-amber-700 p-2 rounded-lg mr-3 shadow-lg flex items-center justify-center'
                  style={{
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <img
                    src={logo}
                    alt='Royal Brine Logo'
                    className='w-8 h-8 object-contain filter drop-shadow-md'
                    style={{
                      filter: 'drop-shadow(0 2px 1px rgba(0, 0, 0, 0.2))'
                    }}
                  />
                </motion.span>
                <motion.span
                  className='bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 bg-clip-text text-transparent'
                  style={{
                    textShadow: '0 2px 4px rgba(180, 83, 9, 0.3)',
                    fontSize: '1.5rem',
                    lineHeight: '2rem'
                  }}
                >
                  Royal Brine
                </motion.span>
              </motion.span>
            </Link>

            <nav className='hidden md:flex items-center space-x-1'>
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.path}
                    className='relative group px-4 py-2 rounded-lg flex items-center text-amber-100 hover:bg-amber-700/50 transition-all duration-300'
                  >
                    {link.icon}
                    <span>{link.name}</span>
                    <span className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-amber-300 transition-all duration-300 group-hover:w-3/4'></span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          <div className='flex items-center space-x-4'>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className='relative'
            ></motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className='relative'
            >
              <Link
                to='/cart'
                className='p-2 rounded-full bg-amber-700/30 hover:bg-amber-700/50 transition-colors flex items-center justify-center relative'
              >
                <FaShoppingCart className='text-xl text-amber-100' />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md'
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className='md:hidden text-xl z-50 p-2 rounded-full bg-amber-700/30 hover:bg-amber-700/50 text-amber-100 transition-colors'
              onClick={() => setIsOpen(!isOpen)}
              aria-label='Menu'
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </motion.button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <>
                {/* Overlay with blur effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='fixed inset-0 bg-black/30 backdrop-blur-lg z-30'
                  onClick={() => setIsOpen(false)}
                />

                {/* Mobile menu */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className='fixed top-20 right-4 left-4 z-40 bg-gradient-to-b from-amber-800 to-amber-900 rounded-xl shadow-2xl overflow-hidden border border-amber-700/50'
                  onClick={e => e.stopPropagation()}
                >
                  <motion.div
                    variants={menuVariants}
                    initial='hidden'
                    animate='visible'
                    className='divide-y divide-amber-700/30'
                  >
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        variants={itemVariants}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Link
                          to={link.path}
                          className='flex items-center px-6 py-4 text-lg text-amber-100 hover:bg-amber-700/30 transition-colors'
                          onClick={() => setIsOpen(false)}
                        >
                          {link.icon}
                          <span>{link.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                    <motion.div
                      variants={itemVariants}
                      className='px-6 py-4 bg-amber-700/20'
                    >
                      <Link
                        to='/cart'
                        className='flex items-center justify-between text-lg font-medium text-amber-50'
                        onClick={() => setIsOpen(false)}
                      >
                        <div className='flex items-center'>
                          <FaShoppingCart className='mr-3 text-amber-200' />
                          <span>Кошик</span>
                        </div>
                        {cartCount > 0 && (
                          <span className='bg-amber-400 text-amber-900 text-sm font-bold rounded-full px-2.5 py-1 shadow-sm'>
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
