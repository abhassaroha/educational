# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run typecheck # tsc --noEmit (type checking only, no emit)
npm run lint      # ESLint on src/
```

There is no test runner configured.

## Architecture

This is a **Vite + React + TypeScript** app that presents educational topics as interactive 3D visualizations using **@react-three/fiber** (R3F) and **@react-three/drei**.

### Routing

`App.tsx` uses React Router v6 with two routes:
- `/` → `TopicSelector` — home grid of topic cards
- `/topics/:topicId` → `TopicView` — full-viewport Canvas rendering the selected topic's Scene

### Topic system

Every topic is a folder under `src/topics/` with two files:

- **`index.ts`** — exports a typed `Topic` object: `{ id, title, description, icon, Scene }`
- **`Scene.tsx`** — a React component rendered inside R3F `<Canvas>`. This is where all Three.js/R3F code lives.

The `Topic` interface is defined in `src/types.ts`. All topics are registered in `src/topics/index.ts` in the `TOPICS: Topic[]` array. `TopicView` looks up the topic by `id` from the URL param and renders its `Scene` inside a `<Canvas>`.

### Adding a new topic

1. Create `src/topics/<slug>/index.ts` exporting a `Topic` object typed as `Topic` from `../../types`
2. Create `src/topics/<slug>/Scene.tsx` — the R3F scene component
3. Import and add the topic to the `TOPICS` array in `src/topics/index.ts`

The Canvas in `TopicView` sets `camera={{ position: [0, 5, 15], fov: 60 }}`. Override camera settings inside the Scene if needed using R3F's `<PerspectiveCamera>` from drei.

### Three.js / R3F conventions

- Animation lives in `useFrame(({ clock }) => { ... })` — use `clock.getElapsedTime()` for time-based motion
- Refs for Three.js objects use the `null!` initializer: `useRef<THREE.Mesh>(null!)` — this gives a non-nullable `MutableRefObject<T>` which R3F assigns on mount
- When passing a `Mesh` ref to a drei component that expects `Object3D` (e.g. `Trail.target`), cast: `ref as React.MutableRefObject<THREE.Object3D>`
- `OrbitControls` from `@react-three/drei` is included in most scenes for user camera control
- Set scene background color with `<color attach="background" args={['#hex']} />` inside the Canvas
- Lighting: `<ambientLight>` + `<pointLight>` or `<directionalLight>` per scene
- Use `<line_>` (underscore suffix) instead of `<line>` to avoid collision with the SVG element — the `line_` JSX type is declared in `src/vite-env.d.ts`

### TypeScript setup notes

- `@types/react` is pinned to `^18` to match `@react-three/fiber` v8, which augments the global `JSX` namespace (removed in `@types/react@19`)
- `src/vite-env.d.ts` contains the `/// <reference types="@react-three/fiber" />` directive that loads R3F's JSX intrinsic element types (`mesh`, `sphereGeometry`, etc.), and also declares the `line_` element type

### Key dependencies

| Package | Role |
|---|---|
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Three.js helpers: `OrbitControls`, `Stars`, `Trail`, `Text`, etc. |
| `three` | Underlying 3D engine (rarely imported directly) |
| `react-router-dom` v6 | Client-side routing |
