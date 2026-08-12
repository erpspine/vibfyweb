import { Check, Clock3, Eye, MoreHorizontal, Search, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { hosts } from '../../data/mockData'
import { Badge, PageHeading } from '../../components/ui'

export default function HostApprovalsPage() {
  const [filter, setFilter] = useState('All'); const [approved, setApproved] = useState([])
  const visible = hosts.filter(host => filter === 'All' || host.status === filter)
  return <><PageHeading badge={<Badge tone="amber"><Clock3 size={13} /> 4 awaiting action</Badge>} title="Host approvals" description="Review and enroll trusted businesses onto the Vibfy platform."><button className="secondary-button"><UploadCloud size={18} />Export records</button></PageHeading>
    <div className="filter-row"><div className="filter-tabs">{['All', 'New', 'Review'].map(item => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div className="table-search"><Search size={16} /><input placeholder="Search applications" /></div></div>
    <section className="panel table-panel"><div className="data-table"><div className="table-row table-head"><span>Business</span><span>Category</span><span>Location</span><span>Submitted</span><span>Status</span><span></span></div>{visible.map((host, index) => <div className="table-row" key={host.name}><div className="business-cell"><div className={`business-avatar color-${index}`}>{host.initials}</div><div><strong>{host.name}</strong><small>{host.owner}</small></div></div><span>{host.type}</span><span>{host.location}</span><span>{host.submitted}</span><span>{approved.includes(host.name) ? <Badge tone="green"><Check size={12} />Approved</Badge> : <Badge tone={host.status === 'New' ? 'green' : 'amber'}>{host.status}</Badge>}</span><div className="row-actions"><button><Eye size={17} /></button><button onClick={() => setApproved([...approved, host.name])}><Check size={17} /></button><button><MoreHorizontal size={17} /></button></div></div>)}</div></section></>
}
