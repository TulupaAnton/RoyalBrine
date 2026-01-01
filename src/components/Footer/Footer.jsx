import { faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import { FaGift, FaStar, FaSnowflake, FaTree } from 'react-icons/fa'

export function Footer () {
  const currentYear = new Date().getFullYear()

  // Новогодние снежинки
  const snowflakes = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 3,
    delay: Math.random() * 3
  }))

  return (
    <footer className='bg-gradient-to-b from-green-950 via-red-900 to-green-950 text-white py-14 relative overflow-hidden'>
      {/* Анимированные снежинки */}
      <div className='absolute inset-0 pointer-events-none'>
        {snowflakes.map(flake => (
          <motion.div
            key={flake.id}
            className='absolute text-white/20'
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
            <FaSnowflake />
          </motion.div>
        ))}
      </div>

      {/* Новогодние огоньки сверху */}
      <div className='absolute top-0 left-0 right-0 h-1'>
        <div className='flex justify-between px-2'>
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className='w-2 h-2 rounded-full'
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                repeat: Infinity
              }}
              style={{
                backgroundColor:
                  i % 3 === 0 ? '#dc2626' : i % 3 === 1 ? '#16a34a' : '#fbbf24'
              }}
            />
          ))}
        </div>
      </div>

      <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12 relative z-10'>
        {/* Про нас с новогодней темой */}
        <div>
          <h3 className='text-lg font-bold mb-4 uppercase flex items-center'>
            <FaTree className='text-green-400 mr-2' />
            <span className='bg-gradient-to-r from-amber-300 via-yellow-300 to-green-300 bg-clip-text text-transparent'>
              З Новим Роком!
            </span>
          </h3>
          <p className='text-amber-100 text-sm leading-relaxed'>
            Готуємо ваш новорічний стіл з любов'ю та турботою! 🎄 Найсвіжіші
            інгредієнти, традиційні рецепти та швидка доставка по Запоріжжю.
            Нехай ваші свята будуть смачними!
          </p>

          {/* Новогоднее предложение */}
        </div>

        {/* Контакти с праздничным оформлением */}
        <div>
          <h3 className='text-lg font-bold mb-4 uppercase flex items-center'>
            <FaGift className='text-red-400 mr-2' />
            <span className='bg-gradient-to-r from-red-300 via-pink-300 to-amber-300 bg-clip-text text-transparent'>
              Новорічні контакти
            </span>
          </h3>
          <ul className='text-amber-100 text-sm space-y-2'>
            <li className='flex items-center'>
              <span className='w-5 h-5 mr-2 bg-red-500 rounded-full flex items-center justify-center text-xs'>
                📍
              </span>
              <span>Запоріжжя, Україна</span>
            </li>
            <li className='flex items-center'>
              <span className='w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center text-xs'>
                📞
              </span>
              <span>+38 (099) 352-38-68</span>
            </li>
            <li className='flex items-center'>
              <span className='w-5 h-5 mr-2 bg-yellow-500 rounded-full flex items-center justify-center text-xs'>
                📧
              </span>
              <span>royalbriner@gmail.com</span>
            </li>
          </ul>
        </div>

        {/* Соцмережі + Посиланния с праздничным стилем */}
        <div>
          <div>
            <h3 className='text-lg font-bold mt-6 mb-4 uppercase flex items-center'>
              <FaSnowflake className='text-blue-300 mr-2' />
              <span className='bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent'>
                Корисні посилання
              </span>
            </h3>
            <ul className='text-amber-100 text-sm space-y-2'>
              <li>
                <motion.a
                  href='/'
                  className='hover:text-yellow-300 transition-all duration-300 flex items-center group'
                  whileHover={{ x: 5 }}
                >
                  <span className='mr-2 group-hover:scale-110 transition-transform'>
                    🏠
                  </span>
                  <span>Новорічна головна</span>
                </motion.a>
              </li>
              <li>
                <motion.a
                  href='/catalog/semi-finished'
                  className='hover:text-red-300 transition-all duration-300 flex items-center group'
                  whileHover={{ x: 5 }}
                >
                  <span className='mr-2 group-hover:scale-110 transition-transform'>
                    🎁
                  </span>
                  <span>Новорічні товари</span>
                </motion.a>
              </li>
              <li>
                <motion.a
                  href='/Contact'
                  className='hover:text-green-300 transition-all duration-300 flex items-center group'
                  whileHover={{ x: 5 }}
                >
                  <span className='mr-2 group-hover:scale-110 transition-transform'>
                    📞
                  </span>
                  <span>Святкові контакти</span>
                </motion.a>
              </li>
              <li>
                <motion.a
                  href='/terms'
                  className='hover:text-amber-300 transition-all duration-300 flex items-center group'
                  whileHover={{ x: 5 }}
                >
                  <span className='mr-2 group-hover:scale-110 transition-transform'>
                    📄
                  </span>
                  <span>Умови користування</span>
                </motion.a>
              </li>
              <li>
                <motion.a
                  href='/privacy'
                  className='hover:text-blue-300 transition-all duration-300 flex items-center group'
                  whileHover={{ x: 5 }}
                >
                  <span className='mr-2 group-hover:scale-110 transition-transform'>
                    🔒
                  </span>
                  <span>Політика конфіденційності</span>
                </motion.a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Новогодний разделитель */}
      <div className='relative mt-12 pt-6 border-t border-amber-500/30'>
        <div className='text-center text-sm text-amber-200'>
          <p className='mb-2'>
            Зима {currentYear} | З Новим Роком та Різдвом Христовим! 🎅✨
          </p>
        </div>
      </div>

      <div className='text-center text-xs text-amber-300/70 mt-6'>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          &copy; {currentYear} RoyalBriner. Всі права захищені.
          <span className='block mt-1 text-amber-400/50'>
            Зроблено з ❤️ для ваших новорічних свят
          </span>
        </motion.div>
      </div>
    </footer>
  )
}
