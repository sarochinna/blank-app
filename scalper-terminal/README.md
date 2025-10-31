# ⚡ Scalper Terminal

A professional stock scalping terminal UI built with React, TypeScript, and Framer Motion. Designed for high-frequency traders who need instant market reactions and real-time trading capabilities.

## 🎯 Features

### Real-Time Market Data
- **Three-Panel Chart View**: CE (Call), Spot, and PE (Put) charts side by side
- **Live Price Updates**: Real-time price simulation with smooth chart animations
- **Price Change Indicators**: Color-coded P&L showing gains (green) and losses (red)

### Order Execution
- **Quick Order Pad**: Enter quantity, price, and product type (MIS/NRML)
- **One-Click Trading**: BUY, SELL, and EXIT buttons with instant execution
- **Toast Notifications**: Real-time feedback for every trade action
- **Keyboard Shortcuts**:
  - `B` - Execute Buy order
  - `S` - Execute Sell order
  - `E` - Exit all positions
  - `Shift + B` - Set SL/Target (Buy side)
  - `Shift + S` - Set SL/Target (Sell side)

### Position Management
- **Live Positions Panel**: Auto-slides up after order execution
- **P&L Tracking**: Real-time profit/loss calculation per position
- **SL/Target Setting**: Hover over positions to set stop-loss and target prices
- **Draggable Lines**: Click and drag SL/Target lines on charts
- **Visual Indicators**: Red lines for stop-loss, green for targets

### Professional UI/UX
- **Dark Theme**: Eye-friendly design system based on Figma tokens
- **Smooth Animations**:
  - Toast fade-in: 150ms
  - Positions slide-up: 300ms
  - SL/Target line draw: 250ms
- **Responsive Layout**: Adapts to different screen sizes
- **Custom Scrollbars**: Styled to match dark theme
- **Hover States**: Interactive feedback on all buttons and positions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173/`

## 🎨 Design System

The UI is built using a comprehensive design token system extracted from Figma:

### Colors
- **Background**: `#0D0D0D` (Neutral-1)
- **Secondary BG**: `#1A1A1A` (Neutral-2)
- **Borders**: `#262626` (Neutral-4)
- **Primary**: `#667FFF` (Primary/Dark/Main)
- **Success (Buy)**: `#3FAF9F`
- **Error (Sell)**: `#F96363`
- **Text**: `#F0F0F0` (Neutral-10)

### Typography
- **Font Family**: Roboto
- **Sizes**: 10px - 23px with appropriate line heights
- **Weights**: Regular (400), Medium (500), Semibold (600)

### Spacing
- XS: 4px | SM: 8px | MD: 12px | LG: 16px | XL: 20px | XXL: 24px

### Border Radius
- SM: 4px | MD: 8px | LG: 12px | XL: 16px

## 📁 Project Structure

```
scalper-terminal/
├── src/
│   ├── components/
│   │   ├── Chart.tsx              # Chart component with canvas rendering
│   │   ├── OrderPad.tsx           # Order entry interface
│   │   ├── PositionsPanel.tsx     # Positions management panel
│   │   └── ToastContainer.tsx     # Toast notification system
│   ├── design-tokens.ts           # Design system tokens
│   ├── types.ts                   # TypeScript type definitions
│   ├── App.tsx                    # Main application component
│   ├── index.css                  # Global styles
│   └── main.tsx                   # Application entry point
├── index.html
├── package.json
└── vite.config.ts
```

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library
- **Canvas API** - Chart rendering

## 💡 Usage Examples

### Executing a Trade
1. Enter quantity and price in the order pad
2. Select product type (MIS or NRML)
3. Click BUY or SELL (or use `B`/`S` keyboard shortcuts)
4. Position appears in the positions panel below

### Setting Stop Loss & Target
1. Hover over any position in the positions panel
2. Click "Set SL/Target" button
3. Enter stop-loss and target prices
4. Click "Apply"
5. Lines appear on the chart - drag to adjust

### Exiting Positions
- Click EXIT button or press `E` key
- All positions close instantly
- Total P&L displayed in toast notification

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `B` | Execute Buy order at current spot price |
| `S` | Execute Sell order at current spot price |
| `E` | Exit all open positions |
| `Shift + B` | Open SL/Target setter for buy positions |
| `Shift + S` | Open SL/Target setter for sell positions |

## 🔄 Real-Time Simulation

The terminal simulates live market activity:
- Prices update every 500ms
- Random walk algorithm for realistic price movement
- Auto-detection of spot price for CE/PE options
- P&L updates in real-time based on current prices

## 🎨 Customization

### Changing Colors
Edit `src/design-tokens.ts` to customize the color scheme:

```typescript
export const colors = {
  primary: {
    main: '#667FFF', // Change primary color
  },
  success: {
    main: '#3FAF9F', // Change success/buy color
  },
  error: {
    main: '#F96363', // Change error/sell color
  },
}
```

### Adjusting Animation Speed
Modify animation durations in `src/design-tokens.ts`:

```typescript
export const animations = {
  toastFadeIn: { duration: 0.15 },
  positionsPanelSlide: { duration: 0.3 },
  // ... etc
}
```

## 📝 Notes

- This is a UI simulation - not connected to real market data
- All price movements are randomly generated
- No actual trades are executed
- Designed for demonstration and testing purposes

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🎯 Future Enhancements

- [ ] Connect to real market data APIs
- [ ] Add order history panel
- [ ] Implement multiple instrument switching
- [ ] Add technical indicators overlay
- [ ] Export trade logs
- [ ] Add dark/light theme toggle
- [ ] Mobile responsive design
- [ ] WebSocket integration for real-time data
- [ ] Multiple chart layouts

---

Built with ⚡ by traders, for traders.
