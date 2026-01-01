import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import {
  Container,
  Button,
  Typography,
  Card,
  Grid,
  Stack,
  Box,
  Chip,
  Divider,
  Avatar,
  IconButton,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import ConfirmDialog from '../../components/confirm-dialog';
import MenuPopover from '../../components/menu-popover';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// utils
import {
  fetchTaskById,
  updateTaskDescription,
  updateTaskStatus,
  addTaskComment,
  deleteTask,
  getYouTubeVideoId,
} from '../../utils/taskAdapter';
// types
import { ITaskDetail } from '../../@types/taskApi';
import { TASK_STATUS_OPTIONS } from '../../@types/taskApi';
// mock
import { _taskList } from '../../_mock/arrays';

// ----------------------------------------------------------------------

export default function TaskDetailsPage() {
  const { id } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState<ITaskDetail | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  // Check if user has edit permission
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  // Fetch task data
  useEffect(() => {
    async function loadTask() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first, fallback to mock data
        try {
          const task = await fetchTaskById(id);
          setTaskData(task);
          setDescriptionValue(task.taskDescription);
        } catch (apiError) {
          console.warn('API unavailable, using mock data:', apiError);
          // Fallback to mock data
          const mockTask = _taskList.find((t) => t.id === id);
          if (mockTask) {
            const fallbackTask: ITaskDetail = {
              id: parseInt(mockTask.id, 10),
              taskName: mockTask.taskName,
              taskDescription: mockTask.taskDescription,
              status: {
                value: mockTask.status === 'in-progress' ? 'IP' : 'AS',
                label: mockTask.status,
              },
              priority: {
                value: mockTask.priority === 'high' ? 'H' : 'M',
                label: mockTask.priority,
              },
              startedAt: '10:00:00',
              completedAt: '14:00:00',
              kitchenStation: 'Grill Station',
              videoLink: 'https://youtu.be/S-TmmjEN-V0?si=-ZsY_SNAFK8ZMj7a',
              dueDate: mockTask.dueDate ? mockTask.dueDate.toString() : new Date().toISOString(),
              staffEmail: 'staff@restaurant.com',
              staffProfile: null,
              staffFullName: mockTask.staffName,
              assignedBy: 'Restaurant Team',
              comments: [],
            };
            setTaskData(fallbackTask);
            setDescriptionValue(fallbackTask.taskDescription);
          } else {
            throw new Error('Task not found');
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Failed to load task');
        setLoading(false);
        enqueueSnackbar('Failed to load task', { variant: 'error' });
      }
    }

    loadTask();
  }, [id, enqueueSnackbar]);

  // Handle description save
  const handleDescriptionSave = useCallback(async () => {
    if (!taskData) return;

    try {
      await updateTaskDescription(taskData.id, descriptionValue);
      setTaskData({ ...taskData, taskDescription: descriptionValue });
      setEditingDescription(false);
      enqueueSnackbar('Description updated successfully!', { variant: 'success' });
      console.log('✅ [DESCRIPTION SAVED]', { taskId: taskData.id, description: descriptionValue });
    } catch (err) {
      console.error('Error saving description:', err);
      enqueueSnackbar('Failed to update description', { variant: 'error' });
    }
  }, [taskData, descriptionValue, enqueueSnackbar]);

  // Handle description cancel
  const handleDescriptionCancel = useCallback(() => {
    if (taskData) {
      setDescriptionValue(taskData.taskDescription);
    }
    setEditingDescription(false);
  }, [taskData]);

  // Handle status update
  const handleStatusUpdate = useCallback(
    async (statusValue: string) => {
      if (!taskData) return;

      try {
        await updateTaskStatus(taskData.id, statusValue);
        const newStatus = TASK_STATUS_OPTIONS.find((s) => s.value === statusValue);
        if (newStatus) {
          setTaskData({ ...taskData, status: { value: newStatus.value, label: newStatus.label } });
          enqueueSnackbar('Status updated successfully!', { variant: 'success' });
          console.log('✅ [STATUS UPDATED]', { taskId: taskData.id, status: newStatus.label });
        }
        setOpenPopover(null);
      } catch (err) {
        console.error('Error updating status:', err);
        enqueueSnackbar('Failed to update status', { variant: 'error' });
      }
    },
    [taskData, enqueueSnackbar]
  );

  // Handle add comment
  const handleAddComment = useCallback(async () => {
    if (!taskData || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const comment = await addTaskComment(taskData.id, newComment);
      setTaskData({ ...taskData, comments: [...taskData.comments, comment] });
      setNewComment('');
      enqueueSnackbar('Comment added successfully!', { variant: 'success' });
      console.log('✅ [COMMENT ADDED]', { taskId: taskData.id, comment: newComment });
    } catch (err) {
      console.error('Error adding comment:', err);
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    } finally {
      setSubmittingComment(false);
    }
  }, [taskData, newComment, enqueueSnackbar]);

  // Handle delete task
  const handleDeleteTask = useCallback(async () => {
    if (!taskData) return;

    try {
      await deleteTask(taskData.id);
      enqueueSnackbar('Task deleted successfully!', { variant: 'success' });
      console.log('✅ [TASK DELETED]', { taskId: taskData.id });
      navigate(PATH_DASHBOARD.tasks.list);
    } catch (err) {
      console.error('Error deleting task:', err);
      enqueueSnackbar('Failed to delete task', { variant: 'error' });
    }
  }, [taskData, enqueueSnackbar, navigate]);

  // Get status color
  const getStatusColor = (status: string): 'warning' | 'info' | 'success' | 'error' | 'default' => {
    switch (status.toUpperCase()) {
      case 'AS':
      case 'ASSIGNED':
        return 'warning';
      case 'IP':
      case 'IN PROGRESS':
        return 'info';
      case 'CO':
      case 'COMPLETED':
        return 'success';
      case 'CA':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (priority.toUpperCase()) {
      case 'H':
      case 'HIGH':
      case 'URGENT':
        return 'error';
      case 'M':
      case 'MEDIUM':
        return 'warning';
      case 'L':
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  // Format time
  const formatTime = (time: string) => {
    if (!time) return '-';
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return time;
    }
  };

  // Format date
  const formatDate = (date: string) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !taskData) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" color="error">
            {error || 'Task not found'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(PATH_DASHBOARD.tasks.list)}
            sx={{ mt: 2 }}
          >
            Back to Tasks
          </Button>
        </Box>
      </Container>
    );
  }

  const videoId = getYouTubeVideoId(taskData.videoLink);

  return (
    <>
      <Helmet>
        <title>{`Task: ${taskData.taskName} | Minimal UI`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Task Details"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Tasks',
              href: PATH_DASHBOARD.tasks.root,
            },
            { name: taskData.taskName },
          ]}
        />

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Header Card */}
          <Grid item xs={12}>
            <Card sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                  {taskData.taskName}
                </Typography>

                <Stack direction="row" spacing={1}>
                  {/* 3-Dot Menu */}
                  <IconButton
                    onClick={(e) => setOpenPopover(e.currentTarget)}
                    sx={{
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
                    }}
                  >
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>

                  {/* Edit Button */}
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="eva:edit-outline" />}
                    onClick={() => navigate(PATH_DASHBOARD.tasks.edit(id!))}
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Edit
                  </Button>
                </Stack>
              </Stack>

              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 1, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
              >
                Employee Status Page
              </Typography>
            </Card>
          </Grid>

          {/* Task Information Grid */}
          <Grid item xs={12}>
            <Card sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* Status */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:radio-button-on-outline" width={20} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 100 }}>
                      Status:
                    </Typography>
                    <Chip
                      label={taskData.status.label}
                      color={getStatusColor(taskData.status.value)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </Grid>

                {/* Priority */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:clock-outline" width={20} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 100 }}>
                      Priority:
                    </Typography>
                    <Chip
                      label={taskData.priority.label}
                      color={getPriorityColor(taskData.priority.value)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </Grid>

                {/* Started At */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:clock-outline" width={20} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 100 }}>
                      Started at:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatTime(taskData.startedAt)}
                    </Typography>
                  </Stack>
                </Grid>

                {/* Completed At */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:clock-outline" width={20} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 100 }}>
                      Completed at:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatTime(taskData.completedAt)}
                    </Typography>
                  </Stack>
                </Grid>

                {/* Assigned */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:people-outline" width={20} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 100 }}>
                      Assigned:
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: theme.palette.primary.main }}
                      >
                        {taskData.staffFullName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {taskData.staffFullName}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:email-outline" width={20} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 100 }}>
                      Email:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {taskData.staffEmail}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Task Description */}
          <Grid item xs={12}>
            <Card sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="h6"
                    sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 600 }}
                  >
                    Task Description
                  </Typography>
                  {canEdit && !editingDescription && (
                    <IconButton
                      size="small"
                      onClick={() => setEditingDescription(true)}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.16),
                        },
                      }}
                    >
                      <Iconify icon="eva:edit-outline" width={18} />
                    </IconButton>
                  )}
                </Stack>

                {editingDescription ? (
                  <Stack spacing={2}>
                    <TextField
                      multiline
                      rows={4}
                      value={descriptionValue}
                      onChange={(e) => setDescriptionValue(e.target.value)}
                      placeholder="Enter task description..."
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.8125rem', md: '0.875rem' },
                        },
                      }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" onClick={handleDescriptionCancel}>
                        Cancel
                      </Button>
                      <Button variant="contained" onClick={handleDescriptionSave}>
                        Save
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.grey[500], 0.04),
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.8125rem', md: '0.875rem' },
                        lineHeight: 1.7,
                        color: taskData.taskDescription ? 'text.primary' : 'text.disabled',
                      }}
                    >
                      {taskData.taskDescription || 'No description provided'}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>

          {/* Video Section */}
          {videoId && (
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 600, mb: 2 }}
                >
                  Training Video
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Task Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0,
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          )}

          {/* Comments Section */}
          <Grid item xs={12}>
            <Card sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 600 }}
                  >
                    Comments
                  </Typography>
                  <Chip
                    label={taskData.comments.length.toString().padStart(2, '0')}
                    size="small"
                    color="primary"
                  />
                </Stack>

                <Divider />

                {/* Comment List */}
                {taskData.comments.length > 0 ? (
                  <Stack spacing={2}>
                    {taskData.comments.map((comment) => (
                      <Box
                        key={comment.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.grey[500], 0.04),
                          border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: '0.875rem',
                              bgcolor: theme.palette.primary.main,
                            }}
                          >
                            {comment.userName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
                                {comment.userName}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.disabled', fontSize: '0.75rem' }}
                              >
                                {formatDate(comment.createdAt)}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' }, lineHeight: 1.7 }}
                            >
                              {comment.message}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      No comments yet. Be the first to comment!
                    </Typography>
                  </Box>
                )}

                {/* Add Comment */}
                <Stack spacing={2}>
                  <TextField
                    multiline
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: { xs: '0.8125rem', md: '0.875rem' },
                      },
                    }}
                  />
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      startIcon={
                        submittingComment ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Iconify icon="eva:message-circle-outline" />
                        )
                      }
                    >
                      Add Comment
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Menu Popover */}
        <MenuPopover
          open={openPopover}
          onClose={() => setOpenPopover(null)}
          arrow="top-right"
          sx={{ width: 200 }}
        >
          <Typography variant="subtitle2" sx={{ px: 1.5, py: 1 }}>
            Update Status
          </Typography>
          <Divider />
          {TASK_STATUS_OPTIONS.map((status) => (
            <MenuItem key={status.value} onClick={() => handleStatusUpdate(status.value)} sx={{ py: 1 }}>
              <Chip
                label={status.label}
                color={getStatusColor(status.value)}
                size="small"
                sx={{ mr: 1, fontWeight: 600 }}
              />
            </MenuItem>
          ))}
          <Divider />
          <MenuItem
            onClick={() => {
              setOpenPopover(null);
              setOpenDeleteConfirm(true);
            }}
            sx={{ color: 'error.main', py: 1 }}
          >
            <Iconify icon="eva:trash-2-outline" sx={{ mr: 1 }} />
            Delete Task
          </MenuItem>
        </MenuPopover>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
          title="Delete Task"
          content="Are you sure you want to delete this task? This action cannot be undone."
          action={
            <Button variant="contained" color="error" onClick={handleDeleteTask}>
              Delete
            </Button>
          }
        />
      </Container>
    </>
  );
}

