// ----------------------------------------------------------------------

export type ITaskStatus = 'draft' | 'pending' | 'in-progress' | 'completed' | 'cancelled';

export type ITaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ITaskFilterStatus = 'all' | 'draft' | 'active' | 'archived';

export type ITask = {
  id: string;
  staffName: string;
  taskName: string;
  taskDescription: string;
  status: ITaskStatus;
  priority: ITaskPriority;
  createdAt: Date | string;
  updatedAt?: Date | string;
  dueDate?: Date | string | null;
  isArchived: boolean;
};

export type ITaskVideoFile = {
  url: string;
  name: string;
  type: 'preparation' | 'presentation';
};

export type ITaskForm = {
  taskType: string;
  taskName?: string;
  dishSelection?: string;
  kitchenStation: string;
  assignTo: string;
  email?: string;
  taskStartTime?: Date | null;
  taskCompletionTime?: Date | null;
  dueDate?: Date | null;
  videoLink?: string;
  video?: ITaskVideoFile | null;
  priority: ITaskPriority;
  description: string;
  status: ITaskStatus;
};
