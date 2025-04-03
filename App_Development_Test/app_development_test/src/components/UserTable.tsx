import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { TUser, TableState, Column } from '../types/User';
import './UserTable.css';
import { FaMoon, FaPen, FaSun, FaTrash } from 'react-icons/fa';

interface UserTableProps {
  darkMode: boolean;
  onThemeToggle: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ darkMode, onThemeToggle }) => {
  const [users, setUsers] = useState<TUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableState, setTableState] = useState<TableState>({
    currentPage: 0,
    rowsPerPage: 10,
    sortField: null,
    sortDirection: 'asc',
    searchQuery: '',
    selectedRows: new Set<string>(),
  });

  const columns: Column[] = [
    {
      key: 'name' as keyof TUser,
      label: '',
      width: '24px',
      render: (_, row) => (
        <input
          type="checkbox"
          checked={tableState.selectedRows.has(row.id)}
          onChange={() => handleRowSelect(row.id)}
        />
      ),
    },
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'balance',
      label: 'Balance ($)',
      sortable: true,
      render: (value: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value: string) => (
        <a href={`mailto:${value}`} className="email-link">
          {value}
        </a>
      ),
    },
    {
      key: 'registerAt',
      label: 'Registration',
      sortable: true,
      render: (value: Date) => (
        <span title={format(value, 'yyyy-MM-dd HH:mm:ss')}>
          {format(value, 'yyyy-MM-dd')}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`status-badge ${value ? 'active' : 'inactive'}`}>
          Status
        </span>
      ),
    },
    {
      key: 'id',
      label: 'ACTION',
      render: () => (
        <div className="action-buttons">
          <button className="action-btn">
            <FaPen />
          </button>
          <button className="action-btn">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://dummyjson.com/users?limit=100');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedUsers: TUser[] = data.users.map((user: any) => ({
        id: user.id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        balance: Math.floor(Math.random() * 10000),
        email: user.email,
        registerAt: new Date(user.birthDate || Date.now()),
        active: Math.random() > 0.5,
      }));
      setUsers(formattedUsers);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to fetch users: ${err.message}`
          : 'An unexpected error occurred while fetching users'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter((user) =>
        Object.values(user)
          .filter((value) => typeof value !== 'boolean')
          .some((value) =>
            value
              .toString()
              .toLowerCase()
              .includes(tableState.searchQuery.toLowerCase())
          )
      )
      .sort((a, b) => {
        if (!tableState.sortField) return 0;

        const aValue = a[tableState.sortField];
        const bValue = b[tableState.sortField];
        const direction = tableState.sortDirection === 'asc' ? 1 : -1;

        if (aValue instanceof Date && bValue instanceof Date) {
          return (aValue.getTime() - bValue.getTime()) * direction;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * direction;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ((aValue as any) - (bValue as any)) * direction;
      });
  }, [
    users,
    tableState.searchQuery,
    tableState.sortField,
    tableState.sortDirection,
  ]);

  const paginatedUsers = useMemo(() => {
    const startIndex = tableState.currentPage * tableState.rowsPerPage;
    return filteredAndSortedUsers.slice(
      startIndex,
      startIndex + tableState.rowsPerPage
    );
  }, [filteredAndSortedUsers, tableState.currentPage, tableState.rowsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedUsers.length / tableState.rowsPerPage
  );

  const handleSort = (field: keyof TUser) => {
    setTableState((prev) => ({
      ...prev,
      sortField: field,
      sortDirection:
        prev.sortField === field && prev.sortDirection === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleRowSelect = (id: string) => {
    setTableState((prev) => {
      const newSelected = new Set(prev.selectedRows);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { ...prev, selectedRows: newSelected };
    });
  };

  const handleSelectAll = () => {
    setTableState((prev) => ({
      ...prev,
      selectedRows:
        prev.selectedRows.size === filteredAndSortedUsers.length
          ? new Set()
          : new Set(filteredAndSortedUsers.map((user) => user.id)),
    }));
  };

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchUsers} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`user-table-container ${darkMode ? 'dark' : ''}`}>
      <div className='theme-toggle-container'>
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>
      <div className="table-controls">
        <div className="controls-group">
          <select
            value={tableState.sortField || ''}
            onChange={(e) => handleSort(e.target.value as keyof TUser)}
            className="sort-select"
          >
            <option value="">Sort by...</option>
            {columns
              .filter((col) => col.sortable)
              .map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
          </select>
          <input
            type="text"
            placeholder=" Search by name or email..."
            value={tableState.searchQuery}
            onChange={(e) =>
              setTableState((prev) => ({
                ...prev,
                searchQuery: e.target.value,
                currentPage: 0,
              }))
            }
            className="search-input"
          />
          <select
            value={tableState.rowsPerPage}
            onChange={(e) =>
              setTableState((prev) => ({
                ...prev,
                rowsPerPage: Number(e.target.value),
                currentPage: 0,
              }))
            }
            className="rows-per-page-select"
          >
            <option value={5}>5 page</option>
            <option value={10}>10 page</option>
            <option value={20}>20 page</option>
            <option value={25}>25 page</option>
            <option value={50}>50 page</option>
            <option value={100}>100 page</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="col-checkbox">
                <input
                  type="checkbox"
                  checked={
                    tableState.selectedRows.size ===
                    filteredAndSortedUsers.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              {columns.slice(1).map((column) => (
                <th
                  key={column.key}
                  className={`col-${column.key} ${
                    column.sortable ? 'sortable' : ''
                  }`}
                >
                  {column.label}
                  {column.sortable && tableState.sortField === column.key && (
                    <span className="sort-indicator">
                      {tableState.sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="loading-cell">
                  <div className="loading-spinner" />
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={
                    tableState.selectedRows.has(user.id) ? 'selected' : ''
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={`${user.id}-${column.key}`}
                      className={`col-${column.key}`}
                    >
                      {column.render
                        ? column.render(user[column.key], user)
                        : String(user[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button
          onClick={() =>
            setTableState((prev) => ({
              ...prev,
              currentPage: prev.currentPage - 1,
            }))
          }
          disabled={tableState.currentPage === 0}
          className="pagination-button"
        >
          &lt;
        </button>
        {(() => {
          const pages = [];
          const currentPage = tableState.currentPage;

          pages.push(
            <button
              key={0}
              onClick={() =>
                setTableState((prev) => ({ ...prev, currentPage: 0 }))
              }
              className={`pagination-button ${
                currentPage === 0 ? 'active' : ''
              }`}
            >
              1
            </button>
          );

          const startPage = Math.max(1, currentPage - 1);
          const endPage = Math.min(totalPages - 2, currentPage + 1);

          if (startPage > 1) {
            pages.push(
              <span key="ellipsis1" className="pagination-ellipsis">
                ...
              </span>
            );
          }

          for (let i = startPage; i <= endPage; i++) {
            pages.push(
              <button
                key={i}
                onClick={() =>
                  setTableState((prev) => ({ ...prev, currentPage: i }))
                }
                className={`pagination-button ${
                  currentPage === i ? 'active' : ''
                }`}
              >
                {i + 1}
              </button>
            );
          }

          if (endPage < totalPages - 2) {
            pages.push(
              <span key="ellipsis2" className="pagination-ellipsis">
                ...
              </span>
            );
          }

          if (totalPages > 1) {
            pages.push(
              <button
                key={totalPages - 1}
                onClick={() =>
                  setTableState((prev) => ({
                    ...prev,
                    currentPage: totalPages - 1,
                  }))
                }
                className={`pagination-button ${
                  currentPage === totalPages - 1 ? 'active' : ''
                }`}
              >
                {totalPages}
              </button>
            );
          }

          return pages;
        })()}
        <button
          onClick={() =>
            setTableState((prev) => ({
              ...prev,
              currentPage: prev.currentPage + 1,
            }))
          }
          disabled={tableState.currentPage >= totalPages - 1}
          className="pagination-button"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default UserTable;
