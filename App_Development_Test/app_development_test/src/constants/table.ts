export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const STATUS_COLORS = {
  active: {
    background: '#E6F4EA',
    color: '#1E4620',
  },
  inactive: {
    background: '#FEEEE9',
    color: '#B31412',
  },
} as const;