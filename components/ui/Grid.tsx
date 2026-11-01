'use client';

import { CSSProperties, Fragment, ReactNode, useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type CellAlign = 'left' | 'center' | 'right';

export type GridColumn<T> = {
  key: string;
  header?: string;
  render?: (item: T, index: number) => ReactNode;
  align?: CellAlign;
  width?: string;
};

type GridProps<T> = {
  columns: number;
  data: T[];
  columnConfig?: GridColumn<T>[];
  keyExtractor?: (item: T, index: number) => string;
  showHeader?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  numberedRows?: boolean;
  rowBorderColor?: (item: T, index: number) => string | undefined;
};

const alignClass: Record<CellAlign, string> = {
  left: 'grid-cell-left',
  center: 'grid-cell-center',
  right: 'grid-cell-right',
};

export default function Grid<T>({
  columns,
  data,
  columnConfig,
  keyExtractor,
  showHeader = true,
  emptyMessage = 'No data',
  onRowClick,
  numberedRows = false,
  rowBorderColor,
}: GridProps<T>) {
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

  const gridStyle = {
    '--grid-columns': numberedRows
      ? `28px ${templateColumns}`
      : templateColumns,
  } as CSSProperties;

  const renderCell = (item: T, column: GridColumn<T>, index: number) => {
    if (column.render) {
      return column.render(item, index);
    }

    const value = (item as Record<string, unknown>)[column.key];

    return value === null || value === undefined ? '' : String(value);
  };

  return (
    <div className="data-grid" style={gridStyle}>
      {showHeader && data.length > 0 && (
        <div className="data-grid-header">
          {numberedRows && <div />}
          {resolvedColumns.map((column) => (
            <div
              key={column.key}
              className={cn(
                'data-grid-header-cell',
                alignClass[column.align ?? 'left']
              )}
            >
              {column.header ?? column.key}
            </div>
          ))}
        </div>
      )}

      <div className="data-grid-body">
        {data.length === 0 ? (
          <div className="data-grid-empty">{emptyMessage}</div>
        ) : (
          data.map((item, rowIndex) => (
            <Fragment
              key={
                keyExtractor ? keyExtractor(item, rowIndex) : String(rowIndex)
              }
            >
              {rowIndex > 0 && <div className="data-grid-spacer" />}
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
                className={cn(
                  'data-grid-row',
                  rowIndex % 2 === 1 && 'bg-surface',
                  onRowClick && 'cursor-pointer'
                )}
                style={{ borderColor: rowBorderColor?.(item, rowIndex) }}
              >
                {numberedRows && (
                  <div className="data-grid-row-number">{rowIndex + 1}</div>
                )}
                {resolvedColumns.map((column) => (
                  <div
                    key={column.key}
                    className={cn(
                      'data-grid-cell',
                      alignClass[column.align ?? 'left']
                    )}
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
