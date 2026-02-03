export type Status = 'todo' | 'inProgress' | 'done'

export type Card = {
  id: string
  title: string
  description: string
  status: Status
  order: number
}

export type Board = {
  id: string
  name: string
}

export type Columns = Record<Status, Card[]>

export type CardEditorState = {
  mode: 'create' | 'edit'
  status: Status
  cardId?: string
  title: string
  description: string
}
