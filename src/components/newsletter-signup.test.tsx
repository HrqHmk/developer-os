// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsletterSignup } from './newsletter-signup'

const ACTION = 'https://buttondown.com/api/emails/embed-subscribe/HrqHits'
const HOSTED_URL = 'https://buttondown.com/HrqHits'
const SENT_DELAY_MS = 800

/**
 * jsdom implements no form submission, so nothing here asserts that a POST
 * happened, that the entry list was serialized, or that the iframe navigated
 * — that evidence belongs to the operational validation against the real
 * provider in a real browser.
 *
 * What jsdom does represent is whether the component lets the browser get on
 * with it, and that is what these tests hold to: a valid submit has to reach
 * the default action uncancelled, while the honeypot and the double-submit
 * guard have to cancel it. So the valid submit is never cancelled by the test
 * either, and `HTMLFormElement.prototype.submit` is never stubbed in as a
 * stand-in for the real flow — `defaultPrevented`, observed from `document`,
 * is the whole mechanism.
 *
 * Two jsdom artefacts are worked around here, neither by changing production
 * behaviour:
 *
 * - an uncancelled submit prints "Not implemented: HTMLFormElement's
 *   requestSubmit()". That line is the proof the submit was not cancelled,
 *   not a failure to silence;
 * - user-event's click never settles once jsdom reaches that unimplemented
 *   call, and its typing never settles under fake timers. So submits go
 *   through `fireEvent.click` — the same click, on the same button, from
 *   which jsdom fires the same `submit` event — and the clock is only faked
 *   after the typing is done, in the two tests that advance it.
 */
function setup() {
  const user = userEvent.setup()
  const { container } = render(<NewsletterSignup />)

  const form = container.querySelector('form')
  if (!form) throw new Error('No form rendered')

  const iframe = container.querySelector('iframe')
  if (!iframe) throw new Error('No response iframe rendered')

  // The only text input carrying no `name` is the honeypot — which is itself
  // one of the contracts asserted below.
  const honeypot = container.querySelector<HTMLInputElement>('input[type="text"]')
  if (!honeypot) throw new Error('No honeypot rendered')

  return { user, container, form, iframe, honeypot }
}

/**
 * Observes the submit where the browser's default action is decided: on
 * `document`, after React's delegated listener on the render container has
 * run, so `defaultPrevented` reflects the component's decision rather than
 * the order the listeners happened to be attached in.
 */
function watchSubmit() {
  const events: Event[] = []
  const listener = (event: Event) => events.push(event)
  document.addEventListener('submit', listener)
  return { events, stop: () => document.removeEventListener('submit', listener) }
}

function emailField(): HTMLInputElement {
  return screen.getByRole('textbox', {
    name: 'Receba atualizações do Developer OS por e-mail',
  }) as HTMLInputElement
}

function subscribeButton() {
  return screen.getByRole('button', { name: 'Inscrever' })
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('NewsletterSignup — behaviour', () => {
  it('labels the email field accessibly', () => {
    setup()

    expect(emailField()).toBeDefined()
  })

  it('reports an invalid address through onInvalid, without entering the submitting state', async () => {
    // Native validation blocks an invalid submit before `onSubmit` ever runs,
    // so the first-party error has to come from `onInvalid`. Wired to the
    // submit handler instead, no message would ever appear. A real click is
    // used here because this is the path that must run the browser's own
    // constraint validation.
    const { user, form } = setup()

    await user.type(emailField(), 'not-an-email')
    await user.click(subscribeButton())

    const error = screen.getByRole('alert')
    expect(error.textContent).toBe('Informe um endereço de e-mail válido.')
    expect(emailField().getAttribute('aria-invalid')).toBe('true')
    expect(emailField().getAttribute('aria-describedby')).toBe(error.getAttribute('id'))

    expect(form.getAttribute('aria-busy')).toBe('false')
    expect(subscribeButton().hasAttribute('disabled')).toBe(false)
  })

  it('lets a valid submit through uncancelled and enters the submitting state', async () => {
    const { user, form } = setup()
    const submits = watchSubmit()

    await user.type(emailField(), 'reader@example.com')
    fireEvent.click(subscribeButton())
    submits.stop()

    expect(submits.events).toHaveLength(1)
    // The assertion the whole integration rests on: cancelling here would
    // leave every visible state working and send nothing at all.
    expect(submits.events[0].defaultPrevented).toBe(false)

    expect(form.getAttribute('aria-busy')).toBe('true')
    expect(subscribeButton().hasAttribute('disabled')).toBe(true)
    // `readOnly`, never `disabled`: a disabled control is not serialized into
    // the entry list, and React commits this re-render before the browser
    // builds it — the address itself would be dropped.
    expect(emailField().readOnly).toBe(true)
    expect(emailField().disabled).toBe(false)
  })

  it('settles into the neutral message once the fixed delay elapses, and leaves it once the visitor types again', async () => {
    const { user, form } = setup()

    await user.type(emailField(), 'reader@example.com')
    vi.useFakeTimers()
    fireEvent.click(subscribeButton())

    act(() => {
      vi.advanceTimersByTime(SENT_DELAY_MS)
    })

    // The exact copy frozen in Decision #4: it reports that the request left,
    // never that a subscription exists.
    expect(
      screen.getByText('Solicitação enviada. Confira seu e-mail para confirmar a inscrição.'),
    ).toBeDefined()
    // The recovery fallback (Decision #4/§4 of the plan) belongs to the same
    // `sent` state and to no other — it has to be live here too.
    expect(screen.getByRole('link', { name: 'diretamente no Buttondown' })).toBeDefined()
    expect(emailField().value).toBe('')
    expect(emailField().readOnly).toBe(false)
    expect(subscribeButton().hasAttribute('disabled')).toBe(false)
    expect(form.getAttribute('aria-busy')).toBe('false')

    // Decision #4: the neutral message and the fallback leave only when the
    // visitor starts typing again — never on submit itself, which would read
    // as "nothing happened". `fireEvent`, not `user.type`: fake timers are
    // active by this point in the test, and user-event does not settle
    // under them (see the file header).
    fireEvent.change(emailField(), { target: { value: 'r' } })

    expect(
      screen.queryByText('Solicitação enviada. Confira seu e-mail para confirmar a inscrição.'),
    ).toBeNull()
    expect(screen.queryByRole('link', { name: 'diretamente no Buttondown' })).toBeNull()
    // The keystroke that triggered the transition is not swallowed by it.
    expect(emailField().value).toBe('r')
  })

  it('cancels a second submit fired inside the synchronous guard window', () => {
    // Two submits with no render in between: the `submitting` state is not
    // observable yet, so only the ref guard can stop the second one.
    const { form } = setup()
    fireEvent.change(emailField(), { target: { value: 'reader@example.com' } })

    const first = new Event('submit', { bubbles: true, cancelable: true })
    const second = new Event('submit', { bubbles: true, cancelable: true })

    act(() => {
      form.dispatchEvent(first)
      form.dispatchEvent(second)
    })

    expect(first.defaultPrevented).toBe(false)
    expect(second.defaultPrevented).toBe(true)
  })

  it('discards a submit silently when the honeypot is filled', async () => {
    const { user, form, honeypot } = setup()
    const submits = watchSubmit()

    honeypot.value = 'https://spam.example'
    await user.type(emailField(), 'bot@example.com')
    fireEvent.click(subscribeButton())
    submits.stop()

    expect(submits.events).toHaveLength(1)
    expect(submits.events[0].defaultPrevented).toBe(true)

    // Silently: nothing on screen tells the sender why, and no state moves.
    expect(screen.queryByRole('alert')).toBeNull()
    expect(form.getAttribute('aria-busy')).toBe('false')
    expect(subscribeButton().hasAttribute('disabled')).toBe(false)
  })

  it('keeps the response iframe out of the tab order and the accessibility tree', () => {
    const { iframe } = setup()

    expect(iframe.getAttribute('tabindex')).toBe('-1')
    expect(iframe.getAttribute('aria-hidden')).toBe('true')
  })

  it('keeps the honeypot nameless, unfocusable and hidden from assistive technology', () => {
    const { honeypot } = setup()

    // No `name` is the point: read through a ref, never serialized, so the
    // provider never receives a field it did not ask for.
    expect(honeypot.hasAttribute('name')).toBe(false)
    expect(honeypot.getAttribute('tabindex')).toBe('-1')
    expect(honeypot.getAttribute('aria-hidden')).toBe('true')
    expect(honeypot.getAttribute('autocomplete')).toBe('off')
  })
})

describe('NewsletterSignup — Model D structural contract', () => {
  it('posts natively, with the browser’s own validation left in place', () => {
    const { form } = setup()

    expect(form.getAttribute('method')).toBe('post')
    // `noValidate` would remove the validation the pre-hydration path relies
    // on, and with it the event the first-party error is built from.
    expect(form.hasAttribute('novalidate')).toBe(false)
  })

  it('targets the Buttondown embed endpoint', () => {
    const { form } = setup()

    expect(form.getAttribute('action')).toBe(ACTION)
  })

  it('directs the response into the hidden iframe', () => {
    const { form, iframe } = setup()

    const target = form.getAttribute('target')
    expect(target).toBeTruthy()
    expect(target).toBe(iframe.getAttribute('name'))
  })

  it('sends the email and the field the provider requires, and nothing else', () => {
    const { form } = setup()

    const email = form.querySelector<HTMLInputElement>('input[name="email"]')
    expect(email?.type).toBe('email')
    expect(email?.required).toBe(true)

    const embed = form.querySelector<HTMLInputElement>('input[name="embed"]')
    expect(embed?.type).toBe('hidden')
    expect(embed?.value).toBe('1')

    // The payload stated as a set: email is the only personal data collected,
    // so a name, a tag or any other field added later has to be a deliberate
    // change to this list.
    const named = Array.from(form.querySelectorAll<HTMLInputElement>('input[name]')).map(
      (input) => input.name,
    )
    expect(named.sort()).toEqual(['email', 'embed'])
  })

  it('renders the response iframe', () => {
    const { iframe } = setup()

    expect(iframe.getAttribute('name')).toBeTruthy()
  })

  it('offers the hosted Buttondown surface as a recovery route in the neutral state', async () => {
    // The response the hidden iframe swallows — a CAPTCHA, a correction — is
    // recoverable only through this link, so its absence is a defect and not
    // a missing nicety. It belongs to the neutral state and to no other.
    const { user } = setup()

    expect(screen.queryByRole('link', { name: 'diretamente no Buttondown' })).toBeNull()

    await user.type(emailField(), 'reader@example.com')
    vi.useFakeTimers()
    fireEvent.click(subscribeButton())
    act(() => {
      vi.advanceTimersByTime(SENT_DELAY_MS)
    })

    const fallback = screen.getByRole('link', { name: 'diretamente no Buttondown' })
    expect(fallback.getAttribute('href')).toBe(HOSTED_URL)
  })

  it('exposes no credential in the rendered DOM', () => {
    // Model D was chosen partly because it needs no secret at all, and no
    // first-party secret exists anywhere in this project. A credential
    // surfacing here would mean the integration model itself had changed.
    const { container } = setup()

    expect(container.innerHTML).not.toMatch(/api[-_ ]?key|secret|token|bearer|authorization/i)
  })
})
