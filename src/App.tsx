import axios from 'axios'
import { useMemo, useState } from 'react'
import type { DragEvent, MouseEvent } from 'react'
import type { Board, Card, CardEditorState, Columns, Status } from './types'
import { BoardHeader } from './components/BoardHeader'
import { Column } from './components/Column'
import { EditorModal } from './components/EditorModal'
import { Hero } from './components/Hero'

type ApiStatus = 'todo' | 'in_progress' | 'done'

const STATUS_LABELS: Record<Status, string> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  done: 'Done',
}

const STATUS_ORDER: Status[] = ['todo', 'inProgress', 'done']

const EMPTY_COLUMNS: Columns = {
  todo: [],
  inProgress: [],
  done: [],
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

const API_STATUS_MAP: Record<Status, ApiStatus> = {
  todo: 'todo',
  inProgress: 'in_progress',
  done: 'done',
}

function toUiStatus(rawStatus: unknown): Status {
  if (rawStatus === 'in_progress') {
    return 'inProgress'
  }
  return STATUS_ORDER.includes(rawStatus as Status)
    ? (rawStatus as Status)
    : 'todo'
}

function toApiStatus(status: Status): ApiStatus {
  return API_STATUS_MAP[status]
}

function toUiCard(
  raw: Record<string, unknown>,
  fallbackStatus: Status,
  fallbackOrder: number,
): Card {
  const status = toUiStatus(raw.status ?? raw.column ?? fallbackStatus)
  return {
    id: String(raw.id ?? raw.cardId ?? `${status}-${fallbackOrder}`),
    title: String(raw.title ?? raw.name ?? 'Untitled'),
    description: String(raw.description ?? raw.details ?? ''),
    status,
    order: Number(raw.order ?? raw.position ?? fallbackOrder),
  }
}

function normalizeBoardPayload(
  boardId: string,
  payload: Record<string, unknown>,
) {
  const boardSource = (payload.board ?? payload) as Record<string, unknown>
  const board: Board = {
    id: String(boardSource.id ?? boardId),
    name: String(boardSource.name ?? boardSource.title ?? 'Untitled Board'),
  }

  const cardsFromColumns = payload.columns as
    | Record<string, unknown[]>
    | undefined
  const cardsFromArray = (payload.cards ?? payload.items) as
    | Record<string, unknown>[]
    | undefined

  let cards: Card[] = []

  if (cardsFromColumns) {
    cards = Object.entries(cardsFromColumns).flatMap(([statusKey, items]) => {
      const status = toUiStatus(statusKey)
      if (!STATUS_ORDER.includes(status)) {
        return []
      }
      return (items ?? []).map((raw, index) => {
        const rawCard = raw as Record<string, unknown>
        return toUiCard(rawCard, status, index)
      })
    })
  } else if (cardsFromArray) {
    cards = cardsFromArray.map((raw, index) => {
      const rawCard = raw as Record<string, unknown>
      return toUiCard(rawCard, 'todo', index)
    })
  }

  return { board, cards }
}

function groupCards(cards: Card[]): Columns {
  const grouped: Columns = {
    todo: [],
    inProgress: [],
    done: [],
  }

  for (const card of cards) {
    grouped[card.status].push(card)
  }

  for (const status of STATUS_ORDER) {
    grouped[status] = grouped[status]
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((card, index) => ({ ...card, order: index }))
  }

  return grouped
}

function remapOrders(columns: Columns): Columns {
  const next: Columns = { ...columns }
  for (const status of STATUS_ORDER) {
    next[status] = next[status].map((card, index) => ({
      ...card,
      order: index,
    }))
  }
  return next
}

function findCard(columns: Columns, cardId: string) {
  for (const status of STATUS_ORDER) {
    const card = columns[status].find((item) => item.id === cardId)
    if (card) {
      return card
    }
  }
  return undefined
}

async function fetchBoard(boardId: string) {
  const response = await api.get<Record<string, unknown>>(`/boards/${boardId}`)
  return normalizeBoardPayload(boardId, response.data)
}

async function createBoard(name: string) {
  const response = await api.post<Board>('/boards', { name })
  return response.data
}

async function updateBoard(boardId: string, name: string) {
  const response = await api.patch<Board>(`/boards/${boardId}`, { name })
  return response.data
}

async function deleteBoard(boardId: string) {
  await api.delete(`/boards/${boardId}`)
}

type CreateCardPayload = {
  title: string
  description: string
}

async function createCard(boardId: string, card: CreateCardPayload) {
  const response = await api.post<Record<string, unknown>>(
    `/boards/${boardId}/cards`,
    card,
  )
  return toUiCard(response.data, 'todo', 0)
}

type UpdateCardPayload = Partial<Pick<Card, 'title' | 'description' | 'status' | 'order'>>

async function updateCard(cardId: string, payload: UpdateCardPayload) {
  const apiPayload: Record<string, unknown> = {}
  if (payload.title !== undefined) apiPayload.title = payload.title
  if (payload.description !== undefined)
    apiPayload.description = payload.description
  if (payload.status !== undefined) apiPayload.status = toApiStatus(payload.status)
  if (payload.order !== undefined) apiPayload.position = payload.order

  const response = await api.patch<Record<string, unknown>>(
    `/cards/${cardId}`,
    apiPayload,
  )
  return toUiCard(response.data, payload.status ?? 'todo', payload.order ?? 0)
}

async function deleteCard(cardId: string) {
  await api.delete(`/cards/${cardId}`)
}

function App() {
  const [boardIdInput, setBoardIdInput] = useState('')
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Columns>(EMPTY_COLUMNS)
  const [statusMessage, setStatusMessage] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [editor, setEditor] = useState<CardEditorState | null>(null)
  const [boardNameDraft, setBoardNameDraft] = useState('')
  const [boardCreateDraft, setBoardCreateDraft] = useState('')
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)

  const hasBoard = Boolean(board)

  const cardsCount = useMemo(() => {
    return STATUS_ORDER.reduce(
      (total, status) => total + columns[status].length,
      0,
    )
  }, [columns])

  const setMessage = (message: string) => {
    setStatusMessage(message)
    if (message) {
      window.setTimeout(() => {
        setStatusMessage((current) => (current === message ? '' : current))
      }, 4000)
    }
  }

  const handleLoadBoard = async (
    boardIdOrEvent?: string | MouseEvent<HTMLButtonElement>,
  ) => {
    const resolvedId =
      typeof boardIdOrEvent === 'string'
        ? boardIdOrEvent.trim()
        : boardIdInput.trim()
    if (!resolvedId) {
      setMessage('Enter a board ID to load.')
      return
    }

    setIsBusy(true)
    try {
      const { board: loadedBoard, cards } = await fetchBoard(resolvedId)
      setBoard(loadedBoard)
      setBoardNameDraft(loadedBoard.name)
      setColumns(groupCards(cards))
      setBoardIdInput(loadedBoard.id)
      setMessage(`Loaded board "${loadedBoard.name}".`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Load failed.'
      setMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleCreateBoard = async () => {
    const name = boardCreateDraft.trim()
    if (!name) {
      setMessage('Give your board a name first.')
      return
    }

    setIsBusy(true)
    try {
      const created = await createBoard(name)
      setBoard(created)
      setBoardNameDraft(created.name)
      setBoardCreateDraft('')
      setBoardIdInput(created.id)
      setColumns(EMPTY_COLUMNS)
      setMessage(`Created board "${created.name}".`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Create failed.'
      setMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleRenameBoard = async () => {
    if (!board) return
    const name = boardNameDraft.trim()
    if (!name) {
      setMessage('Board name cannot be empty.')
      return
    }

    if (name === board.name) {
      setMessage('Board name is already up to date.')
      return
    }

    setIsBusy(true)
    try {
      const updated = await updateBoard(board.id, name)
      setBoard(updated)
      setBoardNameDraft(updated.name)
      setMessage('Board name updated.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed.'
      setMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleDeleteBoard = async () => {
    if (!board) return
    if (!confirm('Delete this board and all its cards?')) {
      return
    }

    setIsBusy(true)
    try {
      await deleteBoard(board.id)
      setBoard(null)
      setColumns(EMPTY_COLUMNS)
      setBoardNameDraft('')
      setBoardIdInput('')
      setMessage('Board deleted.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed.'
      setMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  const openEditor = (state: CardEditorState) => {
    setEditor(state)
  }

  const closeEditor = () => {
    setEditor(null)
  }

  const handleEditorSubmit = async () => {
    if (!board || !editor) return
    const title = editor.title.trim()
    if (!title) {
      setMessage('Card title is required.')
      return
    }

    setIsBusy(true)
    try {
      if (editor.mode === 'create') {
        const created = await createCard(board.id, {
          title,
          description: editor.description.trim(),
        })
        const createdStatus = created.status ?? 'todo'
        let resolvedCard: Card = {
          ...created,
          status: createdStatus,
          order: created.order ?? columns[createdStatus].length,
        }

        if (editor.status !== createdStatus) {
          const updated = await updateCard(created.id, {
            status: editor.status,
            order: columns[editor.status].length,
          })
          resolvedCard = {
            ...resolvedCard,
            ...updated,
            status: updated.status ?? editor.status,
            order: updated.order ?? columns[editor.status].length,
          }
        }
        setColumns((current) => {
          const next = { ...current }
          next[resolvedCard.status] = [...next[resolvedCard.status], resolvedCard]
          return remapOrders(next)
        })
        setMessage('Card created.')
      } else {
        const cardId = editor.cardId
        if (!cardId) return
        const updated = await updateCard(cardId, {
          title,
          description: editor.description.trim(),
        })
        setColumns((current) => {
          const next = { ...current }
          for (const status of STATUS_ORDER) {
            next[status] = next[status].map((card) =>
              card.id === cardId ? { ...card, ...updated } : card,
            )
          }
          return remapOrders(next)
        })
        setMessage('Card updated.')
      }
      setEditor(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed.'
      setMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!board) return
    if (!confirm('Delete this card?')) return

    setIsBusy(true)
    try {
      await deleteCard(cardId)
      setColumns((current) => {
        const next = { ...current }
        for (const status of STATUS_ORDER) {
          next[status] = next[status].filter((card) => card.id !== cardId)
        }
        return remapOrders(next)
      })
      setMessage('Card deleted.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed.'
      setMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  const moveCard = async (
    cardId: string,
    fromStatus: Status,
    toStatus: Status,
    toIndex: number,
  ) => {
    if (!board) return

    const card = findCard(columns, cardId)
    if (!card) return
    const fromIndex = columns[fromStatus].findIndex((item) => item.id === cardId)
    let resolvedIndex = toIndex
    if (fromStatus === toStatus && fromIndex >= 0 && fromIndex < toIndex) {
      resolvedIndex = toIndex - 1
    }

    setColumns((current) => {
      const next: Columns = {
        todo: [...current.todo],
        inProgress: [...current.inProgress],
        done: [...current.done],
      }
      next[fromStatus] = next[fromStatus].filter((item) => item.id !== cardId)
      const updatedCard = { ...card, status: toStatus }
      const target = [...next[toStatus]]
      target.splice(resolvedIndex, 0, updatedCard)
      next[toStatus] = target
      return remapOrders(next)
    })

    try {
      await updateCard(cardId, {
        status: toStatus,
        order: resolvedIndex,
      })
      setMessage('Card moved.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Move failed.'
      setMessage(message)
    }
  }

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    cardId: string,
    status: Status,
  ) => {
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ cardId, fromStatus: status }),
    )
    event.dataTransfer.effectAllowed = 'move'
    setDraggingCardId(cardId)
  }

  const handleDragEnd = () => {
    setDraggingCardId(null)
  }

  const handleDropOnColumn = (
    event: DragEvent<HTMLDivElement>,
    status: Status,
  ) => {
    event.preventDefault()
    const payload = event.dataTransfer.getData('text/plain')
    if (!payload) return
    const parsed = JSON.parse(payload) as {
      cardId: string
      fromStatus: Status
    }
    const toIndex = columns[status].length
    if (parsed.cardId) {
      moveCard(parsed.cardId, parsed.fromStatus, status, toIndex)
    }
  }

  const handleDropOnCard = (
    event: DragEvent<HTMLDivElement>,
    status: Status,
    index: number,
  ) => {
    event.preventDefault()
    const payload = event.dataTransfer.getData('text/plain')
    if (!payload) return
    const parsed = JSON.parse(payload) as {
      cardId: string
      fromStatus: Status
    }
    if (parsed.cardId) {
      moveCard(parsed.cardId, parsed.fromStatus, status, index)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 px-[4vw] py-10 text-stone-900">
      <Hero
        boardIdInput={boardIdInput}
        boardCreateDraft={boardCreateDraft}
        isBusy={isBusy}
        apiBase={API_BASE}
        onBoardIdChange={setBoardIdInput}
        onBoardCreateChange={setBoardCreateDraft}
        onLoadBoard={handleLoadBoard}
        onCreateBoard={handleCreateBoard}
      />

      {statusMessage && (
        <div className="mx-auto mt-6 w-fit border-2 border-black bg-black px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
          {statusMessage}
        </div>
      )}

      <section className="mt-10 space-y-6">
        <BoardHeader
          board={board}
          cardsCount={cardsCount}
          boardNameDraft={boardNameDraft}
          isBusy={isBusy}
          onBoardNameChange={setBoardNameDraft}
          onRenameBoard={handleRenameBoard}
          onDeleteBoard={handleDeleteBoard}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              label={STATUS_LABELS[status]}
              count={columns[status].length}
              cards={columns[status]}
              isBusy={isBusy}
              hasBoard={hasBoard}
              draggingCardId={draggingCardId}
              onDropColumn={handleDropOnColumn}
              onDropCard={handleDropOnCard}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onOpenEditor={openEditor}
              onDeleteCard={handleDeleteCard}
            />
          ))}
        </div>
      </section>

      {editor && (
        <EditorModal
          editor={editor}
          isBusy={isBusy}
          onClose={closeEditor}
          onChange={(next) => setEditor(next)}
          onSubmit={handleEditorSubmit}
        />
      )}
    </div>
  )
}

export default App
