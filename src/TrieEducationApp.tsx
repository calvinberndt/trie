import { useState, useMemo, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

// --- Types ---
type TrieNodeData = {
  id: number;
  word: string;
};

type LayoutNode = {
  data: TrieNode<TrieNodeData>;
  x: number;
  y: number;
  char: string;
};

type LayoutEdge = {
  source: TrieNode<TrieNodeData>;
  target: TrieNode<TrieNodeData>;
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

// --- Sample Words ---
const WORDS = [
  "apple", "application", "apply", "app",
  "banana", "band", "ban",
  "cat", "car", "card", "cart",
  "dog", "done", "door",
  "tree", "trie", "try", "trip"
];

// --- Visualization Component ---
const TrieVisualizer = ({
  trie,
  activePrefix,
  containerWidth,
  containerHeight
}: {
  trie: Trie<TrieNodeData>;
  activePrefix: string;
  containerWidth: number;
  containerHeight: number;
}) => {
  const LEVEL_HEIGHT = 80;
  const NODE_SIZE = 36;

  const generateLayout = (root: TrieNode<TrieNodeData>) => {
    const nodes: LayoutNode[] = [];
    const edges: LayoutEdge[] = [];

    const traverse = (node: TrieNode<TrieNodeData>, depth: number, xStart: number, availableWidth: number): number => {
      const keys = Object.keys(node.children).sort();
      const widthPerChild = availableWidth / (keys.length || 1);

      const childXPositions: number[] = [];

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

    traverse(root, 0, 0, containerWidth);
    return { nodes, edges };
  };

  const { nodes, edges } = useMemo(() => generateLayout(trie.root), [trie, containerWidth]);

  const activePath = useMemo(() => {
    const path = trie.getPath(activePrefix);
    return new Set(path);
  }, [activePrefix, trie]);

  // Calculate the bounds of the tree
  const maxY = useMemo(() => {
    return Math.max(...nodes.map(n => n.y)) + LEVEL_HEIGHT;
  }, [nodes]);

  return (
    <svg
      className="w-full h-full"
      viewBox={`0 -30 ${containerWidth} ${Math.max(containerHeight, maxY + 50)}`}
      preserveAspectRatio="xMidYMin meet"
    >
      <defs>
        <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      <g className="edges">
        {edges.map((edge, i) => {
          const isActive = activePath.has(edge.source) && activePath.has(edge.target);
          return (
            <line
              key={`edge-${i}`}
              x1={edge.x1} y1={edge.y1 + NODE_SIZE/2}
              x2={edge.x2} y2={edge.y2 - NODE_SIZE/2}
              stroke={isActive ? "#22c55e" : "#3f3f46"}
              strokeWidth={isActive ? 3 : 2}
              className="transition-all duration-150"
              style={{ filter: isActive ? "url(#glow-green)" : "none" }}
            />
          );
        })}
      </g>

      {/* Nodes */}
      <g className="nodes">
        {nodes.map((node, i) => {
          const isActive = activePath.has(node.data);
          const isEnd = node.data.isEndOfWord;
          const size = NODE_SIZE;
          const offset = size / 2;

          return (
            <g
              key={`node-${i}`}
              className="transition-all duration-200"
              transform={`translate(${node.x}, ${node.y})`}
            >
              {/* Node circle/square */}
              <rect
                x={-offset}
                y={-offset}
                width={size}
                height={size}
                rx={isEnd ? 0 : 4}
                className={`transition-all duration-200 ${
                  isActive
                    ? 'fill-green-900 stroke-green-400'
                    : 'fill-zinc-900 stroke-zinc-600'
                }`}
                strokeWidth={isActive ? 3 : 2}
                style={{ filter: isActive ? "url(#glow-green)" : "none" }}
              />

              {/* End-of-word indicator */}
              {isEnd && (
                <circle
                  cx={offset - 6}
                  cy={-offset + 6}
                  r={4}
                  className={isActive ? "fill-amber-400" : "fill-zinc-600"}
                />
              )}

              {/* Character label */}
              <text
                dy=".35em"
                textAnchor="middle"
                className={`text-sm font-bold select-none pointer-events-none ${
                  isActive ? 'fill-green-300' : 'fill-zinc-400'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                {node.char.toUpperCase()}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// --- Main App Component ---
export default function TrieEducationApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  const [trie] = useState(() => {
    const t = new Trie<TrieNodeData>();
    WORDS.forEach((word, i) => t.insert(word, { id: i, word }));
    return t;
  });

  const suggestions = useMemo(() => trie.getSuggestions(searchTerm), [searchTerm, trie]);

  // Track container size for responsive SVG
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: Math.max(containerRef.current.offsetWidth, 800),
          height: Math.max(containerRef.current.offsetHeight, 500)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Search Bar */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 bg-zinc-950 border-2 border-zinc-700 rounded-lg text-xl text-green-400 placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all font-mono"
              placeholder="Type to search the trie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <span className="text-sm text-zinc-500 font-mono">
                  {suggestions.length} match{suggestions.length !== 1 ? 'es' : ''}
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-zinc-500 hover:text-zinc-300 text-lg"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Matched words display */}
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1 bg-green-900/30 border border-green-500/30 text-green-400 text-sm font-mono rounded"
                >
                  <span className="text-green-300 font-bold">{searchTerm.toLowerCase()}</span>
                  {item.word.slice(searchTerm.length)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trie Visualization - Takes remaining space */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4"
        style={{ minHeight: '500px' }}
      >
        <div className="h-full min-h-[500px]">
          <TrieVisualizer
            trie={trie}
            activePrefix={searchTerm}
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
          />
        </div>
      </div>

      {/* Minimal footer with legend */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <div className="flex justify-center gap-8 text-sm text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-900 border-2 border-green-400 rounded"></div>
            <span>Active path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-zinc-900 border-2 border-zinc-600 rounded"></div>
            <span>Inactive node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            <span>End of word</span>
          </div>
        </div>
      </div>
    </div>
  );
}
