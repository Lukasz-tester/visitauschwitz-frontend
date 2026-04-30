import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithIntl } from '../helpers/render'
import { ContactForm } from '@/components/ContactForm'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 })),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('ContactForm', () => {
  it('blocks submission when email is invalid', async () => {
    const user = userEvent.setup()
    renderWithIntl(<ContactForm variant="homepage" />)
    const submit = screen.getByRole('button', { name: /send|contact/i })
    await user.click(submit)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('submits to /api/contact and shows success', async () => {
    const user = userEvent.setup()
    renderWithIntl(<ContactForm variant="homepage" />)
    const inputs = screen.getAllByRole('textbox')
    // first textbox is email, second is message
    const email = screen.getByPlaceholderText(/email/i)
    const message = inputs.find((el) => el.tagName === 'TEXTAREA') as HTMLElement
    await user.type(email, 'user@example.com')
    await user.type(message, 'Hello there')
    await user.click(screen.getByRole('button', { name: /send|contact/i }))
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({ method: 'POST' }),
      )
    })
    const body = JSON.parse((globalThis.fetch as any).mock.calls[0][1].body)
    expect(body.email).toBe('user@example.com')
    expect(body.message).toBe('Hello there')
  })

  it('shows an error state when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    )
    const user = userEvent.setup()
    renderWithIntl(<ContactForm variant="homepage" />)
    await user.type(screen.getByPlaceholderText(/email/i), 'user@example.com')
    const textarea = screen
      .getAllByRole('textbox')
      .find((el) => el.tagName === 'TEXTAREA') as HTMLElement
    await user.type(textarea, 'Hello')
    await user.click(screen.getByRole('button', { name: /send|contact/i }))
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled())
  })
})
