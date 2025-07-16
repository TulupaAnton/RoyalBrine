import React from 'react'
import { motion } from 'framer-motion'

export function BackgroundBlobs () {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      {/* Великий “пельмень” зліва */}
      <motion.div
        initial={{ x: -100, y: -50, rotate: 0 }}
        animate={{ x: 0, y: 0, rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className='absolute top-1/4 left-[-80px] w-80 h-80 rounded-full bg-gradient-to-tr from-amber-200 via-yellow-100 to-orange-200 opacity-30 blur-3xl'
      ></motion.div>

      {/* Вареник справа вгорі */}
      <motion.div
        initial={{ x: 100, y: -80, rotate: 0 }}
        animate={{ x: 0, y: 0, rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className='absolute top-0 right-[-100px] w-96 h-96 rounded-[60%] bg-gradient-to-br from-orange-100 via-amber-300 to-yellow-100 opacity-25 blur-2xl'
      ></motion.div>

      {/* Маленький пельмень внизу */}
      <motion.div
        initial={{ y: 100, x: -50, rotate: 0 }}
        animate={{ y: 0, x: 0, rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
        className='absolute bottom-[-60px] left-1/2 w-64 h-64 rounded-full bg-gradient-to-tl from-yellow-200 via-amber-100 to-orange-200 opacity-20 blur-2xl'
      ></motion.div>
    </div>
  )
}
