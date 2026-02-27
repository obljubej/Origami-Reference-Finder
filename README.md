# 🔷 Origami Reference Finder

**Find minimal fold sequences to locate reference points & lines on a sheet of paper.**

A browser-based tool inspired by [Robert Lang's ReferenceFinder](https://langorigami.com/article/referencefinder/), reimplemented from scratch in TypeScript with a modern React UI.

🌐 **[Live Demo →](https://obljubej.github.io/Origami-Reference-Finder/)**

---

## What It Does

In origami, you often need to find a specific point or line on a sheet of paper — for example, "mark a point at (0.3125, 0.7)" or "create a crease at x = 1/3". This tool finds the **shortest sequence of physical folds** that constructs that reference within a given tolerance.

Enter a target point or line, and the solver will return step-by-step folding instructions, a crease diagram, and an error measurement.

---

## How the Algorithm Works

### The Core Idea

A sheet of paper starts with **4 known points** (corners) and **4 known lines** (edges). Each fold you make creates a new crease line, and that crease intersects existing creases to produce new known points. The algorithm systematically explores all possible fold sequences to find ones that produce a point or line matching your target.

### Search Strategy: Iterative Deepening DFS (IDDFS)

The solver uses **Iterative Deepening Depth-First Search** — it tries all 1-fold sequences first, then all 2-fold sequences, then 3-fold, and so on up to a configurable maximum depth (default 6).

```
Depth 0: 4 points, 4 lines (just the paper)
Depth 1: ~8 points, 5 lines (after one fold)
Depth 2: ~15 points, 6 lines
Depth 3: ~25 points, 8 lines
  ...and so on
```

**Why IDDFS over BFS or A*?**
- **BFS** requires storing all states at the current depth — exponential memory
- **A*** needs an admissible heuristic, which is hard to define for origami folds
- **IDDFS** uses O(depth) memory, naturally finds minimum-depth solutions first, and with aggressive pruning the re-exploration overhead is acceptable

### The Three Types of Folds

Every fold is one of three geometric constructions:

| Fold Type | Geometric Operation | Example |
|-----------|-------------------|---------|
| **Point-to-Point** | Perpendicular bisector of two points | Fold bottom-left corner to top-right corner |
| **Line-to-Line** | Angle bisector (or midline for parallel lines) | Fold left edge onto right edge |
| **Point-to-Line** | Perpendicular bisector of a point and its image on the line | Fold a corner onto an edge |

### State Transitions

When a fold is applied:
1. A new **crease line** is added to the state
2. The crease is **clipped to the paper bounds** → a visible segment
3. **Intersections** with all existing creases are computed → new known points
4. Only points within the paper rectangle are kept

### Pruning & Optimization

- **State hashing**: Each state is hashed by its set of crease lines (sorted, snapped to avoid floating-point duplicates). States already visited at the same or lower depth are skipped.
- **Crease deduplication**: Moves that produce an already-existing crease are discarded during generation.
- **Paper bounds**: Creases that don't intersect the paper rectangle are discarded.
- **Duplicate solution detection**: Solutions with identical crease sequences are filtered out.

### Solution Ranking

Solutions are ranked by (in priority order):
1. **Fold count** — fewer folds is better
2. **Error** — closer to the target is better
3. **Robustness** — folds referencing simple elements (corners, edges) are preferred over complex intersection points
4. **Simplicity** — common fold types (edge-to-edge, corner-to-corner) score higher than exotic ones

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI** | React 18 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Build** | Vite |
| **Solver** | Pure TypeScript, runs in a Web Worker |
| **Diagrams** | Inline SVG (React components) |
| **Testing** | Vitest |
| **Deployment** | GitHub Pages via GitHub Actions |

---

## Project Structure

```
src/
├── solver/           # Core algorithm
│   ├── geometry.ts   # Points, lines, intersections, reflections
│   ├── state.ts      # Paper state management & fold application
│   ├── moves.ts      # Move generation (fold vocabulary)
│   ├── search.ts     # IDDFS search engine
│   ├── scoring.ts    # Solution ranking
│   ├── descriptions.ts # Human-readable fold descriptions
│   ├── api.ts        # Public API (solvePoint, solveLineX, solveLineY)
│   └── types.ts      # Shared type definitions
├── worker/           # Web Worker bridge
│   ├── solver.worker.ts
│   └── workerClient.ts
├── components/       # React UI
│   ├── InputPanel.tsx
│   ├── ResultsPanel.tsx
│   ├── SolutionCard.tsx
│   ├── StepList.tsx
│   ├── CreaseDiagram.tsx
│   ├── ShareExport.tsx
│   ├── TargetPreview.tsx
│   └── Header.tsx
├── hooks/
│   └── useSolver.ts  # React hook wrapping worker communication
└── utils/
    ├── math.ts       # Epsilon comparisons, numeric helpers
    └── format.ts     # Number formatting
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm

### Install & Run

```bash
# Clone the repository
git clone https://github.com/obljubej/Origami-Reference-Finder.git
cd Origami-Reference-Finder

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Usage

1. Set the **paper size** (default 1×1 square)
2. Choose a **target type**: Point (x, y), Vertical Line (x), or Horizontal Line (y)
3. Enter **normalized coordinates** (0–1 range)
4. Adjust **tolerance** (default ±0.5%) and **max folds** (default 6)
5. Click **Find References**
6. Browse solutions — expand any card to see step-by-step instructions and a crease diagram

---

## Performance

| Depth | Typical Time |
|-------|-------------|
| ≤ 4 folds | < 100ms |
| 5 folds | < 2 seconds |
| 6 folds | < 30 seconds |

The solver runs entirely in a **Web Worker**, so the UI stays responsive during search. Progress updates stream back in real-time.

---

## License

MIT
