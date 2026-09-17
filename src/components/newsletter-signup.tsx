import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

/**
 * Newsletter v1 (Issue #53), Model D: the browser POSTs straight to
 * Buttondown's public embed endpoint and the cross-origin response lands in a
 * hidden iframe, so the provider can never block or break the page the reader
 * is on. What this file renders is the entire integration — no backend, no
 * server function, no API key, no first-party subscriber store, and no
 * `src/integrations/` mapping layer, because there is no payload to map.
 *
 * The consequence, accepted in Decision #2: the first-party UI cannot know
 * whether Buttondown accepted the signup. The iframe's content is opaque to
 * JavaScript, so no local state claims a provider-side outcome. Double opt-in
 * remains the authoritative confirmation.
 *
 * Endpoint, hidden `embed` field and hosted URL come from Buttondown's own
 * embed snippet. The username's casing is the canonical one: the lowercase
 * spelling answers with a redirect, which a POST would not survive intact.
 */
const BUTTONDOWN_USERNAME = 'HrqHits'
const BUTTONDOWN_ACTION = `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`
const BUTTONDOWN_HOSTED_URL = `https://buttondown.com/${BUTTONDOWN_USERNAME}`
const BUTTONDOWN_PRIVACY_URL = 'https://buttondown.com/legal/privacy'

/**
 * Fixed string rather than `useId()`: `target` and `name` have to match, and
 * at most one of these forms exists per page.
 */
const IFRAME_NAME = 'newsletter-response'

/**
 * Decision #4: a fixed, short delay, deliberately not `iframe.onload`. That
 * event carries no meaning across origins — it fires the same way for
 * success, rejection and duplicate — and waiting on an event that may never
 * fire would strand the form in "sending" forever.
 */
const SENT_DELAY_MS = 800

type SignupState = 'idle' | 'invalid' | 'submitting' | 'sent'

export function NewsletterSignup() {
  const emailId = useId()
  const errorId = useId()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<SignupState>('idle')
  const honeypotRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /**
   * Guards the synchronous window a second submit can slip through: React has
   * not re-rendered yet when the browser dispatches it, so the `submitting`
   * state is not observable there. This is control flow, not UI state.
   */
  const submittedRef = useRef(false)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    // The neutral message and its fallback leave only here — never on submit,
    // which would read as "nothing happened".
    if (state === 'sent') setState('idle')
  }

  /**
   * Native validation blocks an invalid submit before `onSubmit` ever runs, so
   * this — not the submit handler — is where the first-party error comes from.
   * The native bubble is not suppressed: keeping it costs a duplicated message
   * in this one case and keeps validation working before hydration.
   */
  function handleInvalid() {
    setState('invalid')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Honeypot: read locally through the ref, since the field has no `name`
    // and therefore never reaches the POST.
    if (honeypotRef.current && honeypotRef.current.value !== '') {
      event.preventDefault()
      return
    }

    if (submittedRef.current) {
      event.preventDefault()
      return
    }

    // No `preventDefault()` past this point — the native cross-origin POST is
    // the feature. Cancelling here would leave a form that animates correctly
    // and sends nothing.
    submittedRef.current = true
    setState('submitting')

    timeoutRef.current = setTimeout(() => {
      submittedRef.current = false
      setEmail('')
      setState('sent')
    }, SENT_DELAY_MS)
  }

  return (
    <div className="space-y-3 border-t border-muted-foreground pt-8">
      <form
        action={BUTTONDOWN_ACTION}
        method="post"
        target={IFRAME_NAME}
        onSubmit={handleSubmit}
        aria-busy={state === 'submitting'}
        className="space-y-3"
      >
        <label htmlFor={emailId} className="block text-sm text-muted-foreground">
          Get Developer OS updates by email
        </label>

        <div className="flex flex-wrap gap-2">
          <input
            id={emailId}
            type="email"
            name="email"
            required
            value={email}
            onChange={handleEmailChange}
            onInvalid={handleInvalid}
            // `readOnly`, never `disabled`: a disabled control is not
            // serialized, and React commits this re-render before the browser
            // builds the form's entry list — the address would be dropped.
            readOnly={state === 'submitting'}
            aria-invalid={state === 'invalid'}
            aria-describedby={state === 'invalid' ? errorId : undefined}
            autoComplete="email"
            className="min-w-0 flex-1 border border-muted-foreground bg-background px-3 py-2 text-foreground"
          />
          <button
            type="submit"
            disabled={state === 'submitting'}
            className="border border-foreground px-3 py-2 text-sm text-foreground"
          >
            Subscribe
          </button>
        </div>

        {/* Honeypot (Decision #7): no `name`, so it is never serialized and
            Buttondown never receives a field it did not ask for. Off-screen,
            out of the tab order and out of the accessibility tree, and opted
            out of autofill, so a real visitor never fills it. Noise
            reduction against trivial automation — not a security boundary,
            and no substitute for whatever screening the provider does. */}
        <input
          ref={honeypotRef}
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          className="absolute left-[-9999px] h-px w-px overflow-hidden"
        />

        <input type="hidden" name="embed" value="1" />

        {state === 'invalid' && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            Enter a valid email address.
          </p>
        )}

        {/* Always mounted so the region exists before it has anything to
            announce. Neutral by contract: it reports that the request left,
            never that a subscription exists. */}
        <div aria-live="polite" className="space-y-1">
          {state === 'sent' && (
            <>
              <p className="text-sm text-muted-foreground">
                Request sent. Check your inbox to confirm your subscription. If nothing arrives
                in a few minutes, try again.
              </p>
              {/* Recovery route, not a second placement: when Buttondown
                  answers with a CAPTCHA or a correction, that response is
                  swallowed by the hidden iframe and the subscriber never sees
                  it. This link is how they finish anyway. */}
              <p className="text-sm text-muted-foreground">
                Having trouble? Subscribe directly on{' '}
                <a href={BUTTONDOWN_HOSTED_URL} className="underline underline-offset-2">
                  Buttondown
                </a>
                .
              </p>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Your email is processed by Buttondown, the service that hosts this newsletter. See{' '}
          <a href={BUTTONDOWN_PRIVACY_URL} className="underline underline-offset-2">
            Buttondown's privacy policy
          </a>
          . You can unsubscribe at any time.
        </p>
      </form>

      {/* The response target. Kept out of the tab order and out of the
          accessibility tree: it is plumbing, not a surface. */}
      <iframe
        name={IFRAME_NAME}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute h-0 w-0 border-0 opacity-0"
      />
    </div>
  )
}
