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

// Video Templates (Preview Videos)
export const _videoTemplates: IVideoTemplate[] = [
  {
    id: '0c84f164-0924-42da-8bdc-312605b74a1a',
    name: 'Plate 1',
    thumbnail: 'https://res.cloudinary.com/dkunoyeof/video/upload/v1767463493/Plate1_b6bjpw.mp4',
    videoUrl: 'https://res.cloudinary.com/dkunoyeof/video/upload/v1767463493/Plate1_b6bjpw.mp4',
    duration: '01:18',
  },
  {
    id: '2e28dc25-797a-41f3-adcb-a42d2a985ecf',
    name: 'Plate 2',
    thumbnail: 'https://res.cloudinary.com/dkunoyeof/video/upload/v1767463494/Plate2_ylrtc2.mp4',
    videoUrl: 'https://res.cloudinary.com/dkunoyeof/video/upload/v1767463494/Plate2_ylrtc2.mp4',
    duration: '01:45',
  },
  {
    id: '4954df55-2d2c-4982-b71d-65d96a172bfa',
    name: 'Plate 3',
    thumbnail: 'https://res.cloudinary.com/dkunoyeof/video/upload/v1767463495/Plate3_rnxizg.mp4',
    videoUrl: 'https://res.cloudinary.com/dkunoyeof/video/upload/v1767463495/Plate3_rnxizg.mp4',
    duration: '01:27',
  },
  {
    id: '45d746c4-7ba4-4ec2-929e-85a76de8e7f9',
    name: 'Plate 4',
    thumbnail: 'https://res.cloudinary.com/dkunoyeof/video/upload/v1767463496/Plate4_nnsylb.mp4',
    videoUrl: 'https://res.cloudinary.com/dkunoyeof/video/upload/v1767463496/Plate4_nnsylb.mp4',
    duration: '01:32',
  },
];
