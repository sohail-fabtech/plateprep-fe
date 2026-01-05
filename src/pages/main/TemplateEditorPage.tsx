import { Helmet } from 'react-helmet-async';
// sections
import Editor from '../../sections/@dashboard/templateEditor/components/Editor';
// mock
import { DEFAULT_EDITOR_STATE } from '../../_mock/arrays/_templateEditor';

// ----------------------------------------------------------------------

export default function TemplateEditorPage() {
  return (
    <>
      <Helmet>
        <title> Template Editor | Minimal UI</title>
      </Helmet>

      <Editor
        defaultState={DEFAULT_EDITOR_STATE}
        defaultWidth={1920}
        defaultHeight={1080}
      />
    </>
  );
}
