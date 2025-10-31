import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { colors, borderRadius, spacing, typography } from '../design-tokens';
import { ChartData, OptionType } from '../types';

interface ChartProps {
  optionType: OptionType;
  symbol: string;
  price: number;
  data: ChartData[];
  stopLoss?: number;
  target?: number;
  onSLDrag?: (newPrice: number) => void;
  onTargetDrag?: (newPrice: number) => void;
}

export const Chart: React.FC<ChartProps> = ({
  optionType,
  symbol,
  price,
  data,
  stopLoss,
  target,
  onSLDrag,
  onTargetDrag,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState<'sl' | 'target' | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || data.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width * window.devicePixelRatio;
    canvas.height = dimensions.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Calculate price range
    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    gradient.addColorStop(0, 'rgba(102, 127, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(102, 127, 255, 0.01)');
    ctx.fillStyle = gradient;

    // Draw chart line
    ctx.beginPath();
    ctx.strokeStyle = colors.primary.main;
    ctx.lineWidth = 2;

    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * dimensions.width;
      const y = dimensions.height - ((point.price - minPrice) / priceRange) * dimensions.height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Fill area under line
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * dimensions.width;
      const y = dimensions.height - ((point.price - minPrice) / priceRange) * dimensions.height;

      if (i === 0) {
        ctx.lineTo(x, dimensions.height);
      }
    });
    ctx.lineTo(dimensions.width, dimensions.height);
    ctx.lineTo(0, dimensions.height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw SL line
    if (stopLoss) {
      const slY = dimensions.height - ((stopLoss - minPrice) / priceRange) * dimensions.height;
      ctx.beginPath();
      ctx.strokeStyle = colors.error.main;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, slY);
      ctx.lineTo(dimensions.width, slY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Target line
    if (target) {
      const targetY = dimensions.height - ((target - minPrice) / priceRange) * dimensions.height;
      ctx.beginPath();
      ctx.strokeStyle = colors.success.main;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, targetY);
      ctx.lineTo(dimensions.width, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [data, dimensions, stopLoss, target]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Check if clicking near SL or Target line
    if (stopLoss) {
      const prices = data.map((d) => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;
      const slY = dimensions.height - ((stopLoss - minPrice) / priceRange) * dimensions.height;

      if (Math.abs(y - slY) < 10) {
        setDragging('sl');
        return;
      }
    }

    if (target) {
      const prices = data.map((d) => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;
      const targetY = dimensions.height - ((target - minPrice) / priceRange) * dimensions.height;

      if (Math.abs(y - targetY) < 10) {
        setDragging('target');
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const newPrice = maxPrice - (y / dimensions.height) * priceRange;

    if (dragging === 'sl' && onSLDrag) {
      onSLDrag(newPrice);
    } else if (dragging === 'target' && onTargetDrag) {
      onTargetDrag(newPrice);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const priceChange = data.length > 1 ? price - data[0].price : 0;
  const priceChangePercent = data.length > 1 ? (priceChange / data[0].price) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1,
        backgroundColor: colors.neutral[2],
        border: `1px solid ${colors.neutral[4]}`,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: spacing.sm }}>
        <div
          style={{
            fontSize: typography.label.small.semibold.fontSize,
            fontWeight: typography.label.small.semibold.fontWeight,
            color: colors.neutral[10],
            marginBottom: spacing.xs,
          }}
        >
          {symbol}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.sm }}>
          <div
            style={{
              fontSize: typography.label.xl.semibold.fontSize,
              fontWeight: typography.label.xl.semibold.fontWeight,
              color: colors.neutral[10],
            }}
          >
            ₹{price.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: typography.label.small.medium.fontSize,
              color: priceChange >= 0 ? colors.success.main : colors.error.main,
            }}
          >
            {priceChange >= 0 ? '+' : ''}
            {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          cursor: dragging ? 'grabbing' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
          }}
        />

        {/* SL Label */}
        {stopLoss && (
          <div
            style={{
              position: 'absolute',
              right: spacing.sm,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: colors.error.surface,
              color: colors.error.main,
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.sm,
              fontSize: typography.label.xsmall.medium.fontSize,
              fontWeight: typography.label.xsmall.medium.fontWeight,
            }}
          >
            SL: ₹{stopLoss.toFixed(2)}
          </div>
        )}

        {/* Target Label */}
        {target && (
          <div
            style={{
              position: 'absolute',
              right: spacing.sm,
              top: '20%',
              backgroundColor: colors.success.surface,
              color: colors.success.main,
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.sm,
              fontSize: typography.label.xsmall.medium.fontSize,
              fontWeight: typography.label.xsmall.medium.fontWeight,
            }}
          >
            TGT: ₹{target.toFixed(2)}
          </div>
        )}
      </div>
    </motion.div>
  );
};
