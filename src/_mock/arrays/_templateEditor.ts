import _mock from '../_mock';
import { ITemplate } from '../../@types/template';

// ----------------------------------------------------------------------

// Restaurant-themed template JSON data (simplified versions)
const MENU_TEMPLATE_JSON = JSON.stringify({
  version: '5.3.0',
  objects: [
    {
      type: 'rect',
      version: '5.3.0',
      left: 175.5,
      top: -286.5,
      width: 900,
      height: 1200,
      fill: 'white',
      name: 'clip',
      selectable: false,
      hasControls: false,
      shadow: {
        color: 'rgba(0,0,0,0.8)',
        blur: 5,
      },
    },
  ],
});

const RECIPE_CARD_TEMPLATE_JSON = JSON.stringify({
  version: '5.3.0',
  objects: [
    {
      type: 'rect',
      version: '5.3.0',
      left: 175.5,
      top: -286.5,
      width: 800,
      height: 1000,
      fill: '#f5f5f5',
      name: 'clip',
      selectable: false,
      hasControls: false,
      shadow: {
        color: 'rgba(0,0,0,0.8)',
        blur: 5,
      },
    },
  ],
});

const WINE_LIST_TEMPLATE_JSON = JSON.stringify({
  version: '5.3.0',
  objects: [
    {
      type: 'rect',
      version: '5.3.0',
      left: 175.5,
      top: -286.5,
      width: 1000,
      height: 1400,
      fill: '#2a2a2a',
      name: 'clip',
      selectable: false,
      hasControls: false,
      shadow: {
        color: 'rgba(0,0,0,0.8)',
        blur: 5,
      },
    },
  ],
});

const PROMOTION_TEMPLATE_JSON = JSON.stringify({
  version: '5.3.0',
  objects: [
    {
      type: 'rect',
      version: '5.3.0',
      left: 175.5,
      top: -286.5,
      width: 1920,
      height: 1080,
      fill: 'white',
      name: 'clip',
      selectable: false,
      hasControls: false,
      shadow: {
        color: 'rgba(0,0,0,0.8)',
        blur: 5,
      },
    },
  ],
});

export const _templateEditorList: Array<{
  id: string;
  name: string;
  json: string;
  width: number;
  height: number;
  thumbnailUrl: string;
}> = [
  {
    id: _mock.id(0),
    name: 'Menu Template',
    json: MENU_TEMPLATE_JSON,
    width: 900,
    height: 1200,
    thumbnailUrl: 'https://plateprep-be.s3.amazonaws.com/Garden_Breeze_2.png',
  },
  {
    id: _mock.id(1),
    name: 'Recipe Card Template',
    json: RECIPE_CARD_TEMPLATE_JSON,
    width: 800,
    height: 1000,
    thumbnailUrl: 'https://plateprep-be.s3.amazonaws.com/Garden_Breeze_2.png',
  },
  {
    id: _mock.id(2),
    name: 'Wine List Template',
    json: WINE_LIST_TEMPLATE_JSON,
    width: 1000,
    height: 1400,
    thumbnailUrl: 'https://plateprep-be.s3.amazonaws.com/Garden_Breeze_2.png',
  },
  {
    id: _mock.id(3),
    name: 'Promotion Template',
    json: PROMOTION_TEMPLATE_JSON,
    width: 1920,
    height: 1080,
    thumbnailUrl: 'https://plateprep-be.s3.amazonaws.com/Garden_Breeze_2.png',
  },
];

// Default empty canvas state
export const DEFAULT_EDITOR_STATE = JSON.stringify({
  version: '5.3.0',
  objects: [
    {
      type: 'rect',
      version: '5.3.0',
      left: 175.5,
      top: -286.5,
      width: 1920,
      height: 1080,
      fill: 'white',
      name: 'clip',
      selectable: false,
      hasControls: false,
      shadow: {
        color: 'rgba(0,0,0,0.8)',
        blur: 5,
        offsetX: 0,
        offsetY: 0,
        affectStroke: false,
        nonScaling: false,
      },
      visible: true,
      backgroundColor: '',
      fillRule: 'nonzero',
      paintFirst: 'fill',
      globalCompositeOperation: 'source-over',
      skewX: 0,
      skewY: 0,
      rx: 0,
      ry: 0,
    },
  ],
});

