import { useState, useEffect, useCallback, useRef } from "react";

// ─── Utility ────────────────────────────────────────────────────────────────
const cn = (...cls) => cls.filter(Boolean).join(" ");

// ═══════════════════════════════════════════════════════════════════════════
// 1. TIC-TAC-TOE
// ═══════════════════════════════════════════════════════════════════════════
function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const getWinner = (b) => {
    for (let [a,c,d] of lines) if (b[a] && b[a]===b[c] && b[a]===b[d]) return { winner: b[a], line: [a,c,d] };
    return null;
  };
  const result = getWinner(board);
  const isDraw = !result && board.every(Boolean);

  const handleClick = (i) => {
    if (board[i] || result) return;
    const next = board.slice();
    next[i] = xIsNext ? "X" : "O";
    setBoard(next);
    const r = getWinner(next);
    if (r) setScores(s => ({ ...s, [r.winner]: s[r.winner] + 1 }));
    setXIsNext(!xIsNext);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setXIsNext(true); };

  const status = result
    ? `${result.winner} WINS!`
    : isDraw ? "DRAW!" : `Player ${xIsNext ? "X" : "O"}'s Turn`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8 text-sm">
        {["X","O"].map(p => (
          <div key={p} className={cn("px-4 py-2 rounded border-2 font-bold",
            p==="X" ? "border-cyan-400 text-cyan-400" : "border-pink-400 text-pink-400")}>
            P{p==="X"?1:2} ({p}): {scores[p]}
          </div>
        ))}
      </div>
      <div className={cn("text-lg font-bold animate-pulse",
        result ? (result.winner==="X" ? "text-cyan-400" : "text-pink-400") : isDraw ? "text-yellow-400" : "text-white")}>
        {status}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {board.map((v, i) => {
          const isWinCell = result?.line.includes(i);
          return (
            <button key={i} onClick={() => handleClick(i)}
              className={cn(
                "w-20 h-20 text-3xl font-black rounded-lg border-2 transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isWinCell ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.5)]" : "border-slate-600 bg-slate-800/60 hover:border-slate-400",
                v === "X" ? "text-cyan-400" : "text-pink-400"
              )}>
              {v}
            </button>
          );
        })}
      </div>
      <button onClick={reset}
        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded text-sm font-bold transition-all">
        NEW GAME
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. SNAKE
// ═══════════════════════════════════════════════════════════════════════════
const GRID = 20;
const CELL = 18;
const randomFood = (snake) => {
  let pos;
  do { pos = { x: Math.floor(Math.random()*GRID), y: Math.floor(Math.random()*GRID) }; }
  while (snake.some(s => s.x===pos.x && s.y===pos.y));
  return pos;
};

function Snake() {
  const initSnake = [{ x:10, y:10 }];
  const [snake, setSnake] = useState(initSnake);
  const [dir, setDir] = useState({ x:1, y:0 });
  const [food, setFood] = useState({ x:15, y:10 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  useEffect(() => {
    const handler = (e) => {
      const map = {
        ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1},
        ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
        w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0}
      };
      const d = map[e.key];
      if (!d) return;
      if (d.x === -dirRef.current.x && d.y === -dirRef.current.y) return;
      setDir(d);
      e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dirRef.current.x, y: prev[0].y + dirRef.current.y };
        if (head.x<0||head.x>=GRID||head.y<0||head.y>=GRID||prev.some(s=>s.x===head.x&&s.y===head.y)) {
          setRunning(false); setDead(true); return prev;
        }
        const ate = head.x===food.x && head.y===food.y;
        const next = [head, ...prev.slice(0, ate ? undefined : -1)];
        if (ate) { setScore(sc=>sc+10); setFood(randomFood(next)); }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [running, food]);

  const start = () => {
    setSnake(initSnake); setDir({x:1,y:0}); setFood({x:15,y:10});
    setScore(0); setDead(false); setRunning(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 items-center">
        <span className="text-yellow-400 font-bold">SCORE: {score}</span>
        {dead && <span className="text-red-400 font-bold animate-pulse">GAME OVER!</span>}
      </div>
      <div className="relative border-2 border-green-500/50 rounded shadow-[0_0_20px_rgba(34,197,94,0.3)]"
        style={{width: GRID*CELL, height: GRID*CELL, background:"#0a1a0a"}}>
        {/* Grid lines */}
        {Array.from({length:GRID}).map((_,i)=>(
          <div key={`h${i}`} className="absolute w-full border-t border-green-900/30" style={{top:i*CELL}}/>
        ))}
        {Array.from({length:GRID}).map((_,i)=>(
          <div key={`v${i}`} className="absolute h-full border-l border-green-900/30" style={{left:i*CELL}}/>
        ))}
        {/* Snake */}
        {snake.map((s, idx) => (
          <div key={idx} className={cn("absolute rounded-sm transition-all",
            idx===0 ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" : "bg-green-600")}
            style={{left:s.x*CELL+1, top:s.y*CELL+1, width:CELL-2, height:CELL-2}}/>
        ))}
        {/* Food */}
        <div className="absolute rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse"
          style={{left:food.x*CELL+2, top:food.y*CELL+2, width:CELL-4, height:CELL-4}}/>
        {/* Overlay */}
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded">
            <button onClick={start}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-black font-black rounded text-lg transition-all hover:scale-105">
              {dead ? "RETRY" : "START"}
            </button>
            <p className="text-green-400/60 text-xs mt-2">Arrow keys / WASD</p>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        {[{label:"↑",d:{x:0,y:-1}},{label:"↓",d:{x:0,y:1}},{label:"←",d:{x:-1,y:0}},{label:"→",d:{x:1,y:0}}].map(({label,d})=>(
          <button key={label} onClick={()=>setDir(d)}
            className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded font-bold border border-slate-500">
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. MEMORY MATCH
// ═══════════════════════════════════════════════════════════════════════════
const EMOJIS = ["🎮","🕹️","👾","🚀","⭐","💎","🔥","🎯"];
const makeCards = () => {
  const deck = [...EMOJIS, ...EMOJIS].map((e,i)=>({id:i, emoji:e, flipped:false, matched:false}));
  for (let i=deck.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
  return deck;
};

function Memory() {
  const [cards, setCards] = useState(makeCards);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const won = cards.every(c => c.matched);

  const flip = (id) => {
    if (locked || selected.length===2) return;
    const card = cards.find(c=>c.id===id);
    if (!card || card.flipped || card.matched) return;
    const next = cards.map(c => c.id===id ? {...c, flipped:true} : c);
    const newSel = [...selected, id];
    setCards(next); setSelected(newSel);
    if (newSel.length===2) {
      setMoves(m=>m+1); setLocked(true);
      const [a,b] = newSel.map(sid=>next.find(c=>c.id===sid));
      setTimeout(()=>{
        setCards(prev => prev.map(c => {
          if (c.id===a.id||c.id===b.id)
            return a.emoji===b.emoji ? {...c, matched:true} : {...c, flipped:false};
          return c;
        }));
        setSelected([]); setLocked(false);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6">
        <span className="text-purple-400 font-bold">MOVES: {moves}</span>
        {won && <span className="text-yellow-400 font-bold animate-bounce">🏆 YOU WON!</span>}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <button key={card.id} onClick={() => flip(card.id)}
            className={cn(
              "w-16 h-16 text-2xl rounded-lg border-2 transition-all duration-300 font-bold",
              card.matched
                ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.4)] scale-95"
                : card.flipped
                  ? "border-purple-400 bg-purple-900/40 scale-105"
                  : "border-slate-600 bg-slate-800/80 hover:border-purple-400 hover:scale-105 cursor-pointer"
            )}>
            {(card.flipped || card.matched) ? card.emoji : "?"}
          </button>
        ))}
      </div>
      <button onClick={() => { setCards(makeCards()); setSelected([]); setMoves(0); setLocked(false); }}
        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded text-sm font-bold">
        SHUFFLE
      </button>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════════
// 4. WHACK-A-MOLE
// ═══════════════════════════════════════════════════════════════════════════
function WhackAMole() {
  const [active, setActive] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timers = useRef({});

  const showMole = useCallback(() => {
    const idx = Math.floor(Math.random()*9);
    setActive(prev => prev.includes(idx) ? prev : [...prev, idx]);
    const t = setTimeout(() => {
      setActive(prev => { if(prev.includes(idx)){ setMissed(m=>m+1); } return prev.filter(i=>i!==idx); });
    }, 900);
    timers.current[idx] = t;
  }, []);

  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(showMole, 700);
    const tick = setInterval(() => setTimeLeft(t => { if(t<=1){setRunning(false);clearInterval(spawn);clearInterval(tick);} return t-1; }), 1000);
    return () => { clearInterval(spawn); clearInterval(tick); };
  }, [running, showMole]);

  const whack = (idx) => {
    if (!active.includes(idx)) return;
    clearTimeout(timers.current[idx]);
    setActive(prev => prev.filter(i=>i!==idx));
    setScore(s=>s+10);
  };

  const start = () => { setScore(0); setMissed(0); setTimeLeft(30); setActive([]); setRunning(true); };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6">
        <span className="text-orange-400 font-bold">SCORE: {score}</span>
        <span className="text-red-400 font-bold">TIME: {timeLeft}s</span>
        <span className="text-slate-400 font-bold">MISSED: {missed}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({length:9}, (_,i) => (
          <button key={i} onClick={() => whack(i)}
            className={cn(
              "w-20 h-20 rounded-full border-4 text-3xl transition-all duration-150 select-none",
              active.includes(i)
                ? "border-orange-400 bg-amber-800 scale-110 shadow-[0_0_20px_rgba(251,146,60,0.6)] cursor-pointer"
                : "border-amber-900 bg-amber-950 scale-90 cursor-default"
            )}>
            {active.includes(i) ? "🐹" : "🕳️"}
          </button>
        ))}
      </div>
      {!running && (
        <div className="text-center">
          {timeLeft===0 && <p className="text-yellow-400 font-bold mb-2">FINAL SCORE: {score}</p>}
          <button onClick={start}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded text-lg transition-all hover:scale-105">
            {timeLeft===0 ? "PLAY AGAIN" : "START"}
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. NUMBER PUZZLE (2048-lite)
// ═══════════════════════════════════════════════════════════════════════════
const SIZE = 4;
const newGrid = () => {
  const g = Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));
  addTile(g); addTile(g); return g;
};
const addTile = (g) => {
  const empty = [];
  g.forEach((row,r)=>row.forEach((v,c)=>{ if(!v) empty.push([r,c]); }));
  if (!empty.length) return;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  g[r][c] = Math.random()<0.9?2:4;
};
const slideRow = (row) => {
  let arr = row.filter(v=>v), score=0;
  for (let i=0;i<arr.length-1;i++) if(arr[i]===arr[i+1]){ score+=arr[i]*2; arr[i]*=2; arr.splice(i+1,1); }
  while(arr.length<SIZE) arr.push(0);
  return {row:arr, score};
};
const transpose = (g) => g[0].map((_,c)=>g.map(r=>r[c]));
const moveGrid = (grid, dir) => {
  let g = grid.map(r=>[...r]), total=0;
  const slide = (rows) => rows.map(r=>{ const {row,score}=slideRow(r); total+=score; return row; });
  if(dir==="left") g = slide(g);
  else if(dir==="right") g = slide(g.map(r=>r.slice().reverse())).map(r=>r.reverse());
  else if(dir==="up") g = transpose(slide(transpose(g)));
  else if(dir==="down") g = transpose(slide(transpose(g).map(r=>r.slice().reverse())).map(r=>r.reverse()));
  return {grid:g, score:total};
};
const tileColors = {2:"bg-slate-600",4:"bg-slate-500",8:"bg-blue-700",16:"bg-blue-600",32:"bg-cyan-700",64:"bg-cyan-600",128:"bg-teal-600",256:"bg-green-600",512:"bg-yellow-600",1024:"bg-orange-600",2048:"bg-red-600"};

function Puzzle2048() {
  const [grid, setGrid] = useState(newGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const move = useCallback((dir) => {
    setGrid(prev => {
      const {grid:next, score:gained} = moveGrid(prev, dir);
      const changed = JSON.stringify(prev)!==JSON.stringify(next);
      if (changed) { addTile(next); setScore(s=>{ const ns=s+gained; setBest(b=>Math.max(b,ns)); return ns; }); }
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const map = {ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"};
      if (map[e.key]) { move(map[e.key]); e.preventDefault(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  const has2048 = grid.some(r=>r.some(v=>v===2048));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6">
        <div className="text-center"><div className="text-xs text-slate-400">SCORE</div><div className="text-yellow-400 font-bold text-lg">{score}</div></div>
        <div className="text-center"><div className="text-xs text-slate-400">BEST</div><div className="text-cyan-400 font-bold text-lg">{best}</div></div>
      </div>
      {has2048 && <div className="text-yellow-400 font-black text-xl animate-bounce">🎉 2048!</div>}
      <div className="grid grid-cols-4 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-700">
        {grid.flat().map((v, i) => (
          <div key={i}
            className={cn(
              "w-14 h-14 flex items-center justify-center rounded-lg font-black text-sm border transition-all",
              v ? (tileColors[v]||"bg-red-800")+" border-transparent text-white" : "bg-slate-800 border-slate-700 text-transparent"
            )}>
            {v || "·"}
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {["up","left","down","right"].map(d=>(
          <button key={d} onClick={()=>move(d)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded border border-slate-500 text-xs font-bold capitalize">
            {d==="up"?"↑":d==="down"?"↓":d==="left"?"←":"→"}
          </button>
        ))}
      </div>
      <button onClick={()=>{setGrid(newGrid());setScore(0);}}
        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded text-sm font-bold">
        NEW GAME
      </button>
      <p className="text-slate-500 text-xs">Arrow keys to move</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
const GAMES = [
  { id:"ttt",   name:"TIC TAC TOE",  icon:"✕○",     desc:"Classic 2-player strategy", color:"cyan",   component: TicTacToe },
  { id:"snake", name:"SNAKE",        icon:"🐍",      desc:"Eat, grow, survive!",       color:"green",  component: Snake },
  { id:"mem",   name:"MEMORY MATCH", icon:"🧠",      desc:"Flip & find the pairs",     color:"purple", component: Memory },
  { id:"wam",   name:"WHACK-A-MOLE", icon:"🐹",      desc:"Smash those critters!",     color:"orange", component: WhackAMole },
  { id:"2048",  name:"2048",         icon:"🔢",      desc:"Merge tiles to 2048",       color:"yellow", component: Puzzle2048 },
];

const colorMap = {
  cyan:   { border:"border-cyan-500",   text:"text-cyan-400",   glow:"shadow-[0_0_20px_rgba(6,182,212,0.4)]",   bg:"bg-cyan-950/30",   btn:"bg-cyan-600 hover:bg-cyan-500" },
  green:  { border:"border-green-500",  text:"text-green-400",  glow:"shadow-[0_0_20px_rgba(34,197,94,0.4)]",   bg:"bg-green-950/30",  btn:"bg-green-600 hover:bg-green-500" },
  purple: { border:"border-purple-500", text:"text-purple-400", glow:"shadow-[0_0_20px_rgba(168,85,247,0.4)]",  bg:"bg-purple-950/30", btn:"bg-purple-600 hover:bg-purple-500" },
  orange: { border:"border-orange-500", text:"text-orange-400", glow:"shadow-[0_0_20px_rgba(249,115,22,0.4)]",  bg:"bg-orange-950/30", btn:"bg-orange-600 hover:bg-orange-500" },
  yellow: { border:"border-yellow-500", text:"text-yellow-400", glow:"shadow-[0_0_20px_rgba(234,179,8,0.4)]",   bg:"bg-yellow-950/30", btn:"bg-yellow-600 hover:bg-yellow-500 text-black" },
};

export default function App() {
  const [active, setActive] = useState(null);
  const game = GAMES.find(g=>g.id===active);
  const GameComp = game?.component;
  const c = game ? colorMap[game.color] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono"
      style={{backgroundImage:"radial-gradient(circle at 20% 50%, rgba(6,182,212,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.05) 0%, transparent 50%)"}}>

      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-widest uppercase"
          style={{textShadow:"0 0 30px rgba(6,182,212,0.6), 0 0 60px rgba(168,85,247,0.3)"}}>
          <span className="text-cyan-400">ARCADE</span>
          <span className="text-white mx-3">✦</span>
          <span className="text-purple-400">VAULT</span>
        </h1>
        <p className="text-slate-500 text-xs tracking-widest mt-1">5 GAMES · INFINITE FUN</p>
        {/* Scanline effect */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none opacity-5"
          style={{background:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)"}}/>
      </div>

      {/* Game Area */}
      {active ? (
        <div className="max-w-2xl mx-auto px-4 pb-12">
          <button onClick={()=>setActive(null)}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            ← BACK TO MENU
          </button>
          <div className={cn("rounded-2xl border-2 p-6 md:p-8", c.border, c.bg, c.glow)}>
            <div className="text-center mb-6">
              <div className="text-4xl mb-1">{game.icon}</div>
              <h2 className={cn("text-xl font-black tracking-wider", c.text)}>{game.name}</h2>
              <p className="text-slate-500 text-xs mt-1">{game.desc}</p>
            </div>
            <GameComp />
          </div>
        </div>
      ) : (
        /* Menu Grid */
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {GAMES.map((g, idx) => {
              const col = colorMap[g.color];
              return (
                <button key={g.id} onClick={()=>setActive(g.id)}
                  className={cn(
                    "group relative text-left p-6 rounded-2xl border-2 transition-all duration-300",
                    "hover:scale-105 active:scale-100",
                    col.border, col.bg, col.glow,
                    "hover:shadow-lg"
                  )}
                  style={{animationDelay:`${idx*0.1}s`}}>
                  {/* Game number */}
                  <div className="absolute top-3 right-4 text-slate-700 text-xs font-bold">0{idx+1}</div>
                  {/* Icon */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">{g.icon}</div>
                  {/* Info */}
                  <h3 className={cn("font-black text-sm tracking-widest mb-1 uppercase", col.text)}>{g.name}</h3>
                  <p className="text-slate-500 text-xs">{g.desc}</p>
                  {/* Play button */}
                  <div className={cn("mt-4 inline-block px-4 py-1.5 rounded text-xs font-bold text-white transition-all", col.btn)}>
                    PLAY NOW →
                  </div>
                  {/* Corner accent */}
                  <div className={cn("absolute bottom-0 right-0 w-12 h-12 rounded-tl-2xl rounded-br-2xl opacity-20 pointer-events-none", col.btn)}/>
                </button>
              );
            })}
            {/* Decorative empty card */}
            <div className="hidden lg:flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 text-slate-700 text-xs font-bold p-6 flex-col gap-2">
              <span className="text-3xl opacity-30">🎮</span>
              <span className="tracking-widest">MORE SOON</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-10 text-slate-700 text-xs tracking-widest">
    
          </div>
        </div>
      )}
    </div>
  );
}
