import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// components 폴더에서 가져오기
import { useNotification } from '../components/NotificationContext';
import './SettingPage.css';

function SettingPage() {
    const navigate = useNavigate();
    
    // 전역 알림 설정 가져오기
    const { settings, toggleSetting } = useNotification();

    // 위치 설정은 로컬 state 사용
    const [locationShare, setLocationShare] = useState(true);
    const [locationVisibility, setLocationVisibility] = useState('all');
    const [saving, setSaving] = useState(false);

    // 설정 불러오기
    useEffect(() => {
        const fetchSettings = async () => {
            const nickname = localStorage.getItem('nickname');
            if (!nickname) return;

            try {
                const res = await fetch('/api/settings/me', {
                    headers: {
                        'Authorization': `Bearer ${encodeURIComponent(nickname)}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setLocationShare(data.locationShare ?? true);
                    setLocationVisibility(data.locationVisibility ?? 'all');
                    // 알림 설정도 불러오기 (필요시)
                }
            } catch (err) {
                console.error('설정 불러오기 실패:', err);
            }
        };

        fetchSettings();
    }, []);

    // 설정 저장
    const saveSettings = async (updates) => {
        const nickname = localStorage.getItem('nickname');
        if (!nickname || saving) return;

        setSaving(true);
        try {
            const res = await fetch('/api/settings/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${encodeURIComponent(nickname)}`,
                },
                body: JSON.stringify({
                    locationShare,
                    locationVisibility,
                    chatAlarm: settings.chatAlarm,
                    campRequestAlarm: settings.campRequestAlarm,
                    ...updates,
                }),
            });

            if (!res.ok) {
                throw new Error('설정 저장 실패');
            }
        } catch (err) {
            console.error('설정 저장 오류:', err);
            alert('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('nickname');
        localStorage.removeItem('userId');
        
        alert('로그아웃 되었습니다.');
        navigate('/login');
        window.location.reload();
    };

    return (
        <div className="setting-page">
        <header className="setting-header">
            <button className="back-button" onClick={() => navigate(-1)}>
            ←
            </button>
            <h1>설정</h1>
        </header>

        <div className="setting-content">
            <div className="setting-section profile-section">
            <div className="profile-item">
                <div className="profile-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="3" stroke="#5B8DEE" strokeWidth="2" fill="none"/>
                    <path d="M6 18C6 15.79 8.69 14 12 14C15.31 14 18 15.79 18 18" stroke="#5B8DEE" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
                </div>
                <div className="profile-text">
                <div className="profile-title">내 프로필</div>
                <div className="profile-subtitle">프로필 보기 및 수정</div>
                </div>
                <button className="arrow-button" onClick={() => navigate('/profile')}>›</button>
            </div>
            </div>

            <div className="setting-section location-section">
            <div className="section-header">
                <svg className="section-icon location-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" stroke="#5B8DEE" strokeWidth="2"/>
                <circle cx="12" cy="9" r="2.5" fill="#5B8DEE"/>
                </svg>
                <h2>위치 설정</h2>
            </div>
            <p className="section-description">
                다른 캠퍼들에게 내 위치를 공유할 범위를 설정합니다
            </p>

            <div className="setting-item">
                <div className="setting-text">
                <div className="setting-label">위치 공유</div>
                <div className="setting-sublabel">위치를 실시간으로 공유합니다</div>
                </div>
                <label className="toggle-switch">
                <input
                    type="checkbox"
                    checked={locationShare}
                    onChange={(e) => {
                        const newValue = e.target.checked;
                        setLocationShare(newValue);
                        saveSettings({ locationShare: newValue });
                    }}
                    disabled={saving}
                />
                <span className="toggle-slider"></span>
                </label>
            </div>

            <div className="visibility-options">
                <div className={`visibility-option ${locationVisibility === 'all' ? 'selected' : ''}`} onClick={() => {
                    if (!saving) {
                        setLocationVisibility('all');
                        saveSettings({ locationVisibility: 'all' });
                    }
                }}>
                <div className="radio-button">{locationVisibility === 'all' && <div className="radio-dot"></div>}</div>
                <div className="visibility-text"><div className="visibility-label">전체 공개</div><div className="visibility-description">모든 캠퍼에게 위치가 표시됩니다</div></div>
                </div>
                <div className={`visibility-option ${locationVisibility === 'friends' ? 'selected' : ''}`} onClick={() => {
                    if (!saving) {
                        setLocationVisibility('friends');
                        saveSettings({ locationVisibility: 'friends' });
                    }
                }}>
                <div className="radio-button">{locationVisibility === 'friends' && <div className="radio-dot"></div>}</div>
                <div className="visibility-text"><div className="visibility-label">친구 공개</div><div className="visibility-description">친구에게만 위치가 표시됩니다</div></div>
                </div>
                <div className={`visibility-option ${locationVisibility === 'none' ? 'selected' : ''}`} onClick={() => {
                    if (!saving) {
                        setLocationVisibility('none');
                        saveSettings({ locationVisibility: 'none' });
                    }
                }}>
                <div className="radio-button">{locationVisibility === 'none' && <div className="radio-dot"></div>}</div>
                <div className="visibility-text"><div className="visibility-label">비공개</div><div className="visibility-description">누구에게도 위치가 표시되지 않습니다</div></div>
                </div>
            </div>
            </div>

            <div className="setting-section alarm-section">
            <div className="section-header">
                <svg className="section-icon location-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 4.1 10 4.2 10 4.3C7.6 5.2 6 7.4 6 10V16L4 18V19H20V18L18 16V10C18 7.4 16.4 5.2 14 4.3C14 4.2 14 4.1 14 4C14 2.9 13.1 2 12 2Z" fill="white" stroke="#5B8DEE" strokeWidth="2"/>
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="#5B8DEE"/>
                </svg>
                <h2>알림 설정</h2>
            </div>

            <div className="setting-item">
                <div className="setting-text">
                <div className="setting-label">채팅 알림</div>
                <div className="setting-sublabel">새 메시지 알림을 받습니다</div>
                </div>
                <label className="toggle-switch">
                <input
                    type="checkbox"
                    checked={settings.chatAlarm} 
                    onChange={() => {
                        toggleSetting('chatAlarm');
                        saveSettings({ chatAlarm: !settings.chatAlarm });
                    }}
                    disabled={saving}
                />
                <span className="toggle-slider"></span>
                </label>
            </div>

            <div className="setting-item">
                <div className="setting-text">
                <div className="setting-label">캠프 요청 알림</div>
                <div className="setting-sublabel">친구 요청 알림을 받습니다</div>
                </div>
                <label className="toggle-switch">
                <input
                    type="checkbox"
                    checked={settings.campRequestAlarm}
                    onChange={() => {
                        toggleSetting('campRequestAlarm');
                        saveSettings({ campRequestAlarm: !settings.campRequestAlarm });
                    }}
                    disabled={saving}
                />
                <span className="toggle-slider"></span>
                </label>
            </div>
            </div>

            <div className="setting-section logout-section">
            <button className="logout-button" onClick={handleLogout}>
                로그아웃
            </button>
            </div>
        </div>
        </div>
    );
}

export default SettingPage;