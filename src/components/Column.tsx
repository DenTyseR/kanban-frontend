import type { DragEvent } from 'react'
import type { Card, CardEditorState, Status } from '../types'
import { Button } from './ui'
import { CardTile } from './CardTile'

type ColumnProps = {
  status: Status
  label: string
  count: number
  cards: Card[]
  isBusy: boolean
  hasBoard: boolean
  draggingCardId: string | null
  onDropColumn: (event: DragEvent<HTMLDivElement>, status: Status) => void
  onDropCard: (
    event: DragEvent<HTMLDivElement>,
    status: Status,
    index: number,
  ) => void
  onDragStart: (
    event: DragEvent<HTMLDivElement>,
    cardId: string,
    status: Status,
  ) => void
  onDragEnd: () => void
  onOpenEditor: (state: CardEditorState) => void
  onDeleteCard: (cardId: string) => void
}

export function Column({
  status,
  label,
  count,
  cards,
  isBusy,
  hasBoard,
  draggingCardId,
  onDropColumn,
  onDropCard,
  onDragStart,
  onDragEnd,
  onOpenEditor,
  onDeleteCard,
}: ColumnProps) {
  return (
    <div
      className="flex min-h-[420px] flex-col gap-4 border-2 border-black bg-white p-4"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDropColumn(event, status)}
    >
      <div className="flex items-center justify-between text-sm font-semibold uppercase">
        <h3>{label}</h3>
        <span className="border-2 border-black bg-stone-100 px-2 py-0.5 text-xs">
          {count}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {cards.map((card, index) => (
          <CardTile
            key={card.id}
            card={card}
            isDragging={draggingCardId === card.id}
            onEdit={() =>
              onOpenEditor({
                mode: 'edit',
                status,
                cardId: card.id,
                title: card.title,
                description: card.description,
              })
            }
            onDelete={() => onDeleteCard(card.id)}
            onDragStart={(event) => onDragStart(event, card.id, card.status)}
            onDragEnd={onDragEnd}
            onDropOnCard={(event) => onDropCard(event, status, index)}
          />
        ))}
        <Button
          variant="ghost"
          className="justify-center border-dashed"
          onClick={() =>
            onOpenEditor({
              mode: 'create',
              status,
              title: '',
              description: '',
            })
          }
          disabled={!hasBoard || isBusy}
        >
          + Add card
        </Button>
      </div>
    </div>
  )
}
