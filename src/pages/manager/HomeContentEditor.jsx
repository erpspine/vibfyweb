import { useEffect, useRef, useState } from 'react';
import { api } from '../../api';
import HomeContentCards from '../../components/HomeContentCards';

const empty = { title: '', description: '', placement: 'banner', link_url: '', is_active: false, sort_order: 0 };
export default function HomeContentEditor() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(empty);
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const file = useRef(null);
  const form = useRef(null);
  const load = () => {
    setLoading(true); setError('');
    api('/manager/home-content', { showErrorAlert: false }).then(data => setItems(data.contents)).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => {
    if (!image) { setPreview(''); return; }
    const url = URL.createObjectURL(image); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  function edit(item = empty) {
    setDraft({ ...item, description: item.description || '', link_url: item.link_url || '' });
    setImage(null); setRemoveImage(false); setError(''); setNotice('');
    if (file.current) file.current.value = '';
    form.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const body = new FormData();
    ['title', 'description', 'placement', 'link_url', 'sort_order'].forEach(key => body.append(key, draft[key]));
    body.append('is_active', draft.is_active ? '1' : '0');
    body.append('remove_image', removeImage ? '1' : '0');
    if (image) body.append('image', image);
    try {
      const result = await api(`/manager/home-content${draft.id ? '/' + draft.id : ''}`, { method: 'POST', body, showErrorAlert: false });
      setItems(current => [...current.filter(item => item.id !== result.content.id), result.content].sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)));
      edit(); setNotice('Content saved. Published items are available in the home feed.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await api(`/manager/home-content/${item.id}`, { method: 'DELETE', showErrorAlert: false });
      setItems(current => current.filter(entry => entry.id !== item.id));
      if (draft.id === item.id) edit();
      setNotice('Content deleted.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const change = event => setDraft(current => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  return <section className="panel home-content-editor" aria-busy={busy}>
    <h2>Home page & mobile banners</h2><p>Create content, choose its placement and display order, then publish it when ready. Lower order numbers appear first.</p>
    {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {loading ? <p role="status">Loading content…</p> : <>
      <h3>{draft.id ? 'Edit content' : 'New content'}</h3>
      <form ref={form} onSubmit={save}>
        <label>Title<input name="title" value={draft.title} onChange={change} maxLength={255} required disabled={busy} /></label>
        <label>Placement<select name="placement" value={draft.placement} onChange={change} disabled={busy}><option value="banner">Banner</option><option value="home">Home page content</option></select></label>
        <label>Description<textarea name="description" value={draft.description} onChange={change} maxLength={3000} rows={4} disabled={busy} /></label>
        <label>Destination URL (optional)<input name="link_url" type="url" placeholder="https://…" value={draft.link_url} onChange={change} maxLength={2048} disabled={busy} /></label>
        <label>Image (JPG, PNG or WebP, up to 5 MB)<input ref={file} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => setImage(e.target.files[0] || null)} /></label>
        <label>Display order<input name="sort_order" type="number" min="0" max="100000" step="1" required value={draft.sort_order} onChange={change} disabled={busy} /></label>
        <label className="content-checkbox"><input type="checkbox" name="is_active" checked={draft.is_active} onChange={change} disabled={busy} />Published</label>
        {draft.image_url && <label className="content-checkbox"><input type="checkbox" checked={removeImage} onChange={e => setRemoveImage(e.target.checked)} disabled={busy} />Remove current image</label>}
        <div className="content-editor-actions"><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : 'Save content'}</button>{draft.id && <button type="button" className="secondary-button" onClick={() => edit()} disabled={busy}>Cancel editing</button>}</div>
      </form>
      {draft.title && <><h3>Preview</h3><HomeContentCards items={[{ ...draft, id: 'preview', image_url: preview || (removeImage ? null : draft.image_url) }]} /></>}
      <div className="content-editor-list">{items.map(item => <article className="content-editor-row" key={item.id}><div><strong>{item.title}</strong><small>{item.placement === 'banner' ? 'Banner' : 'Home page'} · {item.is_active ? 'Published' : 'Draft'} · Order {item.sort_order}</small></div><div className="content-editor-actions"><button className="secondary-button" disabled={busy} onClick={() => edit(item)}>Edit</button><button className="secondary-button" disabled={busy} onClick={() => remove(item)}>Delete</button></div></article>)}{!items.length && <p>No home content yet. Create your first item above.</p>}</div>
      {error && <button className="secondary-button" disabled={busy} onClick={load}>Reload content</button>}
    </>}
  </section>;
}
