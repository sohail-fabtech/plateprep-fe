import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useMemo } from 'react';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Table,
  Divider,
  TableBody,
  Container,
  TableContainer,
  Box,
  Typography,
  TableRow,
  TableCell,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IProcessAudit, IAccessLog } from '../../@types/tracking';
// _mock_
import { _processAuditList, _accessLogList } from '../../_mock/arrays';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../components/table';
// sections
import {
  ProcessAuditTableRow,
  ProcessAuditTableToolbar,
} from '../../sections/@dashboard/tracking/processAudit';
import { AccessLogTableRow, AccessLogTableToolbar } from '../../sections/@dashboard/tracking/accessLog';

// ----------------------------------------------------------------------

// Consistent form input styling
const FORM_INPUT_SX = {
  '& .MuiInputBase-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiInputLabel-root': {
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  },
  '& .MuiFormHelperText-root': {
    fontSize: { xs: '0.75rem', md: '0.75rem' },
  },
};

// Process Audit Table head configuration
const PROCESS_AUDIT_TABLE_HEAD = [
  { id: 'module', label: 'Module', align: 'left' },
  { id: 'object', label: 'Object', align: 'left' },
  { id: 'changedBy', label: 'Changed By', align: 'left' },
  { id: 'role', label: 'Role', align: 'left' },
  { id: 'email', label: 'Email', align: 'left' },
  { id: 'action', label: 'Action', align: 'left' },
  { id: 'dateTime', label: 'Date & Time', align: 'left' },
  { id: 'restaurant', label: 'Restaurant', align: 'left' },
];

// Access Log Table head configuration
const ACCESS_LOG_TABLE_HEAD = [
  { id: 'user', label: 'User', align: 'left' },
  { id: 'ipAddress', label: 'IP Address', align: 'left' },
  { id: 'userAgent', label: 'User Agent', align: 'left' },
  { id: 'timestamp', label: 'Timestamp', align: 'left' },
];

// Default column visibility for Process Audit
const DEFAULT_PROCESS_AUDIT_COLUMN_VISIBILITY = {
  module: true,
  object: true,
  changedBy: true,
  role: true,
  email: true,
  action: true,
  dateTime: true,
  restaurant: true,
};

// Default column visibility for Access Log
const DEFAULT_ACCESS_LOG_COLUMN_VISIBILITY = {
  user: true,
  ipAddress: true,
  userAgent: true,
  timestamp: true,
};

// LocalStorage keys
const PROCESS_AUDIT_COLUMN_VISIBILITY_KEY = 'processAuditTableColumnVisibility';
const ACCESS_LOG_COLUMN_VISIBILITY_KEY = 'accessLogTableColumnVisibility';
const PROCESS_AUDIT_DENSE_KEY = 'processAuditTableDense';
const ACCESS_LOG_DENSE_KEY = 'accessLogTableDense';

// ----------------------------------------------------------------------

type TableType = 'processAudit' | 'accessLog';

export default function TrackingAnalyticsPage() {
  const { themeStretch } = useSettingsContext();

  const [currentTable, setCurrentTable] = useState<TableType>('processAudit');
  const [filterName, setFilterName] = useState('');

  // Process Audit table state
  const processAuditTable = useTable({
    defaultOrderBy: 'timestamp',
    defaultDense: (() => {
      try {
        const saved = localStorage.getItem(PROCESS_AUDIT_DENSE_KEY);
        return saved ? JSON.parse(saved) : false;
      } catch {
        return false;
      }
    })(),
  });

  // Access Log table state
  const accessLogTable = useTable({
    defaultOrderBy: 'timestamp',
    defaultDense: (() => {
      try {
        const saved = localStorage.getItem(ACCESS_LOG_DENSE_KEY);
        return saved ? JSON.parse(saved) : false;
      } catch {
        return false;
      }
    })(),
  });

  // Process Audit column visibility
  const [processAuditColumnVisibility, setProcessAuditColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    try {
      const saved = localStorage.getItem(PROCESS_AUDIT_COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROCESS_AUDIT_COLUMN_VISIBILITY;
    } catch {
      return DEFAULT_PROCESS_AUDIT_COLUMN_VISIBILITY;
    }
  });

  // Access Log column visibility
  const [accessLogColumnVisibility, setAccessLogColumnVisibility] = useState<Record<string, boolean>>(
    () => {
      try {
        const saved = localStorage.getItem(ACCESS_LOG_COLUMN_VISIBILITY_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_ACCESS_LOG_COLUMN_VISIBILITY;
      } catch {
        return DEFAULT_ACCESS_LOG_COLUMN_VISIBILITY;
      }
    }
  );

  // Save column visibility to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        PROCESS_AUDIT_COLUMN_VISIBILITY_KEY,
        JSON.stringify(processAuditColumnVisibility)
      );
    } catch (error) {
      console.error('Error saving process audit column visibility:', error);
    }
  }, [processAuditColumnVisibility]);

  useEffect(() => {
    try {
      localStorage.setItem(
        ACCESS_LOG_COLUMN_VISIBILITY_KEY,
        JSON.stringify(accessLogColumnVisibility)
      );
    } catch (error) {
      console.error('Error saving access log column visibility:', error);
    }
  }, [accessLogColumnVisibility]);

  // Save dense mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROCESS_AUDIT_DENSE_KEY, JSON.stringify(processAuditTable.dense));
    } catch (error) {
      console.error('Error saving process audit dense mode:', error);
    }
  }, [processAuditTable.dense]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCESS_LOG_DENSE_KEY, JSON.stringify(accessLogTable.dense));
    } catch (error) {
      console.error('Error saving access log dense mode:', error);
    }
  }, [accessLogTable.dense]);

  // Filter Process Audit data
  const processAuditDataFiltered = useMemo(() => {
    let filtered = [..._processAuditList];

    // Filter by search
    if (filterName) {
      const searchLower = filterName.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.modelName.toLowerCase().includes(searchLower) ||
          item.objectRepr.toLowerCase().includes(searchLower) ||
          item.changedByName.toLowerCase().includes(searchLower) ||
          item.userEmail.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const comparator = getComparator(processAuditTable.order, processAuditTable.orderBy);
    filtered.sort(comparator);

    return filtered;
  }, [filterName, processAuditTable.order, processAuditTable.orderBy]);

  // Filter Access Log data
  const accessLogDataFiltered = useMemo(() => {
    let filtered = [..._accessLogList];

    // Filter by search
    if (filterName) {
      const searchLower = filterName.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.user.fullName.toLowerCase().includes(searchLower) ||
          item.user.email.toLowerCase().includes(searchLower) ||
          item.ipAddress.toLowerCase().includes(searchLower)
      );
    }

    // Sort - handle nested properties
    if (accessLogTable.orderBy) {
      filtered.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        if (accessLogTable.orderBy === 'user') {
          aValue = a.user.fullName.toLowerCase();
          bValue = b.user.fullName.toLowerCase();
        } else if (accessLogTable.orderBy === 'timestamp') {
          aValue = a.timestamp;
          bValue = b.timestamp;
        } else {
          aValue = (a as any)[accessLogTable.orderBy] || '';
          bValue = (b as any)[accessLogTable.orderBy] || '';
        }

        if (bValue < aValue) {
          return accessLogTable.order === 'desc' ? -1 : 1;
        }
        if (bValue > aValue) {
          return accessLogTable.order === 'desc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [filterName, accessLogTable.order, accessLogTable.orderBy]);

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    processAuditTable.setPage(0);
    accessLogTable.setPage(0);
  };

  const handleResetFilter = () => {
    setFilterName('');
  };

  const handleToggleProcessAuditColumn = (columnId: string) => {
    setProcessAuditColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleToggleAccessLogColumn = (columnId: string) => {
    setAccessLogColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const isFiltered = filterName !== '';

  const isProcessAuditNotFound =
    !processAuditDataFiltered.length && !!filterName;
  const isAccessLogNotFound = !accessLogDataFiltered.length && !!filterName;

  const processAuditDenseHeight = processAuditTable.dense ? 52 : 72;
  const accessLogDenseHeight = accessLogTable.dense ? 52 : 72;

  const currentTableData =
    currentTable === 'processAudit' ? processAuditDataFiltered : accessLogDataFiltered;
  const currentTableHead =
    currentTable === 'processAudit' ? PROCESS_AUDIT_TABLE_HEAD : ACCESS_LOG_TABLE_HEAD;
  const currentColumnVisibility =
    currentTable === 'processAudit' ? processAuditColumnVisibility : accessLogColumnVisibility;
  const currentTableState =
    currentTable === 'processAudit' ? processAuditTable : accessLogTable;
  const currentIsNotFound =
    currentTable === 'processAudit' ? isProcessAuditNotFound : isAccessLogNotFound;
  const currentDenseHeight =
    currentTable === 'processAudit' ? processAuditDenseHeight : accessLogDenseHeight;

  return (
    <>
      <Helmet>
        <title> Tracking Analytics | Minimal UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Tracking Analytics"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Tracking', href: PATH_DASHBOARD.tracking },
            { name: 'Analytics' },
          ]}
        />

        {/* Table Selection Tabs */}
        <Card sx={{ mb: { xs: 2, md: 3 } }}>
          <Tabs
            value={currentTable}
            onChange={(event, newValue) => {
              setCurrentTable(newValue);
              setFilterName('');
            }}
            sx={{
              px: { xs: 1.5, sm: 2 },
              bgcolor: 'background.neutral',
              '& .MuiTab-root': {
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                fontWeight: 600,
                minHeight: { xs: 44, md: 48 },
              },
            }}
          >
            <Tab label="Process Auditing" value="processAudit" />
            <Tab label="Access Log" value="accessLog" />
          </Tabs>

          <Divider />

          {/* Toolbar */}
          {currentTable === 'processAudit' ? (
            <ProcessAuditTableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              onFilterName={handleFilterName}
              onResetFilter={handleResetFilter}
              columnVisibility={processAuditColumnVisibility}
              onToggleColumn={handleToggleProcessAuditColumn}
              tableHead={PROCESS_AUDIT_TABLE_HEAD}
              formInputSx={FORM_INPUT_SX}
            />
          ) : (
            <AccessLogTableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              onFilterName={handleFilterName}
              onResetFilter={handleResetFilter}
              columnVisibility={accessLogColumnVisibility}
              onToggleColumn={handleToggleAccessLogColumn}
              tableHead={ACCESS_LOG_TABLE_HEAD}
              formInputSx={FORM_INPUT_SX}
            />
          )}

          {/* Table */}
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar sx={{ maxWidth: '100%' }}>
              <Table
                size={currentTableState.dense ? 'small' : 'medium'}
                sx={{ minWidth: { xs: 800, md: 960 } }}
              >
                <TableHeadCustom
                  order={currentTableState.order}
                  orderBy={currentTableState.orderBy}
                  headLabel={currentTableHead
                    .map((head) => ({
                      ...head,
                      ...(head.id && !currentColumnVisibility[head.id]
                        ? { width: 0, minWidth: 0 }
                        : {}),
                    }))
                    .filter((head) => !head.id || currentColumnVisibility[head.id])}
                  onSort={currentTableState.onSort}
                  sx={{
                    '& .MuiTableCell-root': {
                      px: { xs: 1.5, md: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    },
                    '& .MuiTableSortLabel-root': {
                      cursor: 'pointer !important',
                    },
                    '& .MuiBox-root': {
                      cursor: 'pointer !important',
                    },
                  }}
                />

                <TableBody>
                  {currentTableData
                    .slice(
                      currentTableState.page * currentTableState.rowsPerPage,
                      currentTableState.page * currentTableState.rowsPerPage +
                        currentTableState.rowsPerPage
                    )
                    .map((row) =>
                      currentTable === 'processAudit' ? (
                        <ProcessAuditTableRow
                          key={(row as IProcessAudit).id}
                          row={row as IProcessAudit}
                          columnVisibility={processAuditColumnVisibility}
                          dense={processAuditTable.dense}
                        />
                      ) : (
                        <AccessLogTableRow
                          key={(row as IAccessLog).id}
                          row={row as IAccessLog}
                          columnVisibility={accessLogColumnVisibility}
                          dense={accessLogTable.dense}
                        />
                      )
                    )}

                  <TableEmptyRows
                    height={currentDenseHeight}
                    emptyRows={emptyRows(
                      currentTableState.page,
                      currentTableState.rowsPerPage,
                      currentTableData.length
                    )}
                  />

                  {currentIsNotFound && (
                    <TableRow>
                      <TableCell
                        colSpan={currentTableHead.filter((h) => !h.id || currentColumnVisibility[h.id]).length}
                        sx={{ py: 10 }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            paragraph
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                              fontWeight: 700,
                            }}
                          >
                            No results found
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.8125rem', md: '0.875rem' },
                              color: 'text.secondary',
                            }}
                          >
                            {filterName
                              ? "Try adjusting your search or filter to find what you're looking for."
                              : 'No data available.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.5, md: 2 },
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <TablePaginationCustom
              count={currentTableData.length}
              page={currentTableState.page}
              rowsPerPage={currentTableState.rowsPerPage}
              onPageChange={currentTableState.onChangePage}
              onRowsPerPageChange={currentTableState.onChangeRowsPerPage}
              dense={currentTableState.dense}
              onChangeDense={currentTableState.onChangeDense}
            />
          </Box>
        </Card>
      </Container>
    </>
  );
}
