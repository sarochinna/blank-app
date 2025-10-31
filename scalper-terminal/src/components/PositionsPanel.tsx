import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { colors, borderRadius, spacing, typography, animations } from '../design-tokens';
import { Position } from '../types';

interface PositionsPanelProps {
  positions: Position[];
  isOpen: boolean;
  onSetSLTarget: (positionId: string, stopLoss?: number, target?: number) => void;
}

export const PositionsPanel: React.FC<PositionsPanelProps> = ({
  positions,
  isOpen,
  onSetSLTarget,
}) => {
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [slValue, setSlValue] = useState<number>(0);
  const [targetValue, setTargetValue] = useState<number>(0);

  const handleSetSLTarget = (positionId: string) => {
    onSetSLTarget(positionId, slValue || undefined, targetValue || undefined);
    setEditingPosition(null);
    setSlValue(0);
    setTargetValue(0);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={animations.positionsPanelSlide}
      style={{
        backgroundColor: colors.neutral[1],
        border: `1px solid ${colors.neutral[4]}`,
        borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
        padding: spacing.lg,
        marginTop: spacing.lg,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg,
          paddingBottom: spacing.md,
          borderBottom: `1px solid ${colors.neutral[4]}`,
        }}
      >
        <div
          style={{
            fontSize: typography.label.large.semibold.fontSize,
            fontWeight: typography.label.large.semibold.fontWeight,
            color: colors.neutral[10],
          }}
        >
          Open Positions ({positions.length})
        </div>
      </div>

      {/* Positions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {positions.map((position) => (
          <motion.div
            key={position.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseEnter={() => setHoveredPosition(position.id)}
            onMouseLeave={() => setHoveredPosition(null)}
            style={{
              backgroundColor: colors.neutral[2],
              border: `1px solid ${colors.neutral[4]}`,
              borderRadius: borderRadius.md,
              padding: spacing.md,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Position Info */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: typography.label.default.semibold.fontSize,
                    fontWeight: typography.label.default.semibold.fontWeight,
                    color: colors.neutral[10],
                    marginBottom: spacing.xs,
                  }}
                >
                  {position.symbol}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: spacing.lg,
                    fontSize: typography.label.small.regular.fontSize,
                    color: colors.neutral[8],
                  }}
                >
                  <span>Qty: {position.quantity}</span>
                  <span>Avg: ₹{position.avgPrice.toFixed(2)}</span>
                  <span>LTP: ₹{position.currentPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* P&L */}
              <div
                style={{
                  fontSize: typography.label.large.semibold.fontSize,
                  fontWeight: typography.label.large.semibold.fontWeight,
                  color: position.pnl >= 0 ? colors.success.main : colors.error.main,
                  marginRight: spacing.lg,
                }}
              >
                {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toFixed(2)}
              </div>

              {/* SL/Target Button */}
              <AnimatePresence>
                {hoveredPosition === position.id && !editingPosition && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingPosition(position.id);
                      setSlValue(position.stopLoss || 0);
                      setTargetValue(position.target || 0);
                    }}
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: colors.primary.main,
                      color: colors.neutral[1],
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: typography.button.s.fontSize,
                      fontWeight: typography.button.s.fontWeight,
                      cursor: 'pointer',
                    }}
                  >
                    Set SL/Target
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* SL/Target Form */}
            <AnimatePresence>
              {editingPosition === position.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    marginTop: spacing.md,
                    paddingTop: spacing.md,
                    borderTop: `1px solid ${colors.neutral[4]}`,
                    display: 'flex',
                    gap: spacing.md,
                    alignItems: 'flex-end',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: typography.label.small.medium.fontSize,
                        color: colors.neutral[8],
                        marginBottom: spacing.xs,
                      }}
                    >
                      Stop Loss
                    </label>
                    <input
                      type="number"
                      value={slValue}
                      onChange={(e) => setSlValue(Number(e.target.value))}
                      step="0.05"
                      placeholder="Enter SL"
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        backgroundColor: colors.neutral[3],
                        border: `1px solid ${colors.neutral[5]}`,
                        borderRadius: borderRadius.sm,
                        color: colors.neutral[10],
                        fontSize: typography.label.default.regular.fontSize,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: typography.label.small.medium.fontSize,
                        color: colors.neutral[8],
                        marginBottom: spacing.xs,
                      }}
                    >
                      Target
                    </label>
                    <input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      step="0.05"
                      placeholder="Enter Target"
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        backgroundColor: colors.neutral[3],
                        border: `1px solid ${colors.neutral[5]}`,
                        borderRadius: borderRadius.sm,
                        color: colors.neutral[10],
                        fontSize: typography.label.default.regular.fontSize,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSetSLTarget(position.id)}
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: colors.success.main,
                      color: colors.neutral[1],
                      border: 'none',
                      borderRadius: borderRadius.sm,
                      fontSize: typography.button.s.fontSize,
                      fontWeight: typography.button.s.fontWeight,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Apply
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingPosition(null)}
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: colors.neutral[3],
                      color: colors.neutral[9],
                      border: 'none',
                      borderRadius: borderRadius.sm,
                      fontSize: typography.button.s.fontSize,
                      fontWeight: typography.button.s.fontWeight,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show current SL/Target if set */}
            {position.stopLoss || position.target ? (
              <div
                style={{
                  marginTop: spacing.sm,
                  display: 'flex',
                  gap: spacing.md,
                  fontSize: typography.label.xsmall.regular.fontSize,
                }}
              >
                {position.stopLoss && (
                  <span style={{ color: colors.error.main }}>SL: ₹{position.stopLoss.toFixed(2)}</span>
                )}
                {position.target && (
                  <span style={{ color: colors.success.main }}>
                    Target: ₹{position.target.toFixed(2)}
                  </span>
                )}
              </div>
            ) : null}
          </motion.div>
        ))}

        {positions.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: spacing.xxl,
              color: colors.neutral[7],
              fontSize: typography.label.default.regular.fontSize,
            }}
          >
            No open positions
          </div>
        )}
      </div>
    </motion.div>
  );
};
