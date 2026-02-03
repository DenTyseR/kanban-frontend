import type { CardEditorState } from '../types'
import { Button, Field, TextArea, TextInput } from './ui'

type EditorModalProps = {
  editor: CardEditorState
  isBusy: boolean
  onClose: () => void
  onChange: (next: CardEditorState) => void
  onSubmit: () => void
}

export function EditorModal({
  editor,
  isBusy,
  onClose,
  onChange,
  onSubmit,
}: EditorModalProps) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-lg border-2 border-black bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase">
            {editor.mode === 'create' ? 'New card' : 'Edit card'}
          </h3>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Title">
            <TextInput
              value={editor.title}
              onChange={(event) =>
                onChange({ ...editor, title: event.target.value })
              }
              placeholder="Card title"
            />
          </Field>
          <Field label="Description">
            <TextArea
              rows={4}
              value={editor.description}
              onChange={(event) =>
                onChange({ ...editor, description: event.target.value })
              }
              placeholder="What needs to happen next?"
            />
          </Field>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={onSubmit} disabled={isBusy}>
            Save card
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
