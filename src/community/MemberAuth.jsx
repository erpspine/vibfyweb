import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Mail, MessageCircle } from 'lucide-react'
import { api, saveSession } from '../api'
import { useRouter } from '../router'
import { CommunityLayout, CommunityLink } from './CommunityHeader'

export default function MemberAuth({ register = false, returnTo }) {
  const { navigate, search } = useRouter()
  const [challenge, setChallenge] = useState(null)
  const [busy, setBusy] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [contactType, setContactType] = useState('email')
  const nextParam = returnTo || new URLSearchParams(search).get('next')
  const next = nextParam?.startsWith('/') && !nextParam.startsWith('//') && !nextParam.includes('\\') ? nextParam : '/discover'
  const suffix = `?next=${encodeURIComponent(next)}`
  function receiveChallenge(data) {
    const entry = Object.entries(data.verification || {}).find(([, item]) => !item.verified)
    const pending = entry ? { ...entry[1], channel: entry[0] } : null
    if (pending) setChallenge(pending)
    return pending
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    const form = Object.fromEntries(new FormData(event.currentTarget))
    try {
      if (register && !challenge) {
        form.phone = form.phone?.replace(/[\s()-]/g, '') || null
        form.email = form.email?.trim() || null
        if (contactType === 'phone' && !form.phone) throw new Error('Enter your WhatsApp phone number to receive a verification code.')
        if (form.phone && !/^\+[1-9]\d{7,14}$/.test(form.phone)) throw new Error('Enter your phone number with its country code, for example +255712345678.')
      }
      const payload = challenge ? { challenge_id: challenge.challenge_id, code: form.code, device_name: 'vibfy-web' } : register ? { ...form, contact_type: contactType, device_name: 'vibfy-web' } : { identifier: form.identifier, password: form.password, device_name: 'vibfy-web' }
      const data = await api(challenge ? '/register/verify' : register ? '/register' : '/login', { method: 'POST', body: JSON.stringify(payload) })
      if (data.token) {
        // Refresh accesses after verification; that endpoint returns no portal roles.
        saveSession({ token: data.token, user: data.user, portalAccesses: data.portal_accesses || [] })
        try { const current = await api('/user'); saveSession({ token: data.token, user: current.user, portalAccesses: current.portal_accesses || [] }) } catch {}
        navigate(next)
      } else if (receiveChallenge(data)) {
        const deliveryError = Object.values(data.delivery_errors || {}).join(' ')
        if (deliveryError) setError(deliveryError)
        else setNotice(data.message || 'Your verification code is on its way.')
      } else { setError('No verification request is available. Please try logging in or contact support.') }
    } catch (problem) {
      if (problem.body?.verification_required) receiveChallenge(problem.body)
      setError(problem.message)
    } finally { setBusy(false) }
  }
  async function resend() {
    setBusy(true); setError(''); setNotice('')
    try { const data = await api('/register/resend', { method: 'POST', body: JSON.stringify({ challenge_id: challenge.challenge_id }) }); receiveChallenge(data); setNotice(data.message) } catch (problem) { setError(problem.message) } finally { setBusy(false) }
  }
  return <CommunityLayout>
    <section className="community-auth">
      <div className="community-auth-story"><span className="vf-eyebrow">ONE ACCOUNT. A WORLD OF EXPERIENCES.</span><h1>Your people.<br />Your places.<br /><em>Your Vibfy.</em></h1><p>Discover a new favourite. Make a memory. Bring people together. It all starts with you.</p></div>
      <form className="community-form" onSubmit={submit}>
        <span className="vf-eyebrow">{challenge ? 'ONE LAST THING' : register ? 'MAKE YOURSELF AT HOME' : 'GOOD TO SEE YOU AGAIN'}</span>
        <h2>{challenge ? 'Verify your account' : register ? 'Join the community.' : 'Welcome back.'}</h2>
        <p>{challenge ? `Enter the 6-digit code sent ${challenge.channel === 'phone' ? 'on WhatsApp to' : 'by email to'} ${challenge.target}.` : 'Your community and host tools share the same account.'}</p>
        {challenge ? <label>Verification code<input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} /></label> : <>
          {register && <>
            <label>Your name<input name="name" autoComplete="name" required maxLength={255} /></label>
            <label>Gender<select name="gender" required defaultValue="prefer_not_to_say"><option value="prefer_not_to_say">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Non-binary</option></select></label>
            <fieldset className="verification-channel"><legend>Where should we send your verification code?</legend>
              <label className={contactType === 'email' ? 'selected' : ''}><input type="radio" name="verification_channel" value="email" checked={contactType === 'email'} onChange={() => { setContactType('email'); setError('') }} /><Mail size={20} /><span><strong>Email</strong><small>Send it to my inbox</small></span></label>
              <label className={contactType === 'phone' ? 'selected' : ''}><input type="radio" name="verification_channel" value="phone" checked={contactType === 'phone'} onChange={() => { setContactType('phone'); setError('') }} /><MessageCircle size={20} /><span><strong>Phone / WhatsApp</strong><small>Send it on WhatsApp</small></span></label>
            </fieldset>
          </>}
          <label>{register ? 'Email address' : 'Email or phone number'}{register && contactType === 'phone' && <span className="community-field-optional">(optional)</span>}<input name={register ? 'email' : 'identifier'} type={register ? 'email' : 'text'} autoComplete={register ? 'email' : 'username'} inputMode={register ? 'email' : 'email'} required={!register || contactType === 'email'} placeholder={register ? 'you@example.com' : 'you@example.com or +255 712 345 678'} /></label>
          {register && <label>Phone number {contactType === 'email' && <span className="community-field-optional">(optional)</span>}<input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+255 712 345 678" maxLength={30} required={contactType === 'phone'} aria-describedby="signup-phone-help" /><small id="signup-phone-help" className="community-field-help">{contactType === 'phone' ? 'Required. Use a number with WhatsApp, including its country code. We will send your verification code there.' : 'Include your country code if provided. Your verification code will be sent by email.'}</small></label>}
          <label>Password<div className="community-password"><input name="password" type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : undefined} /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          {register && <label>Confirm password<input name="password_confirmation" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} /></label>}
        </>}
        {error && <p className="community-error" role="alert">{error}</p>}
        {notice && <p role="status" className="community-notice">{notice}</p>}
        <button className="vf-button" disabled={busy}>{busy ? 'Please wait...' : challenge ? 'Verify and continue' : register ? 'Create my account' : 'Log in'}<ArrowRight size={17} /></button>
        {challenge ? <button className="community-text-button" disabled={busy} type="button" onClick={resend}>Resend verification code</button> : <p>{register ? 'Already part of Vibfy?' : 'New around here?'} <CommunityLink to={`${register ? '/login' : '/signup'}${suffix}`}>{register ? 'Log in' : 'Join the community'}</CommunityLink></p>}
      </form>
    </section>
  </CommunityLayout>
}
