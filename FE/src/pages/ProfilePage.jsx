import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav.jsx';
import './ProfilePage.css';

export default function ProfilePage() {
  const { nickname: paramNickname } = useParams(); // /profile/:nickname
  const navigate = useNavigate();

  // 내 정보 (로그인 시 localStorage에 저장해 둔 값 사용)
  const myNickname = localStorage.getItem('nickname') || '나';
  const myEmail = localStorage.getItem('email') || '';

  // 내 프로필인지, 상대 프로필인지 구분
  const isMe = !paramNickname || paramNickname === myNickname;

  // 화면 표시용 닉네임
  const displayNickname = isMe ? myNickname : paramNickname;

  // ---- 상태값들 ----
  const [statusMessage, setStatusMessage] = useState(
    isMe ? '도서관에서 공부 중!' : '도서관 근처에 있어요'
  );
  const [intro, setIntro] = useState(
    isMe ? '컴퓨터공학과 3학년입니다.' : '컴퓨터공학과 2학년입니다.'
  );
  const [interests] = useState(['스터디', '독서', '운동', '영화']);
  const [stats] = useState({ friends: 24, groups: 8, steps: 156 });

  // 상대 프로필일 때만 보이는 더미 메모
  const [memo] = useState('스터디에서 만난 친구. 성실하고 적극적임.');

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBack = () => navigate(-1);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('nickname');
    localStorage.removeItem('userId');

    alert('로그아웃 되었습니다.');
    navigate('/login');
    window.location.reload();
  };

  const handleSave = async () => {
    if (!isMe) return;
    setSaving(true);
    try {
      // TODO: 백엔드 API 연결
      alert('프로필이 저장되었습니다. (지금은 프론트만 동작)');
      setEditing(false);
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleChat = () => {
    alert('채팅 기능은 추후 추가 예정입니다.');
  };

  const handleUnfriend = () => {
    const ok = window.confirm('정말 친구를 삭제하시겠습니까?');
    if (ok) alert('친구 삭제 API는 추후 추가될 예정입니다.');
  };

  return (
    <div className="profile-page-layout">
      {/* 상단 헤더 */}
      <header className="profile-header">
        <button className="back-button" onClick={handleBack}>
          ←
        </button>

        <h1 className="profile-header-title">
          {isMe ? '내 프로필' : `${displayNickname}님의 프로필`}
        </h1>

        {/* 내 프로필일 때만 로그아웃 버튼 표시 */}
        {isMe ? (
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            로그아웃
          </button>
        ) : (
          <div style={{ width: '60px' }} />
        )}
      </header>

      <main className="profile-main">
        {/* 상단 닉네임 카드 */}
        <section className="profile-top-card">
          <div className="profile-avatar">
            <span>{displayNickname?.[0] || '나'}</span>
          </div>

          <h2 className="profile-nickname">{displayNickname}</h2>

          {/* 상태 메시지 */}
          <p className="profile-status">
            {isMe && editing ? (
              <input
                className="profile-status-input"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
              />
            ) : (
              statusMessage
            )}
          </p>

          {/* 내 프로필 → 편집 버튼 */}
          {isMe && (
            <button
              className="profile-edit-btn"
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
            >
              {editing ? (saving ? '저장 중...' : '저장하기') : '프로필 편집'}
            </button>
          )}

          {/* 상대 프로필 → 채팅 / 친구삭제 버튼 */}
          {!isMe && (
            <div className="profile-other-actions">
              <button className="profile-chat-btn" onClick={handleChat}>
                채팅
              </button>
              <button className="profile-unfriend-btn" onClick={handleUnfriend}>
                친구 삭제
              </button>
            </div>
          )}
        </section>

        {/* 소개 */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <h3>소개</h3>
          </div>

          {isMe && editing ? (
            <textarea
              className="profile-textarea"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
          ) : (
            <p className="profile-section-text">
              {intro || (isMe ? '자기소개를 작성해보세요.' : '소개글이 없습니다.')}
            </p>
          )}
        </section>

        {/* 관심사 */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <h3>관심사</h3>
          </div>

          <div className="profile-tags">
            {interests.map((tag, i) => (
              <span key={i} className="profile-tag">
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* 상대만 보는 메모 */}
        {!isMe && (
          <section className="profile-section-card">
            <div className="profile-section-header">
              <h3>개인 메모</h3>
              <span className="profile-memo-hint">나만 볼 수 있습니다</span>
            </div>
            <div className="profile-memo-box">{memo}</div>
            <p className="profile-memo-sub">메모는 자동 저장됩니다</p>
          </section>
        )}

        {/* 통계 */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <h3>통계</h3>
          </div>

          <div className="profile-stats-row">
            <div className="profile-stat">
              <div className="profile-stat-number">{stats.friends}</div>
              <div className="profile-stat-label">친구</div>
            </div>

            <div className="profile-stat">
              <div className="profile-stat-number">{stats.groups}</div>
              <div className="profile-stat-label">그룹</div>
            </div>

            <div className="profile-stat">
              <div className="profile-stat-number">{stats.steps}</div>
              <div className="profile-stat-label">발걸음</div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
