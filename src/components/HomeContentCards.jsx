import { apiUrl } from '../api';
import './home-content.css';
export const contentImageUrl = url => url?.startsWith('/storage/') ? `${apiUrl.replace(/\/api\/v1$/, '')}${url}` : url;
export default function HomeContentCards({ items = [] }) {
  return <div className="home-content-cards">{items.map(item => <article className={`home-content-card placement-${item.placement}`} key={item.id}>
    {item.image_url && <img src={contentImageUrl(item.image_url)} alt={item.title} />}
    <div><h2>{item.title}</h2>{item.description && <p>{item.description}</p>}{/^https?:\/\//i.test(item.link_url || '') && <a className="vf-button" href={item.link_url}>Learn more</a>}</div>
  </article>)}</div>;
}
