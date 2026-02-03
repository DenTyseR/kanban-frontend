import { render, screen } from '@testing-library/react'
import { BoardHeader } from './BoardHeader'

describe('BoardHeader', () => {
  it('shows empty state when no board is loaded', () => {
    render(
      <BoardHeader
        board={null}
        cardsCount={0}
        boardNameDraft=""
        isBusy={false}
        onBoardNameChange={() => {}}
        onRenameBoard={() => {}}
        onDeleteBoard={() => {}}
      />,
    )

    expect(screen.getByText('No board loaded yet')).toBeInTheDocument()
    expect(
      screen.getByText('Load or create a board to get started.'),
    ).toBeInTheDocument()
  })

  it('shows board name and count when loaded', () => {
    render(
      <BoardHeader
        board={{ id: 'abc', name: 'Sprint Board' }}
        cardsCount={3}
        boardNameDraft="Sprint Board"
        isBusy={false}
        onBoardNameChange={() => {}}
        onRenameBoard={() => {}}
        onDeleteBoard={() => {}}
      />,
    )

    expect(screen.getByText('Sprint Board')).toBeInTheDocument()
    expect(screen.getByText('Board ID: abc - 3 cards')).toBeInTheDocument()
  })
})
