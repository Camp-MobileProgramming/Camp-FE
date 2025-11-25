import React, { useState, useRef, useEffect } from 'react';
import ChatButton from '../components/ChatButton';

export default function ChatingPage({ roomId, messages = [], onSend }) {
    const [text, setText] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [roomId]);

    const send = () => {
        const t = text.trim();
        if (!t) return;
        const payload = { roomId, text: t, ts: Date.now() };
        if (typeof onSend === 'function') onSend(payload);
        else console.log('ChatingPage send:', payload);
        setText('');
    };

    return (
        <div className="chating-page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {messages.length === 0 ? (
                    <div style={{ color: '#888' }}>메세지 입력</div>
                ) : (
                    messages.map(m => (
                        <div key={m.id || m.ts} style={{ marginBottom: 8, textAlign: m.self ? 'right' : 'left' }}>
                            <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 16, background: m.self ? '#1976d2' : '#eee', color: m.self ? '#fff' : '#000', maxWidth: '80%', wordBreak: 'break-word' }}>
                                {m.text}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #eee' }}>
                <input
                    ref={inputRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') send(); }}
                    placeholder="메시지를 입력"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
                />
                <ChatButton onClick={send} disabled={!text.trim()} />
            </div>
        </div>
    );
}