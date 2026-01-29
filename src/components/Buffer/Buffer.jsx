// import React, { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import {
//   faPlus,
//   faTrash,
//   faClipboardList,
//   faCheckCircle,
//   faGlassCheers,
//   faPaperPlane
// } from '@fortawesome/free-solid-svg-icons'

// // 1. ДАНІ МЕНЮ (Можна розширювати)
// const BUFFET_MENU = [
//   {
//     id: 1,
//     category: 'Мʼясні бокси',
//     name: 'Бокс "Козацький"',
//     desc: 'Балик, ковбаса домашня, підчеревина',
//     price: '1200',
//     img: '🥩'
//   },
//   {
//     id: 2,
//     category: 'Мʼясні бокси',
//     name: 'Рулети з шинкою',
//     desc: 'З сирною начинкою та зеленню',
//     price: '450',
//     img: '🥓'
//   },
//   {
//     id: 3,
//     category: 'Соління',
//     name: 'Асорті "Хрумке"',
//     desc: 'Огірки, томати, капуста, слива',
//     price: '380',
//     img: '🥒'
//   },
//   {
//     id: 4,
//     category: 'Риба',
//     name: 'Сет "Морський"',
//     desc: 'Лосось, масляна, скумбрія копчена',
//     price: '1400',
//     img: '🐟'
//   },
//   {
//     id: 5,
//     category: 'Закуски',
//     name: 'Канапе з бужениною',
//     desc: '10 шт. на житньому хлібці',
//     price: '500',
//     img: '🥪'
//   }
// ]

// export function BuffetPage () {
//   const [selectedItems, setSelectedItems] = useState([])
//   const [submitted, setSubmitted] = useState(false)

//   // Додати в меню
//   const addToMenu = item => {
//     if (!selectedItems.find(i => i.id === item.id)) {
//       setSelectedItems([...selectedItems, item])
//     }
//   }

//   // Видалити з меню
//   const removeItem = id => {
//     setSelectedItems(selectedItems.filter(item => item.id !== id))
//   }

//   const handleSubmit = e => {
//     e.preventDefault()
//     setSubmitted(true)
//     // Тут логіка відправки (на пошту або в Telegram)
//     console.log('Замовлення:', selectedItems)
//   }

//   return (
//     <div className='min-h-screen bg-[#FDFCFB] pt-32 pb-20'>
//       <div className='container mx-auto px-6'>
//         {/* Заголовок */}
//         <div className='mb-16 text-center lg:text-left'>
//           <h1 className='text-5xl md:text-7xl font-black text-[#2D241E] mb-6 tracking-tighter'>
//             Складіть своє <span className='text-orange-600 italic'>Меню</span>
//           </h1>
//           <p className='text-gray-500 text-lg font-medium'>
//             Обирайте страви, а ми прорахуємо ідеальну кількість під ваших
//             гостей.
//           </p>
//         </div>

//         <div className='flex flex-col lg:flex-row gap-12'>
//           {/* ЛІВА ЧАСТИНА: КАТАЛОГ СТРАВ */}
//           <div className='w-full lg:w-2/3'>
//             <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//               {BUFFET_MENU.map(item => (
//                 <motion.div
//                   key={item.id}
//                   whileHover={{ y: -5 }}
//                   className='bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group transition-all hover:shadow-xl hover:shadow-orange-100/50'
//                 >
//                   <div className='flex items-center gap-5'>
//                     <div className='w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl'>
//                       {item.img}
//                     </div>
//                     <div>
//                       <span className='text-[10px] font-black uppercase text-orange-400 tracking-widest'>
//                         {item.category}
//                       </span>
//                       <h3 className='text-xl font-black text-[#2D241E]'>
//                         {item.name}
//                       </h3>
//                       <p className='text-gray-400 text-xs'>{item.desc}</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => addToMenu(item)}
//                     className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
//                       selectedItems.find(i => i.id === item.id)
//                         ? 'bg-green-500 text-white'
//                         : 'bg-[#2D241E] text-white hover:bg-orange-600'
//                     }`}
//                   >
//                     <FontAwesomeIcon
//                       icon={
//                         selectedItems.find(i => i.id === item.id)
//                           ? faCheckCircle
//                           : faPlus
//                       }
//                     />
//                   </button>
//                 </motion.div>
//               ))}
//             </div>
//           </div>

//           {/* ПРАВА ЧАСТИНА: ВАШ СПИСОК ТА ФОРМА */}
//           <div className='w-full lg:w-1/3'>
//             <div className='bg-[#2D241E] rounded-[2.5rem] p-8 sticky top-32 shadow-2xl text-white'>
//               <h3 className='text-2xl font-black mb-6 flex items-center gap-3'>
//                 <FontAwesomeIcon
//                   icon={faClipboardList}
//                   className='text-orange-500'
//                 />
//                 Обране меню
//               </h3>

//               {/* Список вибраного */}
//               <div className='space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'>
//                 <AnimatePresence mode='popLayout'>
//                   {selectedItems.length === 0 && (
//                     <p className='text-gray-500 italic text-sm py-4 text-center border-2 border-dashed border-white/10 rounded-2xl'>
//                       Ви ще нічого не обрали...
//                     </p>
//                   )}
//                   {selectedItems.map(item => (
//                     <motion.div
//                       key={item.id}
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, scale: 0.9 }}
//                       className='flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5'
//                     >
//                       <span className='text-sm font-bold'>{item.name}</span>
//                       <button
//                         onClick={() => removeItem(item.id)}
//                         className='text-white/30 hover:text-red-400 transition-colors px-2'
//                       >
//                         <FontAwesomeIcon icon={faTrash} className='text-xs' />
//                       </button>
//                     </motion.div>
//                   ))}
//                 </AnimatePresence>
//               </div>

//               {/* Форма замовлення */}
//               <form onSubmit={handleSubmit} className='space-y-4'>
//                 <input
//                   required
//                   type='text'
//                   placeholder="Ваше ім'я"
//                   className='w-full bg-white/10 border-none rounded-xl py-4 px-6 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 transition-all'
//                 />
//                 <input
//                   required
//                   type='tel'
//                   placeholder='Номер телефону'
//                   className='w-full bg-white/10 border-none rounded-xl py-4 px-6 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 transition-all'
//                 />

//                 <button
//                   disabled={selectedItems.length === 0}
//                   className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
//                     selectedItems.length > 0
//                       ? 'bg-orange-600 hover:bg-orange-500 text-white'
//                       : 'bg-gray-700 text-gray-400 cursor-not-allowed'
//                   }`}
//                 >
//                   <FontAwesomeIcon icon={faPaperPlane} />
//                   Надіслати запит
//                 </button>
//               </form>

//               {submitted && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className='mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-center text-sm font-bold'
//                 >
//                   Дякуємо! Ми зателефонуємо вам скоро.
//                 </motion.div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
