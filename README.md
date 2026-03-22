# ⚡ PokeValue - Pokemon Card Investment Advisor

A smart investment advisor web app for Pokemon TCG collectors. Built for **buddyfox33** to make informed card purchase decisions at shops and online.

## 🎯 What It Does

Answer one simple question: **"I have X dollars — what Pokemon cards should I buy RIGHT NOW as a smart investment?"**

PokeValue analyzes thousands of Pokemon cards using real-time market data and gives you:
- Top investment recommendations based on your budget
- Investment scores (1-5 stars) based on rarity, demand, and price
- Visual price vs. score comparison charts
- Personalized analysis explaining WHY each card is a good buy
- Target list to track cards you're interested in

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or navigate to this repository:
```bash
cd pokevalue
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## 📱 Features

### 1. 💡 Advisor Tab (Main Feature)
- **Budget Input**: Enter your budget or use quick presets ($25, $50, $100, $250, $500+)
- **Era Preferences**: Filter by Vintage, Classic, Modern, Current, or Popular Characters
- **Risk Appetite**: Choose Conservative, Balanced, or Aggressive strategy
- **Smart Results**: Get top 10 card recommendations with:
  - Card images and details
  - Current market prices from TCGPlayer
  - Investment scores (1-5 stars)
  - Personalized analysis text
  - Price vs. Score bar chart
- **One-Click Save**: Add any card to your Target List

### 2. 🔍 Search Tab
- Free-text search for any Pokemon by name
- See investment scores and current prices for all variants
- Filter through different sets and rarities
- Save interesting cards to your Target List

### 3. 🎯 Target List Tab
- View all saved cards in one place
- Add personal notes to each card (purchase date, condition, seller, etc.)
- Track current market prices
- See when you added each card
- Remove cards or clear entire list

## 🌟 Investment Score System

Cards are scored 1-5 stars based on:

**Base Score (Rarity):**
- Secret Rare / Special Illustration Rare: ⭐⭐⭐⭐⭐ (5 stars)
- Ultra Rare / Full Art / Rainbow Rare: ⭐⭐⭐⭐ (4 stars)
- Rare Holo: ⭐⭐⭐ (3 stars)
- Uncommon: ⭐⭐ (2 stars)
- Common: ⭐ (1 star)

**Bonuses (up to 5 stars total):**
- Popular character (Charizard, Pikachu, Mewtwo, Eevee, Gengar): +0.5
- Market price above $20 (demand signal): +0.5
- Fits within your budget: +0.5

## 🎨 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Chart.js + react-chartjs-2** - Interactive charts
- **Tailwind CSS** - Styling (via CDN)
- **Pokemon TCG API** - Real-time card data and prices
- **LocalStorage** - Client-side data persistence

## 📊 API

Uses the official [Pokemon TCG API](https://pokemontcg.io/) for:
- Card data (names, images, sets, rarities)
- TCGPlayer market prices
- Advanced filtering and search

No API key required!

## 🎨 Design

- Pokemon color palette (red, white, yellow)
- Mobile-friendly responsive design
- Large, prominent card images
- Loading states and smooth transitions
- Optimized for use at card shops on mobile devices

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 Notes for buddyfox33

- **Mobile Optimized**: Use this at card shops on your phone!
- **Offline Storage**: Target List persists even if you close the browser
- **Real-Time Prices**: Data comes directly from TCGPlayer marketplace
- **Era Filters**: Combine multiple eras for broader results
- **Risk Levels**:
  - Conservative: High-demand stable cards
  - Balanced: Mix of proven cards and growth potential
  - Aggressive: Lower-priced rares with upside potential

## 📄 License

Built with ❤️ for Pokemon TCG collectors everywhere.

---

**Happy collecting!** 🎴⚡
