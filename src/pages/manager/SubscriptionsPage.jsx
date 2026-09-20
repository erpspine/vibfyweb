import { Check, Pencil, Plus, RefreshCw, Save, WalletCards, X, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api, getSession } from '../../api';
import { Badge, PageHeading } from '../../components/ui';

const blank = { name: '', description: '', price: '', currency: 'TZS', billing_interval: 'monthly', features: '', is_active: true, is_popular: false };

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const dialog = useRef(null);
  const canManage = getSession()?.portalAccesses?.some(access => access.portal === 'manager' && ['owner', 'admin'].includes(access.role));
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api('/manager/subscription-plans', { showErrorAlert: false })
      .then(result => { if (active) setPlans(result.plans); })
      .catch(problem => { if (active) setError(problem.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  const open = (plan = null) => {
    setEditing(plan); setFormError(''); setNotice('');
    setForm(plan ? { ...plan, features: plan.features.join('\n') } : { ...blank });
    dialog.current.showModal();
  };
  const close = () => { if (!saving) dialog.current.close(); };
  const field = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const save = async event => {
    event.preventDefault();
    if (saving) return;
    const payload = {
      name: form.name.trim(), description: form.description?.trim() || '',
      price: form.price, currency: form.currency, billing_interval: form.billing_interval,
      features: form.features.split('\n').map(feature => feature.trim()).filter(Boolean),
      is_active: form.is_active, is_popular: form.is_popular,
    };
    if (!payload.features.length) { setFormError('Add at least one plan feature.'); return; }
    setSaving(true); setFormError('');
    try {
      const result = await api('/manager/subscription-plans' + (editing ? '/' + editing.id : ''), {
        method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload), showErrorAlert: false,
      });
      setPlans(current => [...current.filter(plan => plan.id !== result.plan.id), result.plan].sort((a, b) => Number(a.price) - Number(b.price) || a.name.localeCompare(b.name)));
      setNotice(result.message);
      dialog.current.close();
    } catch (problem) { setFormError(problem.message); }
    finally { setSaving(false); }
  };
  return <div className="manager-subscriptions">
    <PageHeading badge={<Badge tone="purple"><WalletCards size={13} /> Billing control</Badge>} title="Subscriptions" description="Manage your platform's subscription plans.">
      {canManage && <button className="primary-button" onClick={() => open()}><Plus size={18} />Create plan</button>}
    </PageHeading>
    {notice && <p className="plan-notice" role="status"><Check size={17} />{notice}</p>}
    {loading ? <section className="md-state" role="status"><RefreshCw size={24} /><p>Loading plans...</p></section> : error ? <section className="md-state" role="alert"><p>{error}</p><button className="primary-button" onClick={() => setRevision(value => value + 1)}><RefreshCw size={17} />Try again</button></section> : plans.length ? <div className="plan-grid">
      {plans.map(plan => <article className={'pricing-card' + (plan.is_popular ? ' popular' : '')} key={plan.id}>
        <div className="plan-card-top"><span className="plan-glyph"><Zap size={24} /></span><div>{!plan.is_active && <Badge>Inactive</Badge>}{plan.is_popular && <Badge tone="purple">Most popular</Badge>}</div></div>
        <h2>{plan.name}</h2><p>{plan.description}</p>
        <div className="price"><small>{plan.currency === 'TZS' ? 'TSh' : plan.currency}</small><strong>{Number(plan.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong><span>/{plan.billing_interval === 'yearly' ? 'yr' : 'mo'}</span></div>
        <ul>{plan.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
        {canManage && <button className="secondary-button" onClick={() => open(plan)}><Pencil size={15} />Manage plan</button>}
      </article>)}
    </div> : <section className="md-state"><WalletCards size={28} /><h2>No subscription plans yet</h2></section>}
    <dialog className="plan-editor" ref={dialog} aria-labelledby="plan-editor-title" onCancel={event => { if (saving) event.preventDefault(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
      <form onSubmit={save}>
        <div className="plan-editor-heading"><h2 id="plan-editor-title">{editing ? 'Edit plan' : 'Create plan'}</h2><button type="button" className="manager-icon" aria-label="Close plan editor" onClick={close} disabled={saving}><X size={21} /></button></div>
        <fieldset disabled={saving}>
          <label>Plan name<input autoFocus required maxLength={100} value={form.name} onChange={event => field('name', event.target.value)} /></label>
          <label>Description<textarea rows={2} maxLength={500} value={form.description || ''} onChange={event => field('description', event.target.value)} /></label>
          <div className="plan-form-grid">
            <label>Price<input required type="number" min="0" max="9999999999.99" step="0.01" value={form.price} onChange={event => field('price', event.target.value)} /></label>
            <label>Currency<select value={form.currency} onChange={event => field('currency', event.target.value)}>{['TZS', 'USD', 'KES', 'EUR', 'GBP'].map(currency => <option key={currency}>{currency}</option>)}</select></label>
            <label>Billing period<select value={form.billing_interval} onChange={event => field('billing_interval', event.target.value)}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label>
          </div>
          <label>Features (one per line)<textarea required rows={4} value={form.features} onChange={event => field('features', event.target.value)} /></label>
          <div className="plan-options"><label><input type="checkbox" checked={form.is_active} onChange={event => field('is_active', event.target.checked)} />Active</label><label><input type="checkbox" checked={form.is_popular} onChange={event => field('is_popular', event.target.checked)} />Most popular</label></div>
        </fieldset>
        {formError && <p className="plan-form-error" role="alert">{formError}</p>}
        <div className="plan-editor-actions"><button type="button" className="secondary-button" disabled={saving} onClick={close}>Cancel</button><button type="submit" className="primary-button" disabled={saving}><Save size={17} />{saving ? 'Saving...' : editing ? 'Save changes' : 'Create plan'}</button></div>
      </form>
    </dialog>
  </div>;
}
