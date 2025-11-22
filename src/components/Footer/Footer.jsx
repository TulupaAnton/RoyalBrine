import { faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function Footer () {
  return (
    <footer className='bg-zinc-900 text-white py-14 '>
      <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12'>
        {/* Про нас */}
        <div>
          <h3 className='text-lg font-bold mb-4 uppercase text-amber-400'>
            Про нас
          </h3>
          <p className='text-gray-400 text-sm leading-relaxed'>
            Ми пропонуємо найкращі товари для вашого комфорту. Якість, швидкість
            доставки та турбота про клієнта — наш головний пріоритет.
          </p>
        </div>

        {/* Контакти */}
        <div>
          <h3 className='text-lg font-bold mb-4 uppercase text-amber-400'>
            Контакти
          </h3>
          <ul className='text-gray-400 text-sm space-y-2'>
            <li>📍 Запоріжжя, Україна</li>
            <li>📞 +38 (099) 352-38-68</li>
            <li>📧 royalbriner@gmail.com</li>
            <li>🕒 Пн-Нд: 8:00 – 22:00</li>
          </ul>
        </div>

        {/* Соцмережі + Посилання */}
        <div>
          <h3 className='text-lg font-bold mb-4 uppercase text-amber-400'>
            Ми в соцмережах
          </h3>
          <ul className='text-gray-400 text-sm space-y-3'>
            <li>
              <a
                href='https://www.instagram.com/royal_brine/'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-amber-400 flex items-center space-x-2 transition'
              >
                <FontAwesomeIcon icon={faInstagram} className='w-5 h-5' />
                <span>Instagram</span>
              </a>
            </li>
            <li>
              <a
                href='https://www.tiktok.com/@royal.brine'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-amber-400 flex items-center space-x-2 transition'
              >
                <FontAwesomeIcon icon={faTiktok} className='w-5 h-5' />
                <span>TikTok</span>
              </a>
            </li>
          </ul>

          <h3 className='text-lg font-bold mt-8 mb-4 uppercase text-amber-400'>
            Посилання
          </h3>
          <ul className='text-gray-400 text-sm space-y-2'>
            <li>
              <a href='/' className='hover:text-amber-400 transition'>
                Головна
              </a>
            </li>
            <li>
              <a
                href='/catalog/semi-finished'
                className='hover:text-amber-400 transition'
              >
                Товари
              </a>
            </li>
            <li>
              <a href='/Contact' className='hover:text-amber-400 transition'>
                Контакти
              </a>
            </li>
            <li>
              <a href='/terms' className='hover:text-amber-400 transition'>
                Умови користування
              </a>
            </li>
            <li>
              <a href='/privacy' className='hover:text-amber-400 transition'>
                Політика конфіденційності
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className='border-t border-gray-800 mt-12 pt-6 text-center text-xs text-gray-500'>
        &copy; {new Date().getFullYear()} RoyalBriner. Всі права захищені.
      </div>
    </footer>
  )
}
