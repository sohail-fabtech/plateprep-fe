import { IVideoGeneration, IVideoTemplate } from '../../@types/videoGeneration';

// ----------------------------------------------------------------------

export const _videoGenerationList: IVideoGeneration[] = [
  {
    id: 131,
    dish_name: 'test',
    video: 'https://plateprep-be.s3.amazonaws.com/media/recipe_videos/video_pYVkFJF.mp4',
    status: 'live',
    isArchived: false,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 130,
    dish_name: 'ggggggggggg',
    video: 'https://plateprep-be.s3.amazonaws.com/media/recipe_videos/video_lT5Tbh1.mp4',
    status: 'live',
    isArchived: false,
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: 127,
    dish_name: 'Festival Chicken',
    video: 'https://plateprep-be.s3.amazonaws.com/media/recipe_videos/video_1RACkwz.mp4',
    status: 'draft',
    isArchived: false,
    createdAt: '2024-01-10T09:15:00Z',
  },
  {
    id: 126,
    dish_name: 'Classic Pasta',
    video: 'https://plateprep-be.s3.amazonaws.com/media/recipe_videos/video_1RACkwz.mp4',
    status: 'archived',
    isArchived: true,
    createdAt: '2024-01-08T08:00:00Z',
  },
];

// Video Templates (Avatars)
export const _videoTemplates: IVideoTemplate[] = [
  {
    id: 'template-1',
    name: 'Template 1',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    videoUrl: 'https://plateprep-be.s3.amazonaws.com/media/recipe_videos/video_pYVkFJF.mp4',
    duration: '01:18',
  },
  {
    id: 'template-2',
    name: 'Template 2',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    videoUrl: 'https://plateprep-be.s3.amazonaws.com/media/recipe_videos/video_lT5Tbh1.mp4',
    duration: '01:45',
  },
  {
    id: 'template-3',
    name: 'Template 3',
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    videoUrl: 'https://plateprep-be.s3.amazonaws.com/media/recipe_videos/video_1RACkwz.mp4',
    duration: '01:27',
  },
  {
    id: 'template-4',
    name: 'Template 4',
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    videoUrl: 'https://plateprep-be.s3.amazonaws.com/media/recipe_videos/video_pYVkFJF.mp4',
    duration: '01:32',
  },
];
