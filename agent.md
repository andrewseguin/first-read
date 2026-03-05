# First Read - Agent Context

This document provides context for an AI assistant to help with the development of the "First Read" web application.

## Project Overview

First Read is a web application designed to help young children learn their letters and begin reading. The core feature is a large, interactive display of letters and words. Parents can customize the learning experience by selecting specific letters and game modes. The application is built with Next.js.

The application has a playful and clean design, with a warm color palette and a focus on legibility and ease of use for young children.

## Technologies Used

*   **Framework**: [Next.js](https://nextjs.org/) (v15.5.9) with Turbopack
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) built on top of [Radix UI](https://www.radix-ui.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: React Hooks and `use-local-storage` for persistence.
*   **Linting/Formatting**: ESLint, Prettier (inferred from common Next.js setups)

## Project Structure

*   `.`
    *   `src/app/page.tsx`: The main page of the application, containing the primary logic for the letter and word display.
    *   `src/app/layout.tsx`: The root layout of the application, which includes the theme provider and audio provider.
    *   `src/components/`: Contains the React components used in the application.
        *   `letter-selector.tsx`: The component that allows parents to select which letters to practice.
        *   `letter-display.tsx`: The component that displays the current letter or word.
        *   `app-settings.tsx`: The component for application-wide settings.
        *   `ui/`: The `shadcn/ui` components.
    *   `src/lib/`: Contains utility functions and data.
        *   `letters.ts`: Defines the letters, their colors, and levels.
        *   `words.ts`: Contains the lists of easy and hard words.
    *   `public/`: Contains static assets like images and sounds.
    *   `docs/blueprint.md`: Contains the original design and style guidelines for the app.

## Key Files

*   **`src/app/page.tsx`**: This is the most important file for the application's interactive logic. It manages the game state, including the selected letters, game mode, and the current letter or word being displayed.
*   **`src/lib/letters.ts` and `src/lib/words.ts`**: These files contain the core data for the application. `letters.ts` defines the properties of each letter, while `words.ts` provides the vocabulary for the word-based game modes.
*   **`src/components/letter-selector.tsx`**: This component provides the UI for customizing the learning experience.
*   **`docs/blueprint.md`**: This file is a valuable resource for understanding the original intent behind the app's design and features.

## How to Run the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the Next.js development server on port 9002.

## Development Workflow

1.  Pull the latest changes from the main branch.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes in the codebase.
4.  Run `npm run dev` to test your changes locally.
5.  Once you are happy with your changes, create a pull request.
