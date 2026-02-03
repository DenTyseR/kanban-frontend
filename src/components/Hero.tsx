import { Button, Field, TextInput } from './ui'

type HeroProps = {
  boardIdInput: string
  boardCreateDraft: string
  isBusy: boolean
  apiBase: string
  onBoardIdChange: (value: string) => void
  onBoardCreateChange: (value: string) => void
  onLoadBoard: () => void
  onCreateBoard: () => void
}

export function Hero({
  boardIdInput,
  boardCreateDraft,
  isBusy,
  apiBase,
  onBoardIdChange,
  onBoardCreateChange,
  onLoadBoard,
  onCreateBoard,
}: HeroProps) {
  return (
    <header className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.35em]">
          Kanban Studio
        </p>
        <h1 className="text-3xl font-bold uppercase tracking-tight">
          Build focus-ready boards in seconds.
        </h1>
      </div>
      <div className="space-y-4 border-2 border-black bg-white p-5">
        <Field label="Load a board by ID">
          <div className="flex flex-col gap-2 sm:flex-row">
            <TextInput
              value={boardIdInput}
              onChange={(event) => onBoardIdChange(event.target.value)}
              placeholder="Enter a board ID"
            />
            <Button onClick={() => onLoadBoard()} disabled={isBusy}>
              Load
            </Button>
          </div>
        </Field>
        <Field label="Create a fresh board">
          <div className="flex flex-col gap-2 sm:flex-row">
            <TextInput
              value={boardCreateDraft}
              onChange={(event) => onBoardCreateChange(event.target.value)}
              placeholder="New board name"
            />
            <Button onClick={onCreateBoard} disabled={isBusy}>
              Create
            </Button>
          </div>
        </Field>
        <p className="text-xs">API base: {apiBase}</p>
      </div>
    </header>
  )
}
