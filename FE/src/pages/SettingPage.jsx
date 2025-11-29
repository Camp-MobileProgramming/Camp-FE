import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingPage.css';

function SettingPage() {
    const navigate = useNavigate();
    const [locationShare, setLocationShare] = useState(false);
    const [locationVisibility, setLocationVisibility] = useState('friends'); // 'all', 'friends', 'none'
    const [chatAlarm, setChatAlarm] = useState(false);
    const [campRequestAlarm, setCampRequestAlarm] = useState(false);

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
            {/* 내 프로필 섹션 */}
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
                <button className="arrow-button" onClick={() => 
                    navigate('/profile')}>›</button>
            </div>
            </div>

            {/* 위치 설정 섹션 */}
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
                    onChange={(e) => setLocationShare(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                </label>
            </div>

            <div className="visibility-options">
                <div
                className={`visibility-option ${locationVisibility === 'all' ? 'selected' : ''}`}
                onClick={() => setLocationVisibility('all')}
                >
                <div className="radio-button">
                    {locationVisibility === 'all' && <div className="radio-dot"></div>}
                </div>
                <div className="visibility-text">
                    <div className="visibility-label">전체 공개</div>
                    <div className="visibility-description">모든 캠퍼에게 위치가 표시됩니다</div>
                </div>
                </div>

                <div
                className={`visibility-option ${locationVisibility === 'friends' ? 'selected' : ''}`}
                onClick={() => setLocationVisibility('friends')}
                >
                <div className="radio-button">
                    {locationVisibility === 'friends' && <div className="radio-dot"></div>}
                </div>
                <div className="visibility-text">
                    <div className="visibility-label">친구 공개</div>
                    <div className="visibility-description">친구에게만 위치가 표시됩니다</div>
                </div>
                </div>

                <div
                className={`visibility-option ${locationVisibility === 'none' ? 'selected' : ''}`}
                onClick={() => setLocationVisibility('none')}
                >
                <div className="radio-button">
                    {locationVisibility === 'none' && <div className="radio-dot"></div>}
                </div>
                <div className="visibility-text">
                    <div className="visibility-label">비공개</div>
                    <div className="visibility-description">누구에게도 위치가 표시되지 않습니다</div>
                </div>
                </div>
            </div>
            </div>

            {/* 알림 설정 섹션 */}
            <div className="setting-section alarm-section">
            <div className="section-header">
                {/* 알림 설정 이모티콘 */}
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
                    checked={chatAlarm}
                    onChange={(e) => setChatAlarm(e.target.checked)}
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
                    checked={campRequestAlarm}
                    onChange={(e) => setCampRequestAlarm(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                </label>
            </div>
            </div>

            {/* 버전 정보 섹션 */}
            <div className="setting-section version-section">
            <div className="info-item">
                <div className="info-label">버전</div>
                <div className="info-value">1.0.0</div>
            </div>

            <div className="info-item">
                <div className="info-label">오늘 캠프 요청</div>
                <div className="info-value highlight">0 / 10</div>
            </div>
            </div>

            {/* 로그아웃 버튼 */}
            <div className="setting-section logout-section">
            <button className="logout-button" onClick={handleLogout}>
                {/* 로그아웃 이모티콘 */}
                <svg className="logout-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H11C12.1 21 13 20.1 13 19V17H11V19H5V5H11V7H13V5C13 3.9 12.1 3 11 3H5Z" fill="#ff4444"/>
                <path d="M17.59 13H8V11H17.59L15.29 8.71L16.71 7.29L21.41 12L16.71 16.71L15.29 15.29L17.59 13Z" fill="#ff4444"/>
                </svg>
                로그아웃
            </button>
            </div>
        </div>
    </div>
    );
}

export default SettingPage;
