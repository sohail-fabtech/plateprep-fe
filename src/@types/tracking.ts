// ----------------------------------------------------------------------

export type IProcessAudit = {
  id: number;
  modelName: string;
  objectId: string;
  objectRepr: string;
  changedByName: string;
  userRole: string;
  userEmail: string;
  actionDisplay: string;
  timestamp: string;
  formattedChanges: string;
  restaurantName: string;
};

export type IAccessLog = {
  id: number;
  user: {
    fullName: string;
    email: string;
    role: string;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: string;
};

export type ITrackingFilterStatus = 'all' | 'active' | 'archived';

