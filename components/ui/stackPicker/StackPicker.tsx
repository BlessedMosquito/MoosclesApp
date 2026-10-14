'use client';

import { CSSProperties, useState } from 'react';
import { motion } from 'motion/react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import ArrowIcon from '@/components/icons/ArrowIcon';
import CheckIcon from '@/components/icons/CheckIcon';

const CARD_HEIGHT = 60;
const CARD_GAP = 8;
const CARD_OVERLAP = 14;
const VISIBLE_STACK = 3;
const MAX_OPEN_HEIGHT = 300;

const springTransition = {
  type: 'spring' as const,
  stiffness: 140,
  damping: 14,
  mass: 1,
};

export type StackPickerOption = {
  value: string;
  label: string;
};

type StackPickerProps = {
  options: StackPickerOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function StackPicker({
  options,
  value,
  onChange,
}: StackPickerProps) {
  const { scale } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  const handleSelect = (option: StackPickerOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const stackOptions = [
    selectedOption ?? options[0] ?? null,
    ...options.filter(
      (option) => option.value !== (selectedOption ?? options[0])?.value
    ),
  ]
    .filter((option): option is StackPickerOption => option !== null)
    .slice(0, VISIBLE_STACK);

  const cardHeight = s(CARD_HEIGHT, scale);
  const gap = s(CARD_GAP, scale);
  const overlap = s(CARD_OVERLAP, scale);
  const maxOpenHeight = s(MAX_OPEN_HEIGHT, scale);

  const stackHeight =
    cardHeight + overlap * Math.max(stackOptions.length - 1, 0);

  const contentHeight =
    options.length * cardHeight + Math.max(options.length - 1, 0) * gap;

  const openHeight = Math.min(contentHeight, maxOpenHeight);

  const headerStyle: CSSProperties = {
    position: 'absolute',
    top: -s(48, scale),
    left: 0,
    height: s(28, scale),
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  };

  const headerTitleStyle: CSSProperties = {
    fontSize: s(18, scale),
    lineHeight: 1,
    marginLeft: s(8, scale),
    color: colors.text,
    fontWeight: 600,
  };

  const headerCloseStyle: CSSProperties = {
    fontSize: s(14, scale),
    lineHeight: 1,
    marginRight: s(8, scale),
    backgroundColor: colors.componentsBg,
    padding: '4px 12px',
    height: s(20, scale),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    cursor: 'pointer',
    pointerEvents: 'auto',
    userSelect: 'none',
    border: `1px solid ${colors.border}`,
    color: colors.text,
  };

  const cardLabelStyle = (isSelected: boolean): CSSProperties => ({
    fontSize: Math.max(s(fontSizes.body, scale), 16),
    fontWeight: isSelected ? 700 : 400,
    color: colors.text,
    textAlign: 'center',
    padding: `0 ${s(16, scale)}px`,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  });

  const cardBaseStyle: CSSProperties = {
    width: '90%',
    height: cardHeight,
    margin: '0 auto',
    boxSizing: 'border-box',
    background: colors.componentsBg,
    border: `1px solid ${colors.border}`,
    borderRadius: s(16, scale),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text,
    userSelect: 'none',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <motion.span
          initial={false}
          animate={{
            opacity: 1,
          }}
          transition={springTransition}
          style={headerTitleStyle}
        >
          {`Selected: ${selectedOption?.label}`}
        </motion.span>

        <motion.button
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0.85,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          transition={springTransition}
          style={headerCloseStyle}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(false);
          }}
        >
          Collapse
        </motion.button>
      </div>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? openHeight : stackHeight,
        }}
        transition={springTransition}
        style={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 0 : 1,
            scale: isOpen ? 0.96 : 1,
            pointerEvents: isOpen ? 'none' : 'auto',
          }}
          transition={springTransition}
          style={{
            position: 'absolute',
            top: 0,
            right: '5%',
            width: '100%',
            height: stackHeight,
          }}
        >
          {stackOptions.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <motion.div
                key={option.value}
                initial={false}
                animate={{
                  top: index * overlap,
                  scale: 1 - index * 0.015,
                  opacity: index === 0 ? 1 : 0.4,
                }}
                transition={springTransition}
                style={{
                  ...cardBaseStyle,
                  position: 'absolute',
                  left: '10%',
                  zIndex: VISIBLE_STACK - index,
                }}
                onClick={() => {
                  if (index === 0) {
                    setIsOpen(true);
                    return;
                  }

                  handleSelect(option);
                }}
              >
                <span style={cardLabelStyle(isSelected)}>{option.label}</span>

                {index === 0 && (
                  <motion.span
                    initial={false}
                    animate={{
                      rotate: 180,
                      scale: 1,
                    }}
                    transition={springTransition}
                    style={{
                      position: 'absolute',
                      right: s(16, scale),
                      color: colors.accent,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ArrowIcon />
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            scaleY: isOpen ? 1 : 0.96,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          transition={springTransition}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: openHeight,
            transformOrigin: 'top center',
          }}
        >
          <div
            style={{
              width: '100%',
              height: openHeight,
              overflowY: contentHeight > openHeight ? 'auto' : 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap,
              padding: `0 ${s(2, scale)}px`,
              boxSizing: 'border-box',

              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)',

              maskImage:
                'linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)',
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <motion.div
                  key={option.value}
                  initial={false}
                  whileTap={{
                    scale: 0.98,
                  }}
                  transition={springTransition}
                  style={{
                    ...cardBaseStyle,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                  onClick={() => handleSelect(option)}
                >
                  <span style={cardLabelStyle(isSelected)}>{option.label}</span>

                  {isSelected && (
                    <motion.span
                      initial={{
                        opacity: 0,
                        scale: 0.5,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={springTransition}
                      style={{
                        position: 'absolute',
                        right: s(16, scale),
                        color: colors.accent,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CheckIcon />
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
