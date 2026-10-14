'use client';

import { Fragment, ReactNode, useMemo } from 'react';
import { motion } from 'motion/react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import type { CSSProperties } from 'react';

type CellAlign = 'left' | 'center' | 'right';

export type GridColumn<T> = {
  key: string;
  header?: string;
  render?: (item: T, index: number) => ReactNode;
  align?: CellAlign;
  width?: string | number;
};

type GridProps<T> = {
  columns: number;
  data: T[];
  columnConfig?: GridColumn<T>[];
  keyExtractor?: (item: T, index: number) => string;
  showHeader?: boolean;
  gap?: number;
  columnGap?: number;
  padding?: number;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  numberedRows?: boolean;
  rowBorderColor?: (item: T, index: number) => string | undefined;
  style?: CSSProperties;
};

const alignMap: Record<CellAlign, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const textAlignMap: Record<CellAlign, CSSProperties['textAlign']> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

export default function Grid<T>({
  columns,
  data,
  columnConfig,
  keyExtractor,
  showHeader = true,
  gap,
  columnGap,
  padding,
  emptyMessage = 'No data',
  onRowClick,
  numberedRows = false,
  rowBorderColor,
  style,
}: GridProps<T>) {
  const { isMobile, scale } = useResponsive();

  const resolvedGap = gap ?? 0;
  const resolvedColumnGap = columnGap ?? (isMobile ? 8 : 12);
  const resolvedPadding = padding ?? (isMobile ? 10 : 14);

  const resolvedColumns = useMemo<GridColumn<T>[]>(() => {
    if (columnConfig && columnConfig.length > 0) {
      return columnConfig;
    }
    return Array.from({ length: columns }, (_, index) => ({
      key: String(index),
    }));
  }, [columnConfig, columns]);

  const templateColumns = resolvedColumns
    .map((column) => column.width ?? 'minmax(0, 1fr)')
    .join(' ');

  const rowNumberWidth = s(28, scale);
  const gridTemplateColumns = numberedRows
    ? `${rowNumberWidth}px ${templateColumns}`
    : templateColumns;

  const renderCell = (item: T, column: GridColumn<T>, index: number) => {
    if (column.render) {
      return column.render(item, index);
    }

    const value = (item as Record<string, unknown>)[column.key];

    return value === null || value === undefined ? '' : String(value);
  };

  const headerLabels = resolvedColumns.map(
    (column) => column.header ?? column.key
  );

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {showHeader && data.length > 0 && (
        <div
          style={{
            flexShrink: 0,
            display: 'grid',
            gridTemplateColumns,
            columnGap: s(resolvedColumnGap, scale),
            padding: `0 ${s(resolvedPadding, scale)}px ${s(
              resolvedPadding,
              scale
            )}px`,
            borderBottom: `1px solid ${colors.border}`,
            background: colors.bg,
          }}
        >
          {numberedRows && <div />}
          {resolvedColumns.map((column, index) => (
            <div
              key={column.key}
              style={{
                minWidth: 0,
                display: 'flex',
                justifyContent: alignMap[column.align ?? 'left'],
                color: colors.textMuted,
                fontSize: s(fontSizes.caption, scale),
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textAlign: textAlignMap[column.align ?? 'left'],
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {headerLabels[index]}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
          rowGap: s(resolvedGap, scale),
        }}
      >
        {data.length === 0 ? (
          <div
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${s(resolvedPadding * 2, scale)}px ${s(
                resolvedPadding,
                scale
              )}px`,
              color: colors.textMuted,
              fontSize: s(fontSizes.bodySmall, scale),
              textAlign: 'center',
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          data.map((item, rowIndex) => (
            <Fragment
              key={
                keyExtractor ? keyExtractor(item, rowIndex) : String(rowIndex)
              }
            >
              {rowIndex > 0 && (
                <div
                  style={{
                    flexShrink: 0,
                    height: 2,
                    background: 'transparent',
                  }}
                />
              )}
              <motion.div
                onClick={
                  onRowClick ? () => onRowClick(item, rowIndex) : undefined
                }
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(event) => {
                  if (
                    onRowClick &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault();
                    onRowClick(item, rowIndex);
                  }
                }}
                whileTap={onRowClick ? { scale: 0.98 } : undefined}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: gridTemplateColumns,
                  columnGap: s(resolvedColumnGap, scale),
                  padding: `${s(resolvedPadding * 1.5, scale)}px ${s(
                    resolvedPadding,
                    scale
                  )}px`,
                  border: `1px solid ${
                    rowBorderColor?.(item, rowIndex) ?? 'transparent'
                  }`,
                  borderRadius: s(10, scale),
                  boxSizing: 'border-box',
                  background:
                    rowIndex % 2 === 1 ? colors.componentsBg : 'transparent',
                  color: colors.text,
                  fontSize: s(fontSizes.bodySmall, scale),
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
              >
                {numberedRows && (
                  <div
                    style={{
                      minWidth: 0,
                      display: 'flex',
                      justifyContent: 'flex-start',
                      color: colors.textMuted,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {rowIndex + 1}
                  </div>
                )}
                {resolvedColumns.map((column) => (
                  <div
                    key={column.key}
                    style={{
                      minWidth: 0,
                      display: 'flex',
                      justifyContent: alignMap[column.align ?? 'left'],
                      textAlign: textAlignMap[column.align ?? 'left'],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {renderCell(item, column, rowIndex)}
                  </div>
                ))}
              </motion.div>
            </Fragment>
          ))
        )}
      </div>
    </div>
  );
}
