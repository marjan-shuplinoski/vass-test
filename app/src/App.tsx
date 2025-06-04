import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

interface Notification {
  id: number;
  type: 'temporary' | 'permanent';
  title?: string;
  content: string;
  duration?: number;
}

const MAX_NOTIFICATIONS = 5;

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'temporary' | 'permanent'>('temporary');
  const [duration, setDuration] = useState(5);

  const addNotification = () => {
    if (!content.trim() || notifications.length >= MAX_NOTIFICATIONS) return;
    const id = Date.now();
    const newNotification: Notification = {
      id,
      type,
      title: title.trim() ? title : undefined,
      content,
      duration: type === 'temporary' ? duration : undefined,
    };
    setNotifications((prev) => [...prev, newNotification]);
    setTitle('');
    setContent('');
    if (type === 'temporary') {
      setTimeout(() => removeNotification(id), duration * 1000);
    }
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (type === 'permanent') {
      localStorage.setItem('closed_' + id, '1');
    }
  };

  React.useEffect(() => {
    // On mount, filter out closed permanent notifications
    setNotifications((prev) => prev.filter((n) => !(n.type === 'permanent' && localStorage.getItem('closed_' + n.id))));

    // Add 2 random notifications on first run
    if (notifications.length === 0) {
      const randomId1 = Date.now();
      const randomId2 = Date.now() + 1;
      const randomPermanent: Notification = {
        id: randomId1,
        type: 'permanent',
        title: 'Permanent',
        content: 'This is a permanent notification.',
      };
      const randomTemporary: Notification = {
        id: randomId2,
        type: 'temporary',
        title: 'Temporary',
        content: 'This is a temporary notification.',
        duration: 5,
      };
      setNotifications([randomPermanent, randomTemporary]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== randomId2));
      }, 5000);
    }
  }, []);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Notification Demo</h1>
      <form className="row g-2 mb-4" onSubmit={e => { e.preventDefault(); addNotification(); }}>
        <div className="col-md-3">
          <input className="form-control" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        {type === 'permanent' && (
          <div className="col-md-4">
            <input className="form-control" placeholder="Content" value={content} onChange={e => setContent(e.target.value)} required />
          </div>
        )}
        <div className="col-md-2">
          <select className="form-select" value={type} onChange={e => setType(e.target.value as any)}>
            <option value="temporary">Temporary</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>
        {type === 'temporary' && (
          <div className="col-md-2">
            <input type="number" className="form-control" min={1} max={30} value={duration} onChange={e => setDuration(Number(e.target.value))} />
          </div>
        )}
        <div className="col-md-1 d-grid">
          <button className="btn btn-primary" type="submit" disabled={notifications.length >= MAX_NOTIFICATIONS || (type === 'permanent' && !content.trim())}>Add</button>
        </div>
      </form>
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, minWidth: 320 }}>
        {notifications.map((n) => (
          <div key={n.id} className={`alert alert-${n.type === 'permanent' ? 'warning' : 'info'} fade show mb-2 animate__animated animate__fadeInUp`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 300, maxWidth: 400, position: 'relative' }}>
            {n.title && (
              <strong style={{ fontWeight: n.type === 'permanent' ? 'bold' : 'normal' }}>{n.title}</strong>
            )}
            {n.type === 'permanent' && <><br />{n.content}</>}
            {/* Close button for permanent notification at bottom right */}
            {(n.type === 'permanent') && (
              <button type="button" className="btn-close" aria-label="Close" style={{ position: 'absolute', bottom: 10, right: 10 }} onClick={() => removeNotification(n.id)}></button>
            )}
            {n.type === 'temporary' && (
              <div className="progress mt-2" style={{ height: 4 }}>
                <div className="progress-bar bg-info" role="progressbar" style={{ width: '100%', animation: `progressBar${n.id} ${n.duration}s linear` }}></div>
                <style>{`
                  @keyframes progressBar${n.id} {
                    from { width: 100%; }
                    to { width: 0%; }
                  }
                `}</style>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
