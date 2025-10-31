import { useState, useEffect, useCallback } from 'react';
import { Chart } from './components/Chart';
import { OrderPad } from './components/OrderPad';
import { PositionsPanel } from './components/PositionsPanel';
import { ToastContainer } from './components/ToastContainer';
import { colors, spacing, typography } from './design-tokens';
import { Position, ChartData, Toast, OrderSide, ProductType, OptionType } from './types';

// Simulate NIFTY spot price
const BASE_SPOT_PRICE = 22450;
const CE_STRIKE = 22500;
const PE_STRIKE = 22500;

function App() {
  const [spotPrice, setSpotPrice] = useState(BASE_SPOT_PRICE);
  const [cePrice, setCePrice] = useState(120);
  const [pePrice, setPePrice] = useState(140);

  const [spotData, setSpotData] = useState<ChartData[]>([]);
  const [ceData, setCeData] = useState<ChartData[]>([]);
  const [peData, setPeData] = useState<ChartData[]>([]);

  const [positions, setPositions] = useState<Position[]>([]);
  const [showPositions, setShowPositions] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize chart data
  useEffect(() => {
    const now = Date.now();
    const initialSpotData: ChartData[] = [];
    const initialCeData: ChartData[] = [];
    const initialPeData: ChartData[] = [];

    for (let i = 100; i >= 0; i--) {
      const time = now - i * 1000;
      const randomWalk = (Math.random() - 0.5) * 2;
      initialSpotData.push({ time, price: BASE_SPOT_PRICE + randomWalk * 10 });
      initialCeData.push({ time, price: 120 + randomWalk });
      initialPeData.push({ time, price: 140 + randomWalk });
    }

    setSpotData(initialSpotData);
    setCeData(initialCeData);
    setPeData(initialPeData);
    setSpotPrice(initialSpotData[initialSpotData.length - 1].price);
    setCePrice(initialCeData[initialCeData.length - 1].price);
    setPePrice(initialPeData[initialPeData.length - 1].price);
  }, []);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const spotChange = (Math.random() - 0.5) * 5;
      const ceChange = (Math.random() - 0.5) * 2;
      const peChange = (Math.random() - 0.5) * 2;

      setSpotData((prev) => {
        const newPrice = prev[prev.length - 1].price + spotChange;
        setSpotPrice(newPrice);
        return [...prev.slice(-100), { time: now, price: newPrice }];
      });

      setCeData((prev) => {
        const newPrice = prev[prev.length - 1].price + ceChange;
        setCePrice(newPrice);
        return [...prev.slice(-100), { time: now, price: newPrice }];
      });

      setPeData((prev) => {
        const newPrice = prev[prev.length - 1].price + peChange;
        setPePrice(newPrice);
        return [...prev.slice(-100), { time: now, price: newPrice }];
      });

      // Update position P&Ls
      setPositions((prevPositions) =>
        prevPositions.map((pos) => {
          let currentPrice = spotPrice;
          if (pos.optionType === 'CE') currentPrice = cePrice;
          if (pos.optionType === 'PE') currentPrice = pePrice;

          const pnl = (currentPrice - pos.avgPrice) * pos.quantity;

          return { ...pos, currentPrice, pnl };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [spotPrice, cePrice, pePrice]);

  const showToast = useCallback((message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const handleOrder = useCallback(
    (quantity: number, price: number, productType: ProductType, side: OrderSide) => {
      if (quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
      }

      const optionType: OptionType = 'SPOT'; // Default to SPOT for now
      const actualPrice = price || spotPrice;

      const newPosition: Position = {
        id: Math.random().toString(36).substring(7),
        symbol: `NIFTY ${optionType === 'CE' ? CE_STRIKE + ' CE' : optionType === 'PE' ? PE_STRIKE + ' PE' : 'SPOT'}`,
        optionType,
        quantity: side === 'BUY' ? quantity : -quantity,
        avgPrice: actualPrice,
        currentPrice: actualPrice,
        pnl: 0,
      };

      setPositions((prev) => [...prev, newPosition]);
      setShowPositions(true);
      showToast(`${side} Executed @ ₹${actualPrice.toFixed(2)} | Qty: ${quantity}`, 'success');
    },
    [spotPrice, showToast]
  );

  const handleExit = useCallback(() => {
    if (positions.length === 0) {
      showToast('No positions to exit', 'error');
      return;
    }

    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    setPositions([]);
    setShowPositions(false);
    showToast(`All positions exited | P&L: ₹${totalPnL.toFixed(2)}`, totalPnL >= 0 ? 'success' : 'error');
  }, [positions, showToast]);

  const handleSetSLTarget = useCallback(
    (positionId: string, stopLoss?: number, target?: number) => {
      setPositions((prev) =>
        prev.map((pos) =>
          pos.id === positionId ? { ...pos, stopLoss, target } : pos
        )
      );
      showToast('SL/Target set successfully', 'success');
    },
    [showToast]
  );

  const handleSLDrag = useCallback(
    (positionId: string, newPrice: number) => {
      setPositions((prev) =>
        prev.map((pos) => (pos.id === positionId ? { ...pos, stopLoss: newPrice } : pos))
      );
    },
    []
  );

  const handleTargetDrag = useCallback(
    (positionId: string, newPrice: number) => {
      setPositions((prev) =>
        prev.map((pos) => (pos.id === positionId ? { ...pos, target: newPrice } : pos))
      );
    },
    []
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        if (e.shiftKey) {
          showToast('Open SL/Target setter (hover over position)', 'info');
        } else {
          handleOrder(1, spotPrice, 'MIS', 'BUY');
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (e.shiftKey) {
          showToast('Open SL/Target setter (hover over position)', 'info');
        } else {
          handleOrder(1, spotPrice, 'MIS', 'SELL');
        }
      } else if (e.key === 'e' || e.key === 'E') {
        handleExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleOrder, handleExit, spotPrice, showToast]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[1],
        color: colors.neutral[10],
        fontFamily: typography.fontFamily,
        padding: spacing.lg,
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: spacing.lg,
          paddingBottom: spacing.md,
          borderBottom: `1px solid ${colors.neutral[4]}`,
        }}
      >
        <div
          style={{
            fontSize: typography.label.xxl.semibold.fontSize,
            fontWeight: typography.label.xxl.semibold.fontWeight,
            color: colors.neutral[10],
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          <span>⚡</span>
          <span>Scalper Terminal</span>
        </div>
        <div
          style={{
            fontSize: typography.label.small.regular.fontSize,
            color: colors.neutral[8],
            marginTop: spacing.xs,
          }}
        >
          Live Market | NIFTY 50 | Shortcuts: B (Buy) | S (Sell) | E (Exit)
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: spacing.md,
          marginBottom: spacing.lg,
          height: '400px',
        }}
      >
        <Chart
          optionType="CE"
          symbol={`NIFTY ${CE_STRIKE} CE`}
          price={cePrice}
          data={ceData}
          stopLoss={positions.find((p) => p.optionType === 'CE')?.stopLoss}
          target={positions.find((p) => p.optionType === 'CE')?.target}
          onSLDrag={(newPrice) => {
            const pos = positions.find((p) => p.optionType === 'CE');
            if (pos) handleSLDrag(pos.id, newPrice);
          }}
          onTargetDrag={(newPrice) => {
            const pos = positions.find((p) => p.optionType === 'CE');
            if (pos) handleTargetDrag(pos.id, newPrice);
          }}
        />

        <Chart
          optionType="SPOT"
          symbol="NIFTY SPOT"
          price={spotPrice}
          data={spotData}
          stopLoss={positions.find((p) => p.optionType === 'SPOT')?.stopLoss}
          target={positions.find((p) => p.optionType === 'SPOT')?.target}
          onSLDrag={(newPrice) => {
            const pos = positions.find((p) => p.optionType === 'SPOT');
            if (pos) handleSLDrag(pos.id, newPrice);
          }}
          onTargetDrag={(newPrice) => {
            const pos = positions.find((p) => p.optionType === 'SPOT');
            if (pos) handleTargetDrag(pos.id, newPrice);
          }}
        />

        <Chart
          optionType="PE"
          symbol={`NIFTY ${PE_STRIKE} PE`}
          price={pePrice}
          data={peData}
          stopLoss={positions.find((p) => p.optionType === 'PE')?.stopLoss}
          target={positions.find((p) => p.optionType === 'PE')?.target}
          onSLDrag={(newPrice) => {
            const pos = positions.find((p) => p.optionType === 'PE');
            if (pos) handleSLDrag(pos.id, newPrice);
          }}
          onTargetDrag={(newPrice) => {
            const pos = positions.find((p) => p.optionType === 'PE');
            if (pos) handleTargetDrag(pos.id, newPrice);
          }}
        />
      </div>

      {/* Order Pad */}
      <OrderPad onOrder={handleOrder} onExit={handleExit} hasPositions={positions.length > 0} />

      {/* Positions Panel */}
      <PositionsPanel
        positions={positions}
        isOpen={showPositions}
        onSetSLTarget={handleSetSLTarget}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
