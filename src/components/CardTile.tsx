import type { DragEvent } from 'react'
import type { Card } from '../types'
import { Button, cx } from './ui'

type CardTileProps = {
  card: Card
  isDragging: boolean
  onEdit: () => void
  onDelete: () => void
  onDragStart: (event: DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  onDropOnCard: (event: DragEvent<HTMLDivElement>) => void
}

export function CardTile({
  card,
  isDragging,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDropOnCard,
}: CardTileProps) {
  return (
    <div
      className={cx(
        'border-2 border-black bg-white p-4 text-sm',
        isDragging && 'opacity-60',
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDropOnCard}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold uppercase">{card.title}</h4>
        <div className="flex gap-2">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onEdit}>
            Edit
          </Button>
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs">
        {card.description || 'No description yet.'}
      </p>
    </div>
  )
}
