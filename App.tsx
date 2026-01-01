
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, TriviaSet, UserGuess, UserResult } from './types';
import { CHALLENGES } from './data';
import Card from './components/Card';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [trivia, setTrivia] = useState<TriviaSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<UserResult[]>([]);
  const [currentChallengeId, setCurrentChallengeId] = useState<number>(1);

  // Determine "Today's" challenge index (1-30)
  const todayIndex = useMemo(() => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 0).getTime();
    const diff = Date.now() - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return (dayOfYear % 30) + 1;
  }, []);

  const loadChallenge = useCallback((id: number) => {
    setGameState(GameState.LOADING);
    // Simulate minor loading for juice
    setTimeout(() => {
      const set = CHALLENGES.find(c => c.id === id) || CHALLENGES[0];
      setTrivia(set);
      setCurrentIndex(0);
      setResults([]);
      setCurrentChallengeId(id);
      setGameState(GameState.PLAYING);
    }, 800);
  }, []);

  useEffect(() => {
    // Check if they finished today
    const lastDoneStr = localStorage.getItem('last_daily_done');
    const todayStr = new Date().toDateString();
    
    if (lastDoneStr === todayStr) {
      setGameState(GameState.START); // Show start screen which will say "Daily done"
    } else {
      loadChallenge(todayIndex);
    }
  }, [todayIndex, loadChallenge]);

  const handleSwipe = useCallback((guess: UserGuess) => {
    if (!trivia) return;
    
    const currentItem = trivia.items[currentIndex];
    const isHigher = currentItem.actualValue > currentItem.proposedValue;
    const isLower = currentItem.actualValue < currentItem.proposedValue;
    
    let correct = false;
    if (guess === 'HIGHER' && isHigher) correct = true;
    if (guess === 'LOWER' && isLower) correct = true;
    
    const newResults = [...results, { item: currentItem, guess, correct }];
    setResults(newResults);
    
    if (currentIndex < trivia.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // If this was today's daily, mark as done
      if (currentChallengeId === todayIndex) {
        localStorage.setItem('last_daily_done', new Date().toDateString());
      }
      setGameState(GameState.SUMMARY);
    }
  }, [trivia, currentIndex, results, currentChallengeId, todayIndex]);

  const score = results.filter(r => r.correct).length;
  const isDaily = currentChallengeId === todayIndex;

  const playNext = () => {
    const nextId = (currentChallengeId % 30) + 1;
    loadChallenge(nextId);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden select-none">
      <header className="py-6 px-4 flex flex-col items-center border-b border-slate-200 bg-white z-20">
        <h1 className="text-3xl font-bungee text-indigo-600 tracking-tighter">Daily Swipe</h1>
        {gameState === GameState.PLAYING && trivia && (
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            {trivia.topic} • {currentIndex + 1} / {trivia.items.length}
          </p>
        )}
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {gameState === GameState.START && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl text-center border-4 border-indigo-50"
            >
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">You're All Caught Up!</h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                You've completed today's daily challenge. Come back tomorrow for a fresh set of stats!
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => loadChallenge(todayIndex)}
                  className="w-full py-4 px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Review Today's Stats
                </button>
                <div className="h-[1px] bg-slate-100 w-full"></div>
                <button 
                  onClick={playNext}
                  className="w-full py-4 px-6 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 flex justify-between items-center"
                >
                  <span>Continue with Next Set</span>
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          )}

          {gameState === GameState.LOADING && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute top-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-indigo-600 font-black tracking-widest text-xs uppercase animate-pulse">Syncing Facts...</p>
            </motion.div>
          )}

          {gameState === GameState.PLAYING && trivia && (
            <div className="relative w-full flex items-center justify-center">
              <AnimatePresence>
                {trivia.items.slice(currentIndex, currentIndex + 2).reverse().map((item, i) => (
                  <Card 
                    key={item.id} 
                    item={item} 
                    onSwipe={handleSwipe} 
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {gameState === GameState.SUMMARY && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md h-full flex flex-col"
            >
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl mb-6 text-center border-b-8 border-indigo-100">
                <div className="text-4xl mb-2">
                  {score === trivia?.items.length ? "👑" : score >= 3 ? "🔥" : "😅"}
                </div>
                <p className="text-indigo-500 font-black uppercase tracking-widest text-[10px] mb-1">
                  {isDaily ? "Daily Complete" : "Set Complete"}
                </p>
                <h2 className="text-6xl font-bungee text-indigo-600 mb-2 leading-none">{score}/{trivia?.items.length}</h2>
                <p className="text-slate-400 text-sm mb-6 font-medium">
                  {score === trivia?.items.length ? "Statistic God! Perfectly guessed." : "Nice intuition! You know your stuff."}
                </p>
                
                <div className="flex gap-3">
                   <button 
                    onClick={playNext}
                    className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
                  >
                    Keep Playing
                  </button>
                </div>
                {isDaily && (
                  <p className="mt-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Come back tomorrow for the next Daily Swipe!
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pb-10 px-2 scroll-smooth">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-slate-50/80 backdrop-blur py-2">Deep Dive Results</p>
                {results.map((res, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className={`bg-white p-5 rounded-2xl border-l-4 shadow-sm ${res.correct ? 'border-green-500' : 'border-red-500'}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{res.item.emoji}</span>
                        <h4 className="font-bold text-slate-800">{res.item.name}</h4>
                      </div>
                      <span className={`text-[9px] px-2 py-1 rounded-full font-black ${res.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {res.correct ? 'CORRECT' : 'WRONG'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-center">
                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Proposed</p>
                        <p className="text-slate-600 font-bold">{res.item.proposedValue.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-indigo-400 font-bold uppercase mb-1">Reality</p>
                        <p className="text-indigo-600 font-black">{res.item.actualValue.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 italic leading-relaxed pl-2 border-l-2 border-slate-100">
                      "{res.item.fact}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Manual buttons for non-swipe interactions */}
      {gameState === GameState.PLAYING && (
        <footer className="py-8 flex justify-center space-x-12 bg-white border-t border-slate-100">
           <button 
             onClick={() => handleSwipe('LOWER')}
             className="group flex flex-col items-center gap-2"
           >
             <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-3xl shadow-sm border border-red-100 group-active:scale-90 transition-all">
               ↓
             </div>
             <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Lower</span>
           </button>
           <button 
             onClick={() => handleSwipe('HIGHER')}
             className="group flex flex-col items-center gap-2"
           >
             <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 text-3xl shadow-sm border border-green-100 group-active:scale-90 transition-all">
               ↑
             </div>
             <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Higher</span>
           </button>
        </footer>
      )}
    </div>
  );
};

export default App;
