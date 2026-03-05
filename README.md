# First Read

Welcome to **First Read**! First Read is an interactive, playful web application designed to help young children learn their letters and begin their reading journey. 

Check out the live application on GitHub Pages: [https://andrewseguin.github.io/first-read/](https://andrewseguin.github.io/first-read/)

## Overview

The core of First Read is a large, interactive display that helps children familiarize themselves with letters and words. Parents can customize the learning experience by selecting specific letters and game modes (e.g., letter mode or word mode), as well as adjusting the vocabulary difficulty. The application uses a warm color palette, micro-animations, and a distraction-free interface built specifically with young children in mind.

## Implementation Details

This project is built using modern web development practices and technologies:

- **Framework**: [Next.js](https://nextjs.org/) (v15) with Turbopack for fast, React-based development.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for robust, type-safe code.
- **UI & Styling**: Uses [Tailwind CSS](https://tailwindcss.com/) alongside [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/) components to create a clean, accessible, and playful design.
- **State Management**: Heavily utilizes React Hooks and `use-local-storage` to ensure that a child's progress and a parent's settings persist seamlessly across sessions.

### Key Parts of the Codebase

- `src/app/page.tsx`: The main entry point containing the primary interactive logic for letter and word displays, game state management, and touch/keyboard event handling.
- `src/lib/letters.ts` & `src/lib/words.ts`: Configuration files that define the available letters, their visual properties (colors, levels), and the vocabulary sets (easy vs. hard words) used in game modes.
- `src/components/`: Reusable React components including the core `letter-display` which presents the current challenge, and the `letter-selector` and `app-settings` used by parents to control the progression.

## Getting Started Locally

If you'd like to run First Read locally or contribute to the project:

1. Clone the repository to your machine.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The Next.js development server will start on port `9002` (see `package.json`).*

Open up [http://localhost:9002](http://localhost:9002) in your browser to see the app in action!
