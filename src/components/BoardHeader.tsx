import type { Board } from '../types'
import { Button, TextInput } from './ui'

type BoardHeaderProps = {
  board: Board | null
  cardsCount: number
  boardNameDraft: string
  isBusy: boolean
  onBoardNameChange: (value: string) => void
  onRenameBoard: () => void
  onDeleteBoard: () => void
}

export function BoardHeader({
  board,
  cardsCount,
  boardNameDraft,
  isBusy,
  onBoardNameChange,
  onRenameBoard,
  onDeleteBoard,
}: BoardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b-2 border-black pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold uppercase">
          {board ? board.name : 'No board loaded yet'}
        </h2>
        <p className="text-sm">
          {board
            ? `Board ID: ${board.id} - ${cardsCount} cards`
            : 'Load or create a board to get started.'}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <TextInput
          value={boardNameDraft}
          onChange={(event) => onBoardNameChange(event.target.value)}
          placeholder="Rename board"
          disabled={!board}
        />
        <Button onClick={onRenameBoard} disabled={!board || isBusy}>
          Rename
        </Button>
        <Button
          variant="ghost"
          onClick={onDeleteBoard}
          disabled={!board || isBusy}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
