# The Ultimate Playground for QA Engineers - QA Store

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://d-xan.github.io/The-Ultimate-Playground-for-QA-Engineers---QA-Store/)

Welcome to the **QA Store Playground**, a comprehensive testing environment designed specifically for Automation Engineers and QA professionals! This repository contains a mock e-commerce application alongside a dedicated set of robust automation challenges to help you practice and hone your testing skills.

## 🚀 Features

### 🛒 E-Commerce Mock Application
- **Customer View**: Browse products, view simulated real-time data, and interact with a fully responsive store UI.
- **Admin Dashboard**: Manage inventory, view statistics, and interact with complex data tables.

### 🧪 QA Practice Challenges (The Playground)
Access the dedicated `/practice` route to find 9 structured automation challenges designed to mimic real-world scenarios:

1. **Basic Elements**: Automate standard inputs, checkboxes, radio buttons, and sliders.
2. **Advanced Inputs**: Handle searchable autocomplete dropdowns, file uploads, date/time pickers, and color pickers.
3. **Tables & Lists**: Automate dynamic data tables, sorting, and filtering.
4. **Mouse & Keyboard**: Perform advanced interactions like Drag-and-Drop, Hovers, Double Clicks, and Right Clicks.
5. **Popups & Dialogs**: Handle native JavaScript alerts, confirms, prompts, and custom HTML modals.
6. **Frames & Shadow DOM**: Switch contexts into iframes and penetrate open Shadow DOMs.
7. **Dynamic & Waits**: Master explicit waits by handling dynamic elements and loading progress bars.
8. **Store Pagination**: Automate navigating and verifying paginated tables.
9. **Store Lazy Loading**: Automate scrolling interactions to trigger and verify lazy-loaded DOM elements.

**🔥 Built-in Persistence & Task Tracking**
- Every challenge page includes a detailed list of **Positive & Negative Test Cases** directly alongside the target elements.
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
   👉 `https://d-xan.github.io/The-Ultimate-Playground-for-QA-Engineers---QA-Store/`
2. Navigate to the `/practice` route (or click "Start Practicing" from the homepage).

**Option 2: Test Locally (Recommended for modifying the app)**
1. Start the application locally via `npm run dev`.
2. Point your automation framework to `http://localhost:5173`.
3. Navigate to the `/practice` route.

### 📝 Approaching the Challenges
1. Expand the task descriptions on any practice page.
2. Write your scripts to successfully execute both the **Positive** and **Negative** test cases outlined for each feature.

Happy Testing! 🐛🔨
