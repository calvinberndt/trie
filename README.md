# Trie Visualization - Search Protocol

An interactive, cyberpunk-styled visualization of a Trie (Prefix Tree) data structure with real-time search autocomplete.

## Features

- 🎨 **Cyberpunk Terminal Aesthetic** - Neon green accents, scanlines, and retro-futuristic UI
- 🌳 **Interactive Trie Visualization** - Real-time SVG rendering of the trie structure
- 🔍 **Live Search** - Type to see the trie traversal in action
- 🐛 **Debug Mode** - Step through character-by-character traversal
- 📊 **Educational Callouts** - Learn about traversal, prediction, and compression

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Project Structure

```
trie/
├── src/
│   ├── App.tsx              # Main app wrapper
│   ├── TrieEducationApp.tsx # Main component with trie implementation
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind CSS imports
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── tailwind.config.js       # Tailwind CSS config
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Usage

1. Type in the search box to see autocomplete suggestions
2. Watch the trie visualization highlight the active path
3. Click "Debug_Mode" to step through character-by-character traversal
4. Use "Next_Op" to advance one character at a time
5. Click the reset button to return to normal mode

## Debugging Tips

- The visualization shows active nodes in green and dormant nodes in gray
- End-of-word nodes have a small amber LED indicator
- The buffer display shows the current search prefix
- Step mode lets you see exactly how the trie is traversed

## License

MIT

