
import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { TriviaItem, UserGuess } from '../types';

interface CardProps {
  item: TriviaItem;
  onSwipe: (guess: UserGuess) => void;
  index: number;
}

const Card: React.FC<CardProps> = ({ item, onSwipe, index }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const higherOpacity = useTransform(x, [10, 100], [0, 1]);
  const lowerOpacity = useTransform(x, [-10, -100], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('HIGHER');
    } else if (info.offset.x < -100) {
      onSwipe('LOWER');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: 50 - index }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-sm h-[28rem] bg-white rounded-3xl shadow-2xl border-2 border-slate-100 p-8 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      <motion.div 
        style={{ opacity: higherOpacity }}
        className="absolute inset-0 bg-green-500/10 flex items-center justify-end pr-12 pointer-events-none z-10"
      >
        <span className="text-green-600 font-black text-5xl rotate-12">HIGHER</span>
      </motion.div>
      <motion.div 
        style={{ opacity: lowerOpacity }}
        className="absolute inset-0 bg-red-500/10 flex items-center justify-start pl-12 pointer-events-none z-10"
      >
        <span className="text-red-600 font-black text-5xl -rotate-12">LOWER</span>
      </motion.div>

      <div className="text-center">
        <div className="text-5xl mb-4">{item.emoji}</div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">
          {item.context}
        </p>
        <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">
          {item.name}
        </h2>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-slate-50 rounded-2xl px-6 py-5 border border-slate-200 w-full text-center">
          <p className="text-slate-500 text-xs font-semibold uppercase mb-1">Our Guess</p>
          <p className="text-4xl font-bungee text-indigo-600">
            {item.proposedValue.toLocaleString()}
          </p>
          <p className="text-indigo-400 text-[10px] font-black uppercase mt-1 tracking-widest">{item.unit}</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-500 font-bold text-sm mb-4">
          Is reality <span className="text-red-500">lower</span> or <span className="text-green-500">higher</span>?
        </p>
        <div className="flex justify-between items-center px-4">
          <div className="flex flex-col items-center opacity-40">
            <span className="text-slate-300 text-3xl">←</span>
          </div>
          <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
          <div className="flex flex-col items-center opacity-40">
            <span className="text-slate-300 text-3xl">→</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
