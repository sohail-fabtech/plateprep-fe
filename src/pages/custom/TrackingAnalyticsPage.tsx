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
  Alert,
  LinearProgress,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { IProcessAudit, IAccessLog } from '../../@types/tracking';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../components/table';
// hooks
import { useDebounce } from '../../hooks/useDebounce';
// services
import { useAccessLogs, AccessLogQueryParams, useAuditLogs, AuditLogQueryParams } from '../../services';
// sections
import {
  ProcessAuditTableRow,
  ProcessAuditTableToolbar,
  ProcessAuditTableSkeleton,
} from '../../sections/@dashboard/tracking/processAudit';
import {
  AccessLogTableRow,
  AccessLogTableToolbar,
  AccessLogTableSkeleton,
} from '../../sections/@dashboard/tracking/accessLog';

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

  // Debounce search input (500ms delay) for both tables
  const debouncedFilterName = useDebounce(filterName, 500);

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

  // Reset to page 0 when debounced search value changes
  useEffect(() => {
    if (currentTable === 'accessLog') {
      accessLogTable.setPage(0);
    } else if (currentTable === 'processAudit') {
      processAuditTable.setPage(0);
    }
  }, [debouncedFilterName, currentTable]);

  // Build API query params for process audit
  const auditLogQueryParams: AuditLogQueryParams = useMemo(() => {
    const params: AuditLogQueryParams = {
      page: processAuditTable.page + 1, // API uses 1-based pagination
      page_size: processAuditTable.rowsPerPage,
      ordering: processAuditTable.orderBy
        ? `${processAuditTable.order === 'desc' ? '-' : ''}${processAuditTable.orderBy}`
        : '-timestamp',
    };

    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    return params;
  }, [
    debouncedFilterName,
    processAuditTable.page,
    processAuditTable.rowsPerPage,
    processAuditTable.order,
    processAuditTable.orderBy,
  ]);

  // Build API query params for access logs
  const accessLogQueryParams: AccessLogQueryParams = useMemo(() => {
    const params: AccessLogQueryParams = {
      page: accessLogTable.page + 1, // API uses 1-based pagination
      page_size: accessLogTable.rowsPerPage,
      ordering: accessLogTable.orderBy
        ? `${accessLogTable.order === 'desc' ? '-' : ''}${accessLogTable.orderBy}`
        : '-timestamp',
    };

    if (debouncedFilterName) {
      params.search = debouncedFilterName;
    }

    return params;
  }, [
    debouncedFilterName,
    accessLogTable.page,
    accessLogTable.rowsPerPage,
    accessLogTable.order,
    accessLogTable.orderBy,
  ]);

  // Fetch audit logs using API - only when processAudit tab is active
  const {
    data: auditLogData,
    isLoading: isLoadingAuditLogs,
    isFetching: isFetchingAuditLogs,
    isError: isErrorAuditLogs,
    error: auditLogError,
  } = useAuditLogs(
    currentTable === 'processAudit' ? auditLogQueryParams : undefined,
    currentTable === 'processAudit' // Only enable when this tab is active
  );

  // Fetch access logs using API - only when accessLog tab is active
  const {
    data: accessLogData,
    isLoading: isLoadingAccessLogs,
    isFetching: isFetchingAccessLogs,
    isError: isErrorAccessLogs,
    error: accessLogError,
  } = useAccessLogs(
    currentTable === 'accessLog' ? accessLogQueryParams : undefined,
    currentTable === 'accessLog' // Only enable when this tab is active
  );

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

  // Process Audit data from API (already filtered and sorted by API)
  const processAuditDataFiltered: IProcessAudit[] = useMemo(() => {
    if (currentTable !== 'processAudit' || !auditLogData?.results) {
      return [];
    }
    // auditLogData.results is already transformed to IProcessAudit[] by the service
    return auditLogData.results;
  }, [currentTable, auditLogData]);

  // Access Log data from API (already filtered and sorted by API)
  // The service already transforms API response to IAccessLog format
  const accessLogDataFiltered: IAccessLog[] = useMemo(() => {
    if (currentTable !== 'accessLog' || !accessLogData?.results) {
      return [];
    }
    // accessLogData.results is already transformed to IAccessLog[] by the service
    return accessLogData.results;
  }, [currentTable, accessLogData]);

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
    !isLoadingAuditLogs &&
    !isFetchingAuditLogs &&
    !isErrorAuditLogs &&
    processAuditDataFiltered.length === 0 &&
    !!filterName;
  const isAccessLogNotFound =
    !isLoadingAccessLogs &&
    !isFetchingAccessLogs &&
    !isErrorAccessLogs &&
    accessLogDataFiltered.length === 0 &&
    !!filterName;

  const processAuditDenseHeight = processAuditTable.dense ? 52 : 72;
  const accessLogDenseHeight = accessLogTable.dense ? 52 : 72;

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

          {/* Linear Progress for fetching */}
          {((currentTable === 'processAudit' && isFetchingAuditLogs) ||
            (currentTable === 'accessLog' && isFetchingAccessLogs)) && <LinearProgress />}

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
                  {/* Loading state - Show skeleton rows */}
                  {currentTable === 'processAudit' && isLoadingAuditLogs && (
                    <>
                      {Array.from({ length: processAuditTable.rowsPerPage }).map((_, index) => (
                        <ProcessAuditTableSkeleton
                          key={`skeleton-${index}`}
                          columnVisibility={processAuditColumnVisibility}
                          dense={processAuditTable.dense}
                        />
                      ))}
                    </>
                  )}

                  {currentTable === 'accessLog' && isLoadingAccessLogs && (
                    <>
                      {Array.from({ length: accessLogTable.rowsPerPage }).map((_, index) => (
                        <AccessLogTableSkeleton
                          key={`skeleton-${index}`}
                          columnVisibility={accessLogColumnVisibility}
                          dense={accessLogTable.dense}
                        />
                      ))}
                    </>
                  )}

                  {/* Error state for process audit */}
                  {currentTable === 'processAudit' && isErrorAuditLogs && !isLoadingAuditLogs && (
                    <TableRow>
                      <TableCell
                        colSpan={currentTableHead.filter((h) => !h.id || currentColumnVisibility[h.id]).length}
                        sx={{ py: 10 }}
                      >
                        <Alert severity="error">
                          {auditLogError instanceof Error
                            ? auditLogError.message
                            : 'Failed to load audit logs. Please try again.'}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Error state for access logs */}
                  {currentTable === 'accessLog' && isErrorAccessLogs && !isLoadingAccessLogs && (
                    <TableRow>
                      <TableCell
                        colSpan={currentTableHead.filter((h) => !h.id || currentColumnVisibility[h.id]).length}
                        sx={{ py: 10 }}
                      >
                        <Alert severity="error">
                          {accessLogError instanceof Error
                            ? accessLogError.message
                            : 'Failed to load access logs. Please try again.'}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Data rows */}
                  {currentTable === 'processAudit' &&
                    !isLoadingAuditLogs &&
                    !isErrorAuditLogs &&
                    processAuditDataFiltered.map((row) => (
                      <ProcessAuditTableRow
                        key={row.id}
                        row={row}
                        columnVisibility={processAuditColumnVisibility}
                        dense={processAuditTable.dense}
                      />
                    ))}

                  {currentTable === 'accessLog' &&
                    !isLoadingAccessLogs &&
                    !isErrorAccessLogs &&
                    accessLogDataFiltered.map((row) => (
                      <AccessLogTableRow
                        key={row.id}
                        row={row}
                        columnVisibility={accessLogColumnVisibility}
                        dense={accessLogTable.dense}
                      />
                    ))}

                  <TableEmptyRows
                    height={currentDenseHeight}
                    emptyRows={0} // API handles pagination for both tables
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
              count={
                currentTable === 'accessLog'
                  ? accessLogData?.count || 0
                  : auditLogData?.count || 0
              }
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
