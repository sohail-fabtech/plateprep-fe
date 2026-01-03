// ----------------------------------------------------------------------

export type ISchedulingStatus = {
  name: string;
  value: string;
};

export type ISchedulingDish = {
  name: string;
  id: number;
};

export type ISchedulingHoliday = {
  name: string;
  id: number;
};

export type IScheduling = {
  id: number;
  dish: ISchedulingDish;
  created_at: string;
  is_deleted: boolean;
  schedule_datetime: string;
  scheduleDatetime: string; // Added for compatibility
  season: string | null;
  status: ISchedulingStatus;
  job: string | null;
  holiday: number | null; // Changed to number | null to match API
  holidayOption?: ISchedulingHoliday; // Optional for display
  creator: number;
};

export type ISchedulingForm = {
  dishId: number | null;
  scheduleDatetime: Date | null;
  season: string;
  holidayId: number | null;
};

export type IDishOption = {
  id: number;
  dish_name: string;
};

export type IHolidayOption = {
  id: number;
  holiday: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};
