import _mock from '../_mock';
import { randomInArray } from '../utils';
import { ITemplate } from '../../@types/template';

// ----------------------------------------------------------------------

const TEMPLATE_CATEGORIES = [
  'Menu',
  'Recipe Card',
  'Staff Schedule',
  'Promotion',
  'Table Setting',
  'Special Event',
  'Wine List',
  'Daily Special',
  'Happy Hour',
  'Seasonal Menu',
];

const STATUSES: Array<'draft' | 'active' | 'archived'> = ['draft', 'active', 'archived'];

const TEMPLATE_NAMES = [
  'Dinner Menu Template',
  'Lunch Menu Template',
  'Brunch Menu Template',
  'Wine List Template',
  'Cocktail Menu Template',
  'Dessert Menu Template',
  'Daily Specials Board',
  'Happy Hour Menu',
  'Seasonal Special Menu',
  'Kids Menu Template',
  'Recipe Card Template',
  'Chef Special Template',
  'Staff Schedule Template',
  'Weekly Schedule Template',
  'Event Menu Template',
  'Holiday Menu Template',
  'Catering Menu Template',
  'Private Dining Menu',
  'Bar Menu Template',
  'Breakfast Menu Template',
  'Takeout Menu Template',
  'Outdoor Menu Template',
  'Wine Pairing Menu',
  'Tasting Menu Template',
];

export const _templateList: ITemplate[] = [...Array(24)].map((_, index) => ({
  id: _mock.id(index),
  name: TEMPLATE_NAMES[index] || _mock.text.title(index),
  description: _mock.text.description(index),
  thumbnail: _mock.image.product(index),
  category: randomInArray(TEMPLATE_CATEGORIES),
  status: randomInArray(STATUSES),
  isAvailable: _mock.boolean(index),
  width: 1920,
  height: 1080,
  createdAt: _mock.time(index),
  updatedAt: _mock.time(index),
  createdBy: _mock.name.fullName(index),
}));

