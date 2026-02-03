import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'

const baseProps = {
  boardIdInput: '',
  boardCreateDraft: '',
  isBusy: false,
  apiBase: 'http://localhost:3000/api',
  onBoardIdChange: () => {},
  onBoardCreateChange: () => {},
  onLoadBoard: () => {},
  onCreateBoard: () => {},
}

describe('Hero', () => {
  it('renders load and create actions', () => {
    render(<Hero {...baseProps} />)

    expect(screen.getByText('Load a board by ID')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('disables actions while busy', () => {
    render(<Hero {...baseProps} isBusy />)

    expect(screen.getByRole('button', { name: 'Load' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })
})
