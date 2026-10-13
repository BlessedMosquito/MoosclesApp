'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ReactNode, useState } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import ArrowIcon from '@/components/icons/ArrowIcon';

export type DropdownOption = {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  separator?: boolean;
  disabled?: boolean;
};

const DEFAULT_OPTION_HEIGHT = 37;
const MAX_VISIBLE_OPTIONS = 6;

type DropdownProps = {
  label: string;
  options: DropdownOption[];
  width?: string | number;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  readOnly?: boolean;
};

export default function Dropdown({
  label,
  options,
  width,
  isOpen,
  onOpenChange,
  readOnly = false,
}: DropdownProps) {
  const { scale } = useResponsive();
  const [internalOpen, setInternalOpen] = useState(false);

  const controlled = isOpen !== undefined && onOpenChange !== undefined;
  const open = !readOnly && (controlled ? isOpen : internalOpen);

  const setOpen = (value: boolean) => {
    if (readOnly) return;
    if (controlled) {
      onOpenChange?.(value);
      return;
    }
    setInternalOpen(value);
  };

  const close = () => setOpen(false);

  const needsScroll = options.length > MAX_VISIBLE_OPTIONS;
  const optionHeight = s(DEFAULT_OPTION_HEIGHT, scale);
  const maxListHeight = optionHeight * MAX_VISIBLE_OPTIONS;

  return (
    <div
      style={{
        position: 'relative',
        display: width ? 'block' : 'inline-block',
        width,
      }}
    >
      <motion.button
        whileTap={readOnly ? undefined : { scale: 0.97 }}
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          width: width ? '100%' : 'auto',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: s(8, scale),
          height: s(14, scale) * 2 + Math.max(s(fontSizes.input, scale), 16) * 1.25,
          boxSizing: 'border-box',
          padding: `0 ${s(16, scale)}px`,
          borderRadius: s(14, scale),
          background: colors.componentsBg,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          fontSize: Math.max(s(fontSizes.input, scale), 16),
          fontWeight: 600,
          cursor: readOnly ? 'default' : 'pointer',
          userSelect: 'none',
          outline: 'none',
          opacity: readOnly ? 0.75 : 1,
        }}
      >
        <span>{label}</span>
        {!readOnly && (
          <motion.div
            animate={{ rotate: open ? 0 : 180 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: colors.textMuted,
            }}
          >
            <ArrowIcon />
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence mode="popLayout">
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -s(10, scale), scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -s(10, scale), scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              marginTop: s(8, scale),
              minWidth: s(220, scale),
              maxHeight: needsScroll ? maxListHeight : 'none',
              overflowY: needsScroll ? 'auto' : 'visible',
              padding: s(6, scale),
              borderRadius: s(14, scale),
              border: `1px solid ${colors.border}`,
              background: colors.componentsBg,
              boxShadow: `0 ${s(16, scale)}px ${s(40, scale)}px ${colors.shadow}`,
              zIndex: 50,
            }}
          >
            {options.map((option, index) => (
              <motion.div
                key={option.key}
                initial={false}
                exit={{ opacity: 0 }}
              >
                {option.separator && index > 0 ? (
                  <div
                    style={{
                      height: 1,
                      background: colors.border,
                      margin: `${s(4, scale)}px ${s(8, scale)}px`,
                    }}
                  />
                ) : null}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (option.disabled) return;
                    close();
                    option.onSelect();
                  }}
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    gap: s(10, scale),
                    padding: `${s(10, scale)}px ${s(10, scale)}px`,
                    borderRadius: s(10, scale),
                    background: 'transparent',
                    border: 'none',
                    color: colors.text,
                    fontSize: s(fontSizes.bodySmall, scale),
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: option.disabled ? 'default' : 'pointer',
                    opacity: option.disabled ? 0.4 : 1,
                  }}
                  whileHover={{
                    background: option.disabled ? 'transparent' : colors.tileBg,
                  }}
                >
                  {option.icon && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: colors.textMuted,
                      }}
                    >
                      {option.icon}
                    </span>
                  )}
                  <span>{option.label}</span>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
