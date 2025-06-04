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
  // Progress state for temporary notifications
  const [progressMap, setProgressMap] = useState<{ [id: number]: number }>({});

  const addNotification = () => {
    if ((type === 'permanent' && !content.trim()) || notifications.length >= MAX_NOTIFICATIONS) return;
    const id = Date.now();
    const newNotification: Notification = {
      id,
      type,
      title: title.trim() ? title : undefined,
      content: type === 'permanent' ? content : '',
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

  // Animate progress for temporary notifications
  React.useEffect(() => {
    const activeTemps = notifications.filter(n => n.type === 'temporary');
    if (activeTemps.length === 0) return;
    const interval = setInterval(() => {
      setProgressMap(prev => {
        const updated: { [id: number]: number } = { ...prev };
        activeTemps.forEach(n => {
          const start = n.id;
          const duration = n.duration || 5;
          if (!updated[start]) updated[start] = 1;
          updated[start] -= 1 / (duration * 20);
          if (updated[start] < 0) updated[start] = 0;
        });
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [notifications]);

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
        title: 'Notifications may extend two across lines. We prefer to keep them concise.',
        content: 'This is a temporary notification.',
        duration: 5,
      };
      setNotifications([randomPermanent, randomTemporary]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.type !== 'temporary' || n.id !== randomId2));
      }, randomTemporary.duration! * 1000);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Notification Demo</h1>
      <form className="row g-2 mb-4" onSubmit={e => { e.preventDefault(); addNotification(); }}>
        <div className="col-md-3">
          <input className="form-control" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        {(type === 'permanent') && (
          <div className="col-md-4">
            <input className="form-control" placeholder="Content" value={content} onChange={e => setContent(e.target.value)} required />
          </div>
        )}
        {(type === 'temporary') && (
          <div className="col-md-4">
            <input className="form-control" placeholder="(No content for temporary)" value={''} disabled />
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
          <div
            key={n.id}
            className={`alert alert-${n.type === 'permanent' ? 'warning' : 'info'} fade show mb-2 animate__animated animate__fadeInUp`}
            style={{
              width: 480,
              height: n.type === 'permanent' ? 100 : 68,
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: n.type !== 'permanent' ? 'transparent' : '#FFFFFF',
              padding: 16,
              gap: n.type === 'permanent' ? 16 : 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              maxWidth: 480,
              minWidth: 320,
              position: 'relative',
              overflow: n.type !== 'permanent' ? 'hidden' : undefined,
            }}
          >
            {/* Progress bar background for temporary notification (fills entire notification) */}
            {n.type !== 'permanent' && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                background: '#F1F5F9', // gray
                borderRadius: 8,
                zIndex: 0,
                pointerEvents: 'none',
                transform: `scaleX(${1 - (progressMap[n.id] ?? 1)})`,
                transformOrigin: 'left',
                transition: 'transform 50ms linear',
              }} />
            )}
            {n.title && n.type === 'permanent' && (
              <div style={{
                width: 448,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'Geist Mono, monospace',
                fontWeight: 700,
                fontSize: 16,
                lineHeight: 1,
                letterSpacing: 0,
                color: '#000',
                marginBottom: 0,
                verticalAlign: 'middle',
              }}>
                {n.title}
              </div>
            )}
            {n.type === 'permanent' && (
              <div style={{
                width: 396,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'Geist Mono, monospace',
                fontWeight: 400,
                fontSize: 'small',
                lineHeight: 1,
                letterSpacing: 0,
                color: '#000',
                verticalAlign: 'middle',
              }}>
                <span style={{ width: 396, height: 36, display: 'flex', alignItems: 'center' }}>{n.content}</span>
              </div>
            )}
            {n.type !== 'permanent' && n.title && (
              <div style={{
                width: 448,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 400,
                fontFamily: 'Geist Mono, monospace',
                fontSize: 'small',
                lineHeight: 1,
                letterSpacing: 0,
                color: '#000',
                gap: 16,
                position: 'relative',
                zIndex: 1,
                background: 'transparent',
                border: 'none',
                boxSizing: 'border-box',
                padding: 0,
                verticalAlign: 'middle',
              }}>
                <span style={{ width: '100%', textAlign: 'center' }}>{n.title}</span>
              </div>
            )}
            {/* Remove content for temporary notification */}
            {n.type === 'temporary' && n.content && false}
            {/* Remove progress bar for temporary notification */}
            {n.type === 'permanent' && (
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                  marginLeft: 8,
                  position: 'absolute',
                  right: 16,
                  top: 42,
                  zIndex: 2,
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
                onClick={() => removeNotification(n.id)}
              ></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
