import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, X, ChevronRight, Crown, History, UserPlus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Match } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'header' }) => {
  const sizes = {
    sm: 'w-12 h-12 md:w-20 md:h-20',
    md: 'w-32 h-32 md:w-48 md:h-48',
    lg: 'w-64 h-64 md:w-96 md:h-96',
    header: 'w-16 h-16 md:w-24 md:h-24'
  };

  // Using the provided logo URL. Note: postimg.cc links usually need the 'i.' prefix for direct access.
  const logoUrl = "https://i.postimg.cc/hQcTPQZ2/logo.png";

  return (
    <div className={`${sizes[size]} relative group`}>
      <motion.img
        src={logoUrl}
        alt="قاعدة صحاب Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain drop-shadow-[8px_8px_0_rgba(0,0,0,1)]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        onError={(e) => {
          // Fallback if the direct link guess fails
          (e.target as HTMLImageElement).src = "https://picsum.photos/seed/skru/200/200";
        }}
      />
    </div>
  );
};

const readStoredJson = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}" for migration:`, error);
    return null;
  }
};

const getMaxPersistedRoundCount = (storedPlayers: Player[] | null, storedRoundSettings: { isDouble: boolean }[] | null) => Math.max(
  0,
  ...(storedPlayers ?? []).map(player => Array.isArray(player.scores) ? player.scores.length : 0),
  storedRoundSettings?.length ?? 0,
);

const getInitialRoundCount = () => {
  if (typeof window === 'undefined') return 4;
  if (window.localStorage.getItem('skru-num-rounds') !== null) return 4;

  const storedGameStarted = readStoredJson<boolean>('skru-game-started');
  if (!storedGameStarted) return 4;

  const persistedRoundCount = getMaxPersistedRoundCount(
    readStoredJson<Player[]>('skru-players'),
    readStoredJson<{ isDouble: boolean }[]>('skru-round-settings'),
  );

  return persistedRoundCount > 0 ? persistedRoundCount : 4;
};

export default function App() {
  const [players, setPlayers] = useLocalStorage<Player[]>('skru-players', []);
  const [roundSettings, setRoundSettings] = useLocalStorage<{ isDouble: boolean }[]>('skru-round-settings', []);
  const [history, setHistory] = useLocalStorage<{ players: Player[]; roundSettings: { isDouble: boolean }[]; numRounds: number }[]>('skru-history', []);
  const [gameStarted, setGameStarted] = useLocalStorage<boolean>('skru-game-started', false);
  const [numPlayers, setNumPlayers] = useLocalStorage<number>('skru-num-players', 2);
  const [numRounds, setNumRounds] = useLocalStorage<number>('skru-num-rounds', getInitialRoundCount());
  const [isDoubleLastRound, setIsDoubleLastRound] = useLocalStorage<boolean>('skru-double-last', true);
  const [playerNames, setPlayerNames] = useLocalStorage<string[]>('skru-player-names', ['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [matches, setMatches] = useLocalStorage<Match[]>('skru-matches', []);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const getCurrentRoundCount = () => Math.max(numRounds, ...players.map(player => player.scores.length), roundSettings.length);

  const createRoundSettings = (roundCount: number, preserveSettings: { isDouble: boolean }[] = []) => {
    const settings = Array.from({ length: roundCount }).map((_, i) => ({
      isDouble: preserveSettings[i]?.isDouble ?? false
    }));

    if (roundCount > 0 && isDoubleLastRound && preserveSettings.length === 0) {
      settings[roundCount - 1].isDouble = true;
    }

    return settings;
  };

  useEffect(() => {
    if (!gameStarted || players.length === 0) return;

    const canonicalRoundCount = Math.max(1, getMaxPersistedRoundCount(players, roundSettings), numRounds);
    const playersNeedMigration = players.some(player => player.scores.length !== canonicalRoundCount);
    const settingsNeedMigration = roundSettings.length !== canonicalRoundCount;
    const roundCountNeedsMigration = numRounds !== canonicalRoundCount;

    if (!playersNeedMigration && !settingsNeedMigration && !roundCountNeedsMigration) return;

    if (playersNeedMigration) {
      setPlayers(prev => prev.map(player => ({
        ...player,
        scores: [
          ...player.scores,
          ...Array(Math.max(0, canonicalRoundCount - player.scores.length)).fill(0)
        ]
      })));
    }

    if (settingsNeedMigration) {
      setRoundSettings(createRoundSettings(canonicalRoundCount, roundSettings));
    }

    if (roundCountNeedsMigration) {
      setNumRounds(canonicalRoundCount);
    }
  }, [gameStarted, players, roundSettings, numRounds]);

  const saveToHistory = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify({ players, roundSettings, numRounds: getCurrentRoundCount() }))].slice(-50)); // Keep last 50 actions
  };

  const undo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setPlayers(previousState.players);
    setRoundSettings(previousState.roundSettings);
    setNumRounds(previousState.numRounds ?? previousState.players[0]?.scores.length ?? previousState.roundSettings.length ?? numRounds);
    setHistory(prev => prev.slice(0, -1));
  };

  const startGame = () => {
    const roundCount = Math.max(1, numRounds);
    const newPlayers: Player[] = Array.from({ length: numPlayers }).map((_, index) => ({
      id: `p-${index}`,
      name: playerNames[index] || `Player ${index + 1}`,
      scores: Array(roundCount).fill(0)
    }));
    setPlayers(newPlayers);
    setRoundSettings(createRoundSettings(roundCount));
    setNumRounds(roundCount);
    setGameStarted(true);
  };

  const addRound = () => {
    saveToHistory();
    const currentRoundCount = getCurrentRoundCount();
    const newRoundCount = currentRoundCount + 1;
    const previousFinalWasDouble = roundSettings[currentRoundCount - 1]?.isDouble ?? false;

    setPlayers(prev => prev.map(p => ({
      ...p,
      scores: [...p.scores, ...Array(Math.max(0, newRoundCount - p.scores.length)).fill(0)]
    })));

    const settings = createRoundSettings(newRoundCount, roundSettings);
    if (isDoubleLastRound && previousFinalWasDouble) {
      settings[currentRoundCount - 1].isDouble = false;
      settings[newRoundCount - 1].isDouble = true;
    }
    setRoundSettings(settings);

    setNumRounds(newRoundCount);
  };

  const addPlayer = () => {
    saveToHistory();
    const newPlayerCount = players.length + 1;
    
    const roundCount = getCurrentRoundCount();

    setPlayers(prev => {
      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        name: `Player ${newPlayerCount}`,
        scores: Array(roundCount).fill(0)
      };
      return [...prev, newPlayer];
    });
  };

  const deletePlayer = (playerId: string) => {
    if (players.length <= 1) {
      showConfirm(
        "Cannot Remove Player",
        "You must have at least one player to keep the game going.",
        () => {} // No-op for alert
      );
      return;
    }
    showConfirm(
      "Remove Player?",
      "Are you sure you want to remove this player? Existing round scores will stay intact.",
      () => {
        saveToHistory();
        setPlayers(prev => {
          const filtered = prev.filter(p => p.id !== playerId);
          return filtered;
        });
      }
    );
  };

  const toggleRoundSetting = (roundIdx: number, setting: 'isDouble') => {
    saveToHistory();
    setRoundSettings(prev => {
      const newSettings = [...prev];
      newSettings[roundIdx] = {
        ...newSettings[roundIdx],
        [setting]: !newSettings[roundIdx][setting]
      };
      return newSettings;
    });
  };

  const updateScore = (playerIndex: number, roundIndex: number, value: string) => {
    saveToHistory();
    const score = value === '' ? 0 : parseInt(value);
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        scores: [...newPlayers[playerIndex].scores]
      };
      newPlayers[playerIndex].scores[roundIndex] = isNaN(score) ? 0 : score;
      return newPlayers;
    });
  };

  const updatePlayerName = (playerIndex: number, newName: string) => {
    saveToHistory();
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        name: newName
      };
      return newPlayers;
    });
  };

  const backToMenu = () => {
    showConfirm(
      "Back to Menu?",
      "Go back to the main menu? Current game progress will be lost.",
      () => {
        setGameStarted(false);
        setPlayers([]);
      }
    );
  };

  const startNewGame = () => {
    showConfirm(
      "New Match?",
      "Start a new match with the same players? Current scores will be cleared.",
      () => {
        // Save current match to history
        const currentTotals = players.map(p => ({ name: p.name, score: calculateTotal(p.scores) }));
        const winner = currentTotals.reduce((prev, curr) => (curr.score < prev.score ? curr : prev)).name;
        
        setMatches(prev => [{
          id: `match-${Date.now()}`,
          winner,
          totals: currentTotals,
          date: new Date().toISOString()
        }, ...prev]);

        saveToHistory();
        const roundCount = getCurrentRoundCount();
        setPlayers(prev => prev.map(p => ({
          ...p,
          scores: Array(roundCount).fill(0)
        })));
        setRoundSettings(prev => createRoundSettings(roundCount, prev));
        setNumRounds(roundCount);
      }
    );
  };

  const calculateTotal = (scores: number[]) => {
    return scores.reduce((acc, score, idx) => {
      const multiplier = roundSettings[idx]?.isDouble ? 2 : 1;
      return acc + (score * multiplier);
    }, 0);
  };

  const getLeaderId = () => {
    if (players.length === 0) return null;
    const totals = players.map(p => ({ id: p.id, total: calculateTotal(p.scores) }));
    const minScore = Math.min(...totals.map(t => t.total));
    // In Skru, lower score is better (usually)
    return totals.find(t => t.total === minScore)?.id;
  };

  const leaderId = getLeaderId();

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-skru-black flex items-center justify-center p-4 overflow-hidden relative skru-grid">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-skru-purple/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-skru-gold/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-skru-purple p-6 md:p-12 rounded-none border-4 border-skru-black shadow-[8px_8px_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_rgba(0,0,0,1)] max-w-xl w-full relative z-10"
        >
          <div className="flex flex-col items-center mb-6 md:mb-10">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="mb-4 md:mb-6 scale-75 md:scale-100"
            >
              <Logo size="lg" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-skru-gold tracking-tight text-center drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">قاعدة صحاب</h1>
            <p className="text-skru-gold/80 text-xs md:text-sm mt-1 font-black text-center">برعاية ابو الميكا وصحبته الرايقة</p>
            <p className="text-skru-white/60 text-[10px] md:text-xs mt-2 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'system-ui' }}>Digital Scoreboard</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-skru-white/40 uppercase tracking-[0.3em] block text-center">Select Players</label>
              <div className="flex justify-center flex-wrap gap-2 md:gap-3">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumPlayers(n)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-none font-black transition-all flex items-center justify-center border-4 border-skru-black ${
                      numPlayers === n 
                        ? 'bg-skru-gold text-skru-black shadow-[4px_4px_0_rgba(0,0,0,1)] scale-110' 
                        : 'bg-skru-black/20 text-skru-white/40 hover:bg-skru-black/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label htmlFor="round-count" className="text-[10px] font-black text-skru-white/40 uppercase tracking-[0.3em] block text-center">Select Rounds</label>
              <div className="flex items-center gap-3 bg-skru-black/20 border-4 border-skru-black p-3 md:p-4">
                <button
                  type="button"
                  onClick={() => setNumRounds(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 bg-skru-black/40 text-skru-white/60 hover:text-skru-gold border-4 border-skru-black font-black text-2xl leading-none transition-all shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                  aria-label="Decrease rounds"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <input
                    id="round-count"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={numRounds}
                    onChange={(e) => setNumRounds(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-transparent text-center text-4xl md:text-5xl font-black text-skru-gold outline-none tabular-nums drop-shadow-[3px_3px_0_rgba(0,0,0,1)]"
                    aria-describedby="round-count-help"
                  />
                  <p id="round-count-help" className="text-[8px] md:text-[9px] font-black text-skru-white/40 uppercase tracking-[0.25em] mt-1">Rounds can be more than players</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNumRounds(prev => prev + 1)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-skru-gold text-skru-black border-4 border-skru-black font-black text-2xl leading-none transition-all shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                  aria-label="Increase rounds"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-skru-white/40 uppercase tracking-[0.3em] block text-center">Player Names</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-skru-gold/50 font-mono text-[10px] font-black">0{i+1}</div>
                    <input
                      type="text"
                      value={playerNames[i] || ''}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[i] = e.target.value;
                        setPlayerNames(newNames);
                      }}
                      placeholder={`Player ${i + 1}`}
                      className="w-full pl-12 pr-4 py-4 bg-skru-black/20 border-4 border-skru-black rounded-none outline-none transition-all text-skru-white placeholder:text-skru-white/20 focus:bg-skru-black/40"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-skru-black/20 border-4 border-skru-black group hover:bg-skru-black/40 transition-all">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-skru-white uppercase tracking-[0.3em]">Double Last Round</span>
                <span className="text-[8px] font-black text-skru-gold uppercase tracking-widest mt-1">Final round scores are x2</span>
              </div>
              <button
                onClick={() => setIsDoubleLastRound(!isDoubleLastRound)}
                className={`w-14 h-8 rounded-none border-4 border-skru-black relative transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                  isDoubleLastRound ? 'bg-skru-gold' : 'bg-skru-black/60'
                }`}
              >
                <motion.div
                  animate={{ x: isDoubleLastRound ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-4 h-4 bg-skru-black border-2 border-skru-black"
                />
              </button>
            </div>

            <button
              onClick={startGame}
              className="btn-3d w-full"
            >
              INITIALIZE GAME <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-skru-black p-4 md:p-8 relative overflow-x-hidden skru-grid">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-skru-purple/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[50%] h-[50%] bg-skru-gold/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col gap-6 mb-8 md:mb-12">
          <div className="border-4 border-skru-gold/30 p-4 flex items-center relative bg-skru-black/40 shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <div className="hover:rotate-12 transition-transform duration-300 origin-left">
              <Logo size="header" />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl md:text-4xl font-black text-skru-gold tracking-tight drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">قاعدة صحاب</h1>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-skru-gold animate-pulse" />
                <p className="text-[10px] md:text-xs text-skru-white/40 uppercase tracking-[0.3em] font-black">Session Active</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:flex items-center gap-2 md:gap-3">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="bg-skru-black/40 text-skru-white px-3 md:px-6 py-3 rounded-none text-xs md:text-base font-black border-4 border-skru-black hover:bg-skru-black/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgba(0,0,0,1)]"
              title="Undo last action"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-skru-gold" /> UNDO
            </button>
            <button
              onClick={addPlayer}
              className="bg-skru-purple text-skru-white px-3 md:px-6 py-3 rounded-none text-xs md:text-base font-black border-4 border-skru-black hover:bg-skru-action transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgba(0,0,0,1)]"
            >
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-skru-gold" /> ADD PLAYER
            </button>
            <button
              onClick={addRound}
              className="bg-skru-gold text-skru-black px-3 md:px-6 py-3 rounded-none text-xs md:text-base font-black border-4 border-skru-black hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgba(0,0,0,1)]"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" /> ADD ROUND
            </button>
            <button
              onClick={backToMenu}
              className="bg-skru-black/40 text-skru-white px-3 md:px-6 py-3 rounded-none text-xs md:text-base font-black border-4 border-skru-black hover:bg-skru-black/60 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgba(0,0,0,1)]"
              title="Back to Menu"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-skru-red" /> MENU
            </button>
            <button
              onClick={startNewGame}
              className="bg-skru-red text-skru-white px-4 py-3 rounded-none text-xs md:text-base font-black border-4 border-skru-black hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgba(0,0,0,1)]"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" /> NEW MATCH
            </button>
          </div>
        </header>

        {/* Rounds History */}
        <div className="bg-skru-purple rounded-none border-4 border-skru-black shadow-[8px_8px_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-4 md:p-8 border-b-4 border-skru-black flex items-center gap-3 bg-skru-black/20">
            <History className="text-skru-gold w-5 h-5" />
            <h2 className="text-xs md:text-sm font-black text-skru-white uppercase tracking-[0.3em]">Round History</h2>
            <span className="ml-auto text-[9px] md:text-[10px] font-black text-skru-gold uppercase tracking-[0.2em]">{getCurrentRoundCount()} Rounds</span>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
              <thead>
                <tr className="bg-skru-black/40">
                  <th className="p-4 md:p-8 text-[9px] md:text-[10px] font-black text-skru-white/40 uppercase tracking-[0.3em] w-24 md:w-32 sticky left-0 bg-skru-purple z-20 border-r-4 border-skru-black">Index</th>
                  {players.map(p => (
                    <th key={p.id} className={`p-4 md:p-8 border-l-4 border-skru-black relative group/header ${leaderId === p.id ? 'bg-skru-gold/10' : ''}`}>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[8px] md:text-[9px] font-black text-skru-gold uppercase tracking-[0.3em]">Agent</span>
                          {leaderId === p.id && <Crown className="w-4 h-4 md:w-5 md:h-5 text-skru-gold animate-bounce" />}
                        </div>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePlayerName(players.indexOf(p), e.target.value)}
                          className="bg-transparent text-sm md:text-lg font-black text-skru-white outline-none focus:text-skru-gold transition-colors w-full truncate uppercase"
                        />
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl md:text-3xl font-black text-skru-gold tabular-nums drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{calculateTotal(p.scores)}</span>
                          <span className="text-[7px] md:text-[8px] font-black text-skru-white/40 uppercase tracking-widest">Total</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePlayer(p.id)}
                        className="absolute top-1 right-1 md:top-2 md:right-2 opacity-100 md:opacity-0 group-hover/header:opacity-100 p-1 text-skru-red hover:scale-110 transition-all"
                        title="Remove Player"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-skru-black">
                <AnimatePresence initial={false}>
                  {players[0]?.scores.map((_, roundIdx) => (
                    <motion.tr 
                      key={roundIdx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group hover:bg-skru-black/20 transition-colors"
                    >
                      <td className="p-4 md:p-8 font-mono text-[9px] md:text-[10px] font-black text-skru-gold relative sticky left-0 bg-skru-purple z-20 border-r-4 border-skru-black">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap">R_{roundIdx + 1}</span>
                          </div>
                          <div className="flex gap-1 md:gap-2">
                            {roundIdx === players[0].scores.length - 1 ? (
                              <button
                                onClick={() => toggleRoundSetting(roundIdx, 'isDouble')}
                                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-none border-2 border-skru-black text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                                  roundSettings[roundIdx]?.isDouble 
                                    ? 'bg-skru-gold text-skru-black' 
                                    : 'bg-skru-black/40 text-skru-white/40'
                                }`}
                              >
                                x2
                              </button>
                            ) : (
                              roundSettings[roundIdx]?.isDouble && (
                                <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-none border-2 border-skru-black text-[7px] md:text-[8px] font-black uppercase tracking-widest bg-skru-gold text-skru-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                                  x2
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </td>
                      {players.map((p, pIdx) => (
                        <td key={p.id} className="p-3 md:p-6 border-l-4 border-skru-black">
                          <div className="relative group">
                            <span className="absolute -top-3 left-3 px-1 md:px-2 bg-skru-purple text-[7px] md:text-[8px] font-black text-skru-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10 pointer-events-none border-2 border-skru-black">
                              {p.name}
                            </span>
                            <input
                              type="number"
                              inputMode="numeric"
                              value={p.scores[roundIdx] === 0 ? '' : p.scores[roundIdx]}
                              placeholder="0"
                              onChange={(e) => updateScore(pIdx, roundIdx, e.target.value)}
                              className="w-full bg-skru-black/20 p-2 md:p-4 text-lg md:text-2xl font-black text-skru-white outline-none border-4 border-transparent focus:border-skru-gold focus:bg-skru-black/40 rounded-none transition-all tabular-nums placeholder:text-skru-white/10"
                            />
                            {roundSettings[roundIdx]?.isDouble && p.scores[roundIdx] !== 0 && (
                              <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                                <span className="text-[8px] md:text-[10px] font-black text-skru-gold uppercase tracking-widest leading-none">x2</span>
                                <span className="text-xs md:text-sm font-black text-skru-gold drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                                  {p.scores[roundIdx] * 2}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {players[0]?.scores.length === 0 && (
                  <tr>
                    <td colSpan={players.length + 1} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <History className="w-12 h-12 text-skru-gold" />
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-skru-white">Awaiting First Round Data</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
    </table>
  </div>
</div>

{/* Match History */}
{matches.length > 0 && (
  <div className="mt-12 bg-skru-black/40 border-4 border-skru-black p-6 md:p-8">
    <div className="flex items-center gap-3 mb-6">
      <Trophy className="text-skru-gold w-6 h-6" />
      <h2 className="text-sm font-black text-skru-white uppercase tracking-[0.3em]">Session Match History</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match, idx) => (
        <div key={match.id} className="bg-skru-purple/40 border-2 border-skru-black p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-skru-gold text-skru-black px-2 py-1 text-[8px] font-black uppercase tracking-widest">
            Match #{matches.length - idx}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-skru-gold" />
              <span className="text-xs font-black text-skru-gold uppercase truncate">{match.winner} WON</span>
            </div>
            <div className="space-y-1">
              {match.totals.map((t, tIdx) => (
                <div key={tIdx} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-skru-white/60 truncate max-w-[120px]">{t.name}</span>
                  <span className="text-skru-white">{t.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Custom Confirm Modal */}
<AnimatePresence>
  {confirmModal.isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        className="absolute inset-0 bg-skru-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-skru-purple border-4 border-skru-black p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0_rgba(0,0,0,1)]"
      >
        <h3 className="text-xl md:text-2xl font-black text-skru-gold uppercase tracking-tight mb-2">
          {confirmModal.title}
        </h3>
        <p className="text-skru-white/80 text-sm md:text-base font-medium mb-8">
          {confirmModal.message}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            className="flex-1 bg-skru-black/40 text-skru-white py-3 font-black uppercase tracking-widest border-4 border-skru-black hover:bg-skru-black/60 transition-all"
          >
            {confirmModal.onConfirm.toString() === '() => {}' ? 'Got it' : 'Cancel'}
          </button>
          {confirmModal.onConfirm.toString() !== '() => {}' && (
            <button
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
              }}
              className="flex-1 bg-skru-red text-skru-white py-3 font-black uppercase tracking-widest border-4 border-skru-black hover:bg-red-700 transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgba(0,0,0,1)]"
            >
              Confirm
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
</div>
</div>
);
}
