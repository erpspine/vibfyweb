import { Clock3, Eye, Search, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, PageHeading } from '../../components/ui'
import { api } from '../../api'

export default function HostApprovalsPage() {
  const [filter, setFilter] = useState('All'); const [hosts, setHosts] = useState([]); const [query, setQuery] = useState(''); const [error, setError] = useState('')
  const dialog = useRef(null)
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState('view')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => { if (selected && !dialog.current.open) dialog.current.showModal() }, [selected])
  function open(host, nextAction) { setSelected(host); setAction(nextAction); setActionError('') }
  function close() { if (!busy) { dialog.current.close(); setSelected(null) } }
  async function review(decision) {
    setBusy(true); setActionError(''); setNotice('')
    try {
      const result = await api(decision === 'approve' ? `/manager/venues/${selected.venue.id}/activate` : `/manager/hosts/${selected.id}/reject`, { method: 'POST', showErrorAlert: false })
      const updated = { ...selected, status: decision === 'approve' ? 'Approved' : 'Rejected', venue: result.venue || selected.venue }
      setHosts(current => current.map(host => host.id === updated.id ? updated : host))
      setSelected(updated); setAction('view'); setNotice(result.message)
      if (result.warning) setActionError(result.warning)
    } catch (problem) { setActionError(problem.message) }
    finally { setBusy(false) }
  }
  function exportRecords() {
    const cell = value => '"' + String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""') + '"'
    const rows = [['Business', 'Owner', 'Category', 'Location', 'Submitted', 'Status'], ...visible.map(host => [host.name, host.owner, host.type, host.location, host.submitted, host.status])]
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = 'vibfy-host-applications.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  useEffect(() => { api('/manager/hosts').then(result => setHosts(result.hosts || [])).catch(problem => setError(problem.message)) }, [])
  const visible = useMemo(() => hosts.filter(host => (filter === 'All' || (filter === 'New' ? host.status === 'Review' : host.status === filter)) && `${host.name} ${host.owner} ${host.location}`.toLowerCase().includes(query.toLowerCase())), [hosts, filter, query])
  return <><PageHeading badge={<Badge tone="amber"><Clock3 size={13} /> {hosts.filter(host => host.status === 'Review').length} awaiting action</Badge>} title="Host approvals" description="Review and enroll trusted businesses onto the Vibfy platform."><button className="secondary-button" onClick={exportRecords} disabled={!visible.length}><UploadCloud size={18} />Export records</button></PageHeading>
    {notice && <p role="status">{notice}</p>}{error && <p className="auth-error" role="alert">{error}</p>}<div className="filter-row"><div className="filter-tabs">{['All', 'Review', 'Approved', 'Rejected'].map(item => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div className="table-search"><Search size={16} /><input placeholder="Search applications" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
    <section className="panel table-panel"><div className="data-table"><div className="table-row table-head"><span>Business</span><span>Category</span><span>Location</span><span>Submitted</span><span>Status</span><span>Action</span></div>{visible.map((host, index) => <div className="table-row" key={host.id}><div className="business-cell"><div className={`business-avatar color-${index % 6}`}>{host.name.slice(0, 2).toUpperCase()}</div><div><strong>{host.name}</strong><small>{host.owner}</small></div></div><span>{host.type}</span><span>{host.location}</span><span>{host.submitted ? new Date(host.submitted).toLocaleDateString() : '-'}</span><span><Badge tone={host.status === 'Approved' ? 'green' : 'amber'}>{host.status}</Badge></span><div className="row-actions"><button className="host-review-action" aria-label={`Review ${host.name}`} onClick={() => open(host, 'view')}><Eye size={17} /><span>Review</span></button></div></div>)}</div>{!visible.length && <div className="venue-empty"><h2>No applications found</h2><p>Try another search or status filter.</p></div>}</section>
    <dialog ref={dialog} className="md-dialog manager-event-dialog" aria-labelledby="host-review-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === dialog.current) close() }} onClose={() => setSelected(null)}>
      {selected && <>
        <div className="md-heading"><h2 id="host-review-title">{selected.name}</h2><button disabled={busy} onClick={close} aria-label="Close host details">×</button></div>
        <dl><dt>Owner</dt><dd>{selected.owner}</dd><dt>Email</dt><dd>{selected.email || 'Not provided'}</dd><dt>Phone</dt><dd>{selected.venue?.phone || 'Not provided'}</dd><dt>Category</dt><dd>{selected.type}</dd><dt>Address</dt><dd>{selected.venue?.address || selected.location}</dd><dt>Location</dt><dd>{selected.location}</dd><dt>Status</dt><dd>{selected.status}</dd></dl>
        {selected.venue?.description && <p>{selected.venue.description}</p>}
        {actionError && <p className="auth-error" role="alert">{actionError}</p>}
        <div className="manager-event-actions" aria-busy={busy}>
          {action === 'approve' ? <><p>Approve this host and activate their venue? The host will receive an approval email if an email address is available.</p><button disabled={busy || !selected.venue} onClick={() => review('approve')}>{busy ? 'Approving…' : 'Confirm approval'}</button><button disabled={busy} onClick={() => setAction('manage')}>Cancel</button></>
          : action === 'reject' ? <><p>Reject this pending host application? Host management access will remain unavailable.</p><button className="danger-action" disabled={busy} onClick={() => review('reject')}>{busy ? 'Rejecting…' : 'Confirm rejection'}</button><button disabled={busy} onClick={() => setAction('manage')}>Cancel</button></>
          : <>{selected.status !== 'Approved' && <button disabled={busy || !selected.venue} onClick={() => setAction('approve')}>Approve host</button>}{selected.status === 'Review' && <button className="danger-action" disabled={busy} onClick={() => setAction('reject')}>Reject application</button>}</>}
        </div>
        <button className="md-primary" disabled={busy} onClick={close}>Close</button>
      </>}
    </dialog></>
}
