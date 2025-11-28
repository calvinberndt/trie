import React, { useState, useMemo, useRef } from 'react';

import { 

  Search, 

  ShoppingCart, 

  Tag, 

  Zap, 

  Info, 

  Package, 

  Smartphone, 

  Tv, 

  Camera, 

  Watch, 

  Coffee, 

  Shirt,

  Play,

  RotateCcw,

  Terminal,

  Cpu,

  Hash

} from 'lucide-react';



// --- Types ---



type Product = {

  id: number;

  name: string;

  category: string;

  price: string;

  icon: React.ReactNode;

};



type LayoutNode = {

  data: TrieNode<Product>;

  x: number;

  y: number;

  char: string;

};



type LayoutEdge = {

  source: TrieNode<Product>;

  target: TrieNode<Product>;

  x1: number;

  y1: number;

  x2: number;

  y2: number;

};



// --- Trie Implementation ---



class TrieNode<T> {

  children: Record<string, TrieNode<T>>;

  isEndOfWord: boolean;

  payload: T | null;

  char: string;



  constructor(char: string) {

    this.children = {};

    this.isEndOfWord = false;

    this.payload = null;

    this.char = char;

  }

}



class Trie<T> {

  root: TrieNode<T>;



  constructor() {

    this.root = new TrieNode<T>('');

  }



  insert(word: string, data: T) {

    let current = this.root;

    const lowerWord = word.toLowerCase();



    for (const char of lowerWord) {

      if (!current.children[char]) {

        current.children[char] = new TrieNode<T>(char);

      }

      current = current.children[char];

    }



    current.isEndOfWord = true;

    current.payload = data;

  }



  getPath(prefix: string): TrieNode<T>[] {

    if (!prefix) return [this.root];



    let current = this.root;

    const path: TrieNode<T>[] = [current];

    const lowerPrefix = prefix.toLowerCase();



    for (const char of lowerPrefix) {

      if (!current.children[char]) break;

      current = current.children[char];

      path.push(current);

    }



    return path;

  }



  getSuggestions(prefix: string): T[] {

    if (!prefix) return [];



    let current = this.root;

    const lowerPrefix = prefix.toLowerCase();



    for (const char of lowerPrefix) {

      if (!current.children[char]) return [];

      current = current.children[char];

    }



    const results: T[] = [];

    const dfs = (node: TrieNode<T>) => {

      if (node.isEndOfWord && node.payload) {

        results.push(node.payload);

      }

      Object.values(node.children).forEach(child => dfs(child));

    };



    dfs(current);

    return results;

  }

}



// --- Sample Data ---



const PRODUCT_DB: Product[] = [

  { id: 1, name: "Samsung TV", category: "ELEC", price: "499 CR", icon: <Tv size={14} /> },

  { id: 2, name: "Samsung Phone", category: "MOB", price: "799 CR", icon: <Smartphone size={14} /> },

  { id: 3, name: "Sony Headphones", category: "AUDIO", price: "150 CR", icon: <Zap size={14} /> },

  { id: 5, name: "Soap", category: "HOME", price: "005 CR", icon: <Package size={14} /> },

  { id: 7, name: "Apple iPhone", category: "MOB", price: "999 CR", icon: <Smartphone size={14} /> },

  { id: 8, name: "Apple Watch", category: "WEAR", price: "399 CR", icon: <Watch size={14} /> },

  { id: 9, name: "Adidas Shoes", category: "GEAR", price: "085 CR", icon: <Shirt size={14} /> },

  { id: 10, name: "Canon Camera", category: "PHOTO", price: "600 CR", icon: <Camera size={14} /> },

  { id: 11, name: "Coffee Maker", category: "HOME", price: "045 CR", icon: <Coffee size={14} /> },

  { id: 12, name: "Nike Shorts", category: "GEAR", price: "035 CR", icon: <Shirt size={14} /> },

];



// --- Visualization Constants ---



const CANVAS_WIDTH = 1000;

const LEVEL_HEIGHT = 70;

const CANVAS_HEIGHT = 500;



// --- Sub-Components ---



const CalloutCard = ({ icon: Icon, colorClass, title, children }: { icon: any, colorClass: string, title: string, children: React.ReactNode }) => {

  // Map color classes to neon colors

  const borderColor = colorClass === 'green' ? 'border-green-500' : colorClass === 'amber' ? 'border-amber-500' : 'border-pink-500';

  const textColor = colorClass === 'green' ? 'text-green-400' : colorClass === 'amber' ? 'text-amber-400' : 'text-pink-400';

  const iconBg = colorClass === 'green' ? 'bg-green-900/30' : colorClass === 'amber' ? 'bg-amber-900/30' : 'bg-pink-900/30';

  const iconBorder = colorClass === 'green' ? 'border-green-500/30' : colorClass === 'amber' ? 'border-amber-500/30' : 'border-pink-500/30';



  return (

    <div className={`bg-black p-4 border-2 ${borderColor} shadow-[0_0_10px_rgba(0,0,0,0.5)] relative overflow-hidden group`}>

      {/* Corner accents */}

      <div className={`absolute top-0 left-0 w-2 h-2 ${borderColor} border-t-2 border-l-2`} />

      <div className={`absolute top-0 right-0 w-2 h-2 ${borderColor} border-t-2 border-r-2`} />

      <div className={`absolute bottom-0 left-0 w-2 h-2 ${borderColor} border-b-2 border-l-2`} />

      <div className={`absolute bottom-0 right-0 w-2 h-2 ${borderColor} border-b-2 border-r-2`} />

      

      <div className={`w-8 h-8 ${iconBg} ${textColor} flex items-center justify-center mb-3 border ${iconBorder}`}>

        <Icon size={18} />

      </div>

      <h3 className={`font-bold ${textColor} text-sm mb-1 uppercase tracking-wider`}>{title}</h3>

      <div className="text-xs text-zinc-400 leading-relaxed font-mono">

        {children}

      </div>

    </div>

  );

};



const SuggestionItem = ({ item, matchLength }: { item: Product, matchLength: number }) => (

  <li className="group flex items-center justify-between px-4 py-3 hover:bg-green-900/20 cursor-pointer transition-colors border-b border-green-900/30 last:border-0 border-l-2 border-l-transparent hover:border-l-green-500">

    <div className="flex items-center gap-3">

      <div className="p-2 bg-zinc-900 border border-zinc-700 text-green-500 group-hover:text-green-400 group-hover:border-green-500/50 transition-colors">

        {item.icon}

      </div>

      <div>

        <div className="text-zinc-300 font-mono text-sm uppercase">

          <span className="font-bold text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">{item.name.substring(0, matchLength)}</span>

          {item.name.substring(matchLength)}

        </div>

        <div className="text-[10px] text-zinc-500 font-mono tracking-widest">{item.category}</div>

      </div>

    </div>

    <div className="text-xs font-bold text-amber-500 font-mono">{item.price}</div>

  </li>

);



// --- Visualization Component ---



const TrieVisualizer = ({ trie, activePrefix }: { trie: Trie<Product>, activePrefix: string }) => {

  const containerRef = useRef<HTMLDivElement>(null);

  

  const generateLayout = (root: TrieNode<Product>) => {

    const nodes: LayoutNode[] = [];

    const edges: LayoutEdge[] = [];



    const traverse = (node: TrieNode<Product>, depth: number, xStart: number, availableWidth: number): number => {

      const keys = Object.keys(node.children).sort();

      const widthPerChild = availableWidth / (keys.length || 1);

      

      let childXPositions: number[] = [];

      

      keys.forEach((key, index) => {

        const child = node.children[key];

        const childX = traverse(child, depth + 1, xStart + (index * widthPerChild), widthPerChild);

        childXPositions.push(childX);

        

        edges.push({

          source: node,

          target: child,

          x1: 0, y1: 0, 

          x2: childX, y2: (depth + 1) * LEVEL_HEIGHT

        });

      });



      const x = childXPositions.length > 0 

        ? (childXPositions[0] + childXPositions[childXPositions.length - 1]) / 2 

        : xStart + availableWidth / 2;

        

      const y = depth * LEVEL_HEIGHT;



      nodes.push({

        data: node,

        x,

        y,

        char: node.char || "ROOT"

      });

      

      edges.forEach(edge => {

        if (edge.source === node) {

          edge.x1 = x;

          edge.y1 = y;

        }

      });



      return x;

    };



    traverse(root, 0, 0, CANVAS_WIDTH); 

    return { nodes, edges };

  };



  const { nodes, edges } = useMemo(() => generateLayout(trie.root), [trie]);

  

  const activePath = useMemo(() => {

    const path = trie.getPath(activePrefix);

    return new Set(path);

  }, [activePrefix, trie]);



  return (

    <div className="w-full h-[500px] overflow-hidden bg-black relative border-2 border-zinc-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" ref={containerRef}>

      {/* Grid Background */}

      <div className="absolute inset-0 opacity-20 pointer-events-none" 

           style={{

             backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)',

             backgroundSize: '20px 20px'

           }}

      ></div>

      

      {/* Scanline Overlay */}

      <div className="absolute inset-0 pointer-events-none z-20"

           style={{

             background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',

             backgroundSize: '100% 2px, 3px 100%'

           }}

      ></div>



      {/* Legend and Buffer - Compact design in top-right corner */}
      <div className="absolute top-2 right-2 z-30 flex flex-col gap-1.5 max-w-[180px]">

         <div className="bg-black/95 border border-green-500/30 p-1.5 text-[10px] text-green-500 font-mono shadow-[0_0_10px_rgba(34,197,94,0.2)] backdrop-blur-sm">

          <div className="flex items-center gap-1.5 mb-0.5">

            <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_6px_#22c55e] flex-shrink-0"></div>

            <span className="tracking-widest text-[9px]">ACTIVE_SIGNAL</span>

          </div>

          <div className="flex items-center gap-1.5 opacity-50">

            <div className="w-1.5 h-1.5 bg-zinc-600 flex-shrink-0"></div>

            <span className="tracking-widest text-[9px]">DORMANT_NODE</span>

          </div>

        </div>

        <div className="bg-black/95 border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-400 backdrop-blur-sm">

           BUFFER: <span className="text-green-400">"{activePrefix || 'NULL'}"</span>

        </div>

      </div>

      

      {/* SVG - Full viewBox to show all nodes */}
      <svg className="w-full h-full relative z-10" viewBox={`0 -20 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} preserveAspectRatio="xMidYMin meet">

        <defs>

          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">

            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>

            <feMerge>

              <feMergeNode in="coloredBlur"/>

              <feMergeNode in="SourceGraphic"/>

            </feMerge>

          </filter>

        </defs>



        {/* Edges - Render first so they appear behind nodes */}
        <g className="edges">
          {edges.map((edge, i) => {

            const isActive = activePath.has(edge.source) && activePath.has(edge.target);

            return (

              <line

                key={`edge-${i}`}

                x1={edge.x1} y1={edge.y1 + 15}

                x2={edge.x2} y2={edge.y2 - 15}

                stroke={isActive ? "#22c55e" : "#27272a"} 

                strokeWidth={isActive ? 2 : 1}

                className="transition-all duration-100"

                style={{ filter: isActive ? "url(#glow-green)" : "none" }}

              />

            );

          })}
        </g>



        {/* Nodes - Render second so they appear above edges */}
        <g className="nodes">
          {nodes.map((node, i) => {

            const isActive = activePath.has(node.data);

            const isEnd = node.data.isEndOfWord;

            const size = isEnd ? 28 : 24;

            const offset = size / 2;

            

            return (

              <g 

                key={`node-${i}`} 

                className="transition-all duration-300" 

                transform={`translate(${node.x}, ${node.y})`}

              >

                {/* Connector trace */}

                {isActive && <line x1={0} y1={-15} x2={0} y2={-offset} stroke="#22c55e" strokeWidth="2" />}

                

                {/* Chip Body - Render first */}

                <rect

                  x={-offset}

                  y={-offset}

                  width={size}

                  height={size}

                  className={`transition-all duration-300 ${isActive ? 'fill-green-950 stroke-green-500' : 'fill-zinc-950 stroke-zinc-800'}`}

                  strokeWidth={isActive ? 2 : 1}

                  style={{ filter: isActive ? "url(#glow-green)" : "none" }}

                />

                

                {/* Result Indicator - Tiny corner led - Render before text */}
                {isEnd && (

                  <rect 

                    x={offset - 6} 

                    y={-offset + 2} 

                    width={4} 

                    height={4} 

                    className={isActive ? "fill-amber-500 animate-pulse" : "fill-zinc-800"} 

                  />

                )}

                

                {/* Text Label - Render last so it's always visible on top */}
                <text

                  dy=".3em"

                  textAnchor="middle"

                  className={`text-[10px] font-mono font-bold select-none pointer-events-none ${isActive ? 'fill-green-400' : 'fill-zinc-600'}`}

                  style={{ paintOrder: 'stroke fill', stroke: isActive ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)', strokeWidth: '0.5px' }}

                >

                  {node.char.toUpperCase()}

                </text>

              </g>

            );

          })}
        </g>

      </svg>

    </div>

  );

};



// --- Main App Component ---



export default function TrieEducationApp() {

  const [searchTerm, setSearchTerm] = useState("App");

  const [stepIndex, setStepIndex] = useState<number | null>(null);



  const [trie] = useState(() => {

    const t = new Trie<Product>();

    PRODUCT_DB.forEach(p => t.insert(p.name, p));

    return t;

  });



  const effectiveSearchTerm = stepIndex === null 

    ? searchTerm 

    : searchTerm.slice(0, Math.max(0, stepIndex));



  const suggestions = useMemo<Product[]>(

    () => trie.getSuggestions(searchTerm), 

    [searchTerm, trie]

  );



  const handleStep = () => {

    setStepIndex(prev => {

      if (prev === null || prev >= searchTerm.length) return 0;

      return prev + 1;

    });

  };



  const resetStep = () => setStepIndex(null);



  return (

    <div className="min-h-screen bg-zinc-950 font-mono text-zinc-300 p-4 md:p-8 selection:bg-green-500 selection:text-black">

      {/* Background CRT Scanlines (Global) */}

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_3px)]"></div>



      {/* Header */}

      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b-2 border-zinc-800 pb-4">

        <div>

          <h1 className="text-3xl font-black text-green-500 tracking-tighter flex items-center gap-3 uppercase">

            <div className="bg-green-900/20 border border-green-500 p-2 text-green-500">

              <Terminal size={24} />

            </div>

            Search_Protocol<span className="text-white">.EXE</span>

          </h1>

          <p className="text-zinc-500 mt-2 text-xs uppercase tracking-widest">

            // Prefix Tree Visualization Module V1.0

          </p>

        </div>

        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">

          <div className="px-4 py-2 bg-black border border-green-500/50 flex items-center gap-3 shadow-[0_0_15px_rgba(34,197,94,0.1)]">

            <span className="w-2 h-2 bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>

            System_Online

          </div>

        </div>

      </header>



      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        

        {/* Left Column: Interactive Visualization */}

        <div className="lg:col-span-7 flex flex-col gap-6">

          <div className="bg-zinc-900 p-1 border-2 border-zinc-800 relative">

            {/* Corner decorations */}

            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-green-500 z-10"></div>

            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-green-500 z-10"></div>



            <div className="p-3 bg-black border-b border-zinc-800 flex justify-between items-center">

              <div className="flex items-center gap-4">

                <h2 className="font-bold text-green-500 text-sm flex items-center gap-2 uppercase tracking-wider">

                  <Hash size={14} />

                  Memory_Structure

                </h2>

                

                {/* Step Through Controls */}

                <div className="flex items-center gap-1">

                   <button 

                    onClick={handleStep}

                    className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-green-900 hover:text-green-400 border border-zinc-700 hover:border-green-500 text-zinc-400 text-[10px] font-bold uppercase tracking-wider transition-all"

                   >

                     <Play size={10} className={stepIndex !== null ? "fill-current" : ""} />

                     {stepIndex === null ? "Debug_Mode" : "Next_Op"}

                   </button>

                   {stepIndex !== null && (

                     <button 

                      onClick={resetStep}

                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-red-500/50 transition-colors"

                      title="Reset View"

                     >

                       <RotateCcw size={12} />

                     </button>

                   )}

                </div>

              </div>



              <div className="text-[10px] text-green-500 border border-green-900 bg-green-900/10 px-2 py-1 uppercase">

                Complexity: O(L)

              </div>

            </div>

            

            {/* The SVG Visualization */}

            <div className="p-4 bg-zinc-950">

               <TrieVisualizer trie={trie} activePrefix={effectiveSearchTerm} />

            </div>

          </div>



          {/* Educational Callouts - Using Neon Accents */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <CalloutCard icon={Cpu} colorClass="green" title="Traversal">

               Input stream <strong>"{searchTerm}"</strong> triggers node-by-node descent through the logic gate structure.

            </CalloutCard>

            

            <CalloutCard icon={Search} colorClass="amber" title="Prediction">

               End-of-line signals trigger data retrieval from all connected child nodes.

            </CalloutCard>

            

            <CalloutCard icon={Package} colorClass="pink" title="Compression">

               Shared prefixes eliminate redundant memory allocation. "Sam" exists once.

            </CalloutCard>

          </div>

        </div>



        {/* Right Column: The "Real" App Experience */}

        <div className="lg:col-span-5 flex flex-col gap-6">

          

          {/* E-commerce Mockup - Cyberpunk Style */}

          <div className="bg-black border-2 border-zinc-800 overflow-hidden flex flex-col h-full max-h-[600px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">

            {/* Fake Terminal Header */}

            <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800 flex items-center gap-2">

              <div className="flex gap-1.5 opacity-50">

                <div className="w-2 h-2 bg-zinc-600"></div>

                <div className="w-2 h-2 bg-zinc-600"></div>

                <div className="w-2 h-2 bg-zinc-600"></div>

              </div>

              <div className="flex-1 text-center">

                <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">

                  Term_Session_ID: 8849

                </div>

              </div>

            </div>



            {/* App Header */}

            <div className="p-6 bg-black border-b border-green-900/30 relative">

              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

              

              <div className="flex justify-between items-center mb-8">

                <h2 className="font-bold text-xl tracking-tighter text-white uppercase flex items-center gap-2">

                  <span className="text-green-500">{'>'}</span> SHOP_NET

                </h2>

                <div className="relative group cursor-pointer">

                  <ShoppingCart size={20} className="text-zinc-400 group-hover:text-green-400 transition-colors" />

                  <span className="absolute -top-2 -right-2 bg-green-600 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center border border-green-400">2</span>

                </div>

              </div>



              {/* The Search Interaction */}

              <div className="relative group z-10">

                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">

                  <span className="text-green-500 font-bold animate-pulse">{'>'}</span>

                </div>

                <input

                  type="text"

                  className="block w-full pl-8 pr-3 py-3 bg-black border-2 border-zinc-700 text-green-400 placeholder-zinc-700 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all font-mono uppercase tracking-wider relative z-10"

                  placeholder="QUERY_DATABASE..."

                  value={searchTerm}

                  onChange={(e) => {

                    setSearchTerm(e.target.value);

                    setStepIndex(null); 

                  }}

                  autoFocus

                />

                

                {/* Blinking cursor effect (visual only) */}

                <div className="absolute right-3 top-4 text-[10px] font-mono text-zinc-600 z-20 pointer-events-none">

                   LEN:{searchTerm.length}

                </div>

              </div>

            </div>



            {/* Search Results - Moved here from dropdown */}
            <div className="bg-zinc-950 flex-1 flex flex-col overflow-hidden relative">
              {searchTerm ? (
                <>
                  {/* Results Header */}
                  <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-green-500 text-xs uppercase tracking-widest">
                      Matches_Found
                    </h3>
                    <span className="text-green-400 bg-green-900/40 px-2 py-0.5 text-[10px] font-bold border border-green-500/30">
                      {suggestions.length}
                    </span>
                  </div>

                  {/* Results List */}
                  {suggestions.length > 0 ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <ul>
                        {suggestions.map((item) => (
                          <SuggestionItem 
                            key={item.id} 
                            item={item} 
                            matchLength={searchTerm.length} 
                          />
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-red-500 text-xs font-mono uppercase mb-2">[ERROR] No_Data_Found</div>
                        <div className="text-zinc-600 text-[10px] font-mono">Query returned zero results</div>
                      </div>
                    </div>
                  )}

                  {/* Results Summary Footer */}
                  <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-400">Query_Length:</span>
                      <span className="text-amber-400 font-bold">{searchTerm.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-400">Trie_Depth:</span>
                      <span className="text-pink-400 font-bold">{trie.getPath(searchTerm).length}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-zinc-600 text-xs font-mono uppercase mb-2">[STANDBY]</div>
                    <div className="text-zinc-700 text-[10px] font-mono">Enter search query to begin</div>
                  </div>
                </div>
              )}
            </div>

            

          </div>



          <div className="bg-black border border-pink-500/30 p-5 shadow-[0_0_15px_rgba(236,72,153,0.1)] relative overflow-hidden group">

             {/* Scanline for this box */}

             <div className="absolute top-0 left-0 w-full h-[1px] bg-pink-500/50 animate-[scan_3s_linear_infinite]"></div>

             

             <div className="flex items-start gap-4 relative z-10">

               <div className="text-pink-500 mt-1 animate-pulse">

                 <Info size={18} />

               </div>

               <div>

                 <h4 className="font-bold text-pink-500 mb-1 text-xs uppercase tracking-widest">System_Insight</h4>

                 <p className="text-zinc-400 text-xs font-mono leading-relaxed">

                   Every character entry triggers an O(L) operation. Lookups remain constant time regardless of dataset expansion.

                 </p>

               </div>

             </div>

          </div>

        </div>



      </main>

      

      {/* Custom Scrollbar Styles injected for this view */}

      <style>{`

        .custom-scrollbar::-webkit-scrollbar {

          width: 8px;

        }

        .custom-scrollbar::-webkit-scrollbar-track {

          background: #000;

        }

        .custom-scrollbar::-webkit-scrollbar-thumb {

          background: #1f2937;

          border: 1px solid #22c55e;

        }

        @keyframes scan {

          0% { top: 0%; opacity: 0; }

          10% { opacity: 1; }

          90% { opacity: 1; }

          100% { top: 100%; opacity: 0; }

        }

      `}</style>

    </div>

  );

}
