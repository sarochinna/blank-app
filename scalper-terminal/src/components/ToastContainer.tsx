import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { colors, borderRadius, spacing, typography, animations, shadows } from '../design-tokens';
import { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={colors.success.main} />;
      case 'error':
        return <XCircle size={20} color={colors.error.main} />;
      case 'info':
        return <Info size={20} color={colors.primary.main} />;
    }
  };

  const getToastColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: colors.success.surface,
          border: colors.success.border,
          text: colors.success.main,
        };
      case 'error':
        return {
          bg: colors.error.surface,
          border: colors.error.border,
          text: colors.error.main,
        };
      case 'info':
        return {
          bg: colors.primary.surface,
          border: colors.primary.border,
          text: colors.primary.main,
        };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: spacing.lg,
        right: spacing.lg,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const toastColors = getToastColors(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{
                initial: animations.toastFadeIn,
                exit: animations.toastFadeOut,
              }}
              style={{
                backgroundColor: toastColors.bg,
                border: `1px solid ${toastColors.border}`,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                minWidth: '300px',
                maxWidth: '400px',
                boxShadow: shadows.lg,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                pointerEvents: 'auto',
              }}
            >
              {getToastIcon(toast.type)}
              <div
                style={{
                  flex: 1,
                  fontSize: typography.label.default.medium.fontSize,
                  fontWeight: typography.label.default.medium.fontWeight,
                  color: colors.neutral[10],
                }}
              >
                {toast.message}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
