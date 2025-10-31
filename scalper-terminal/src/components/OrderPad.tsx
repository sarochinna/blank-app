import { useState } from 'react';
import { motion } from 'framer-motion';
import { colors, borderRadius, spacing, typography } from '../design-tokens';
import { ProductType, OrderSide } from '../types';

interface OrderPadProps {
  onOrder: (quantity: number, price: number, productType: ProductType, side: OrderSide) => void;
  onExit: () => void;
  hasPositions: boolean;
}

export const OrderPad: React.FC<OrderPadProps> = ({ onOrder, onExit, hasPositions }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [productType, setProductType] = useState<ProductType>('MIS');

  const handleBuy = () => {
    onOrder(quantity, price, productType, 'BUY');
  };

  const handleSell = () => {
    onOrder(quantity, price, productType, 'SELL');
  };

  const buttonBaseStyle = {
    padding: `${spacing.md} ${spacing.xl}`,
    borderRadius: borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    fontSize: typography.button.default.fontSize,
    fontWeight: typography.button.default.fontWeight,
    letterSpacing: '1.25%',
    transition: 'all 0.2s ease',
    flex: 1,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      style={{
        backgroundColor: colors.neutral[1],
        border: `1px solid ${colors.neutral[4]}`,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        display: 'flex',
        gap: spacing.lg,
        alignItems: 'center',
      }}
    >
      {/* Quantity Input */}
      <div style={{ flex: 1 }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.label.small.medium.fontSize,
            color: colors.neutral[8],
            marginBottom: spacing.xs,
          }}
        >
          Quantity
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          style={{
            width: '100%',
            padding: spacing.sm,
            backgroundColor: colors.neutral[2],
            border: `1px solid ${colors.neutral[5]}`,
            borderRadius: borderRadius.md,
            color: colors.neutral[10],
            fontSize: typography.label.default.medium.fontSize,
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = colors.primary.main)}
          onBlur={(e) => (e.target.style.borderColor = colors.neutral[5])}
        />
      </div>

      {/* Price Input */}
      <div style={{ flex: 1 }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.label.small.medium.fontSize,
            color: colors.neutral[8],
            marginBottom: spacing.xs,
          }}
        >
          Price
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          step="0.05"
          style={{
            width: '100%',
            padding: spacing.sm,
            backgroundColor: colors.neutral[2],
            border: `1px solid ${colors.neutral[5]}`,
            borderRadius: borderRadius.md,
            color: colors.neutral[10],
            fontSize: typography.label.default.medium.fontSize,
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = colors.primary.main)}
          onBlur={(e) => (e.target.style.borderColor = colors.neutral[5])}
        />
      </div>

      {/* Product Type Dropdown */}
      <div style={{ flex: 1 }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.label.small.medium.fontSize,
            color: colors.neutral[8],
            marginBottom: spacing.xs,
          }}
        >
          Product
        </label>
        <select
          value={productType}
          onChange={(e) => setProductType(e.target.value as ProductType)}
          style={{
            width: '100%',
            padding: spacing.sm,
            backgroundColor: colors.neutral[2],
            border: `1px solid ${colors.neutral[5]}`,
            borderRadius: borderRadius.md,
            color: colors.neutral[10],
            fontSize: typography.label.default.medium.fontSize,
            outline: 'none',
            cursor: 'pointer',
          }}
          onFocus={(e) => (e.target.style.borderColor = colors.primary.main)}
          onBlur={(e) => (e.target.style.borderColor = colors.neutral[5])}
        >
          <option value="MIS">MIS</option>
          <option value="NRML">NRML</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: spacing.md, flex: 2 }}>
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: colors.success.hover }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBuy}
          style={{
            ...buttonBaseStyle,
            backgroundColor: colors.success.main,
            color: colors.neutral[1],
          }}
        >
          BUY
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: colors.error.hover }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSell}
          style={{
            ...buttonBaseStyle,
            backgroundColor: colors.error.main,
            color: colors.neutral[1],
          }}
        >
          SELL
        </motion.button>

        <motion.button
          whileHover={{
            scale: 1.02,
            backgroundColor: hasPositions ? colors.neutral[3] : colors.neutral[2],
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onExit}
          disabled={!hasPositions}
          style={{
            ...buttonBaseStyle,
            backgroundColor: colors.neutral[2],
            color: hasPositions ? colors.neutral[10] : colors.neutral[6],
            cursor: hasPositions ? 'pointer' : 'not-allowed',
          }}
        >
          EXIT
        </motion.button>
      </div>
    </motion.div>
  );
};
