# The Ultimate Playground for QA Engineers - QA Store

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-qa.randomly.online-success?style=for-the-badge&logo=github)](https://qa.randomly.online/)

Welcome to the **QA Store Playground**, a comprehensive testing environment designed specifically for Automation Engineers and QA professionals! This repository contains a mock e-commerce application alongside a dedicated set of robust automation challenges to help you practice and hone your testing skills.

## 🚀 Features

### 🛒 E-Commerce Mock Application
- **Customer View**: Browse products, view simulated real-time data, and interact with a fully responsive store UI.
- **Admin Dashboard**: Manage inventory, view statistics, and interact with complex data tables.

### 🧪 QA Practice Challenges (The Playground)
Access the dedicated `/practice` route to find 23 automation challenges designed to mimic real-world scenarios:

1. **Basic Elements**: Interact with inputs, buttons, and forms.
2. **Advanced Inputs**: Handle date pickers, range sliders, and uploads.
3. **Tables & Lists**: Extract data from dynamic data grids.
4. **Mouse & Keyboard**: Drag-and-drop, hover, right-click, and hotkeys.
5. **Popups & Dialogs**: Manage alerts, confirm prompts, and modals.
6. **Frames & Shadow DOM**: Switching contexts into iframes and shadow roots.
7. **Dynamic & Waits**: Handle elements appearing asynchronously.
8. **Store Pagination**: Navigate multiple pages of products.
9. **Store Lazy Loading**: Scroll to trigger dynamic content fetching.
10. **API Interception**: Mock and modify network requests directly.
11. **Progress Bar**: Test waits on a dynamic progress bar.
12. **Click Traps**: Covered, moving and delayed elements that break naive clicks.
13. **Locator Traps**: Dynamic IDs, shuffled classes, hidden spaces and shifting layouts.
14. **Deep DOM**: Nested iframes, closed shadow roots and shadow DOM inside frames.
15. **Flaky Page**: Random failures, random delays and re-rendered elements.
16. **Real-World Widgets**: OTP boxes, tag inputs and star ratings.
17. **Windows & Tabs**: New tabs, popups that close themselves and windows found by title.
18. **Sortable Lists**: HTML5 drag and drop, press-and-hold sorting and a Kanban board.
19. **Virtual Table**: 10,000 rows with only a few in the DOM: scroll to find and sort to pick.
20. **Auth Flows**: Two-step login, sessions that expire mid-task and remembered logins.
21. **Canvas & Charts**: Click a moving canvas target, draw a stroke and read chart tooltips.
22. **Accessibility Lab**: Find planted axe violations, assert a clean scan and finish a form by keyboard.
23. **Bug Hunt**: Find six real bugs planted in the QA Store.

**🧰 Free tools**

- **Test Data Generator**: Unlimited fake users, orders and cards as CSV, JSON or SQL.
- **API Playground**: Mock REST API with auth, status codes, delays and rate limits.
- **Interview Kit**: 60+ QA and SDET interview questions with answers and flashcards.
- **Certificate**: Finish every challenge and download your certificate.

**🔥 Built-in Persistence & Task Tracking**
- Every challenge page includes a detailed list of **Positive & Negative Test Cases** directly alongside the target elements.
- Newer challenges show a pass/fail result on the page, a hint for each task, and reference solutions in Playwright, Selenium Java, Selenium Python and Cypress.
- **Save & Next** functionality preserves your local state via `localStorage`, so your progress remains even if you refresh the page.

## 🛠️ Technology Stack
- **React 18** (Vite)
- **TypeScript**
- **Tailwind CSS** (for styling)
- **Lucide React** (for icons)
- **React Router** (for navigation)

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/D-xan/The-Ultimate-Playground-for-QA-Engineers---QA-Store.git
   ```
2. Navigate into the directory:
   ```bash
   cd The-Ultimate-Playground-for-QA-Engineers---QA-Store
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App Locally
Start the Vite development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 💡 How to Use for Automation Training

You have two options for running your automation scripts against this playground:

**Option 1: Test against the Live URL (Recommended for quick start)**
1. Point your automation framework (Selenium, Playwright, Cypress, WebdriverIO) directly to the live environment:
   👉 `https://qa.randomly.online/`
2. Navigate to the `/practice` route (or click "Start Practicing" from the homepage).

**Option 2: Test Locally (Recommended for modifying the app)**
1. Start the application locally via `npm run dev`.
2. Point your automation framework to `http://localhost:5173`.
3. Navigate to the `/practice` route.

### 📝 Approaching the Challenges
1. Expand the task descriptions on any practice page.
2. Write your scripts to successfully execute both the **Positive** and **Negative** test cases outlined for each feature.

Happy Testing! 🐛🔨
