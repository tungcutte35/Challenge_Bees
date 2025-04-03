export interface TUser {
  id: string;
  name: string;
  balance: number;
  email: string;
  registerAt: Date;
  active: boolean;
}

export interface TableState {
  currentPage: number;
  rowsPerPage: number;
  sortField: keyof TUser | null;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  selectedRows: Set<string>;
}

export interface Column {
  key: keyof TUser;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: TUser) => React.ReactNode;
}