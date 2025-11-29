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

  // ---- 기본값 (백엔드에서 아무것도 없을 때 쓸 프론트 기본값) ----
  const DEFAULT_STATUS_ME = '도서관에서 공부 중!';
  const DEFAULT_STATUS_OTHER = '도서관 근처에 있어요';

  const DEFAULT_INTRO_ME = '컴퓨터공학과 3학년입니다.';
  const DEFAULT_INTRO_OTHER = '컴퓨터공학과 2학년입니다.';

  const DEFAULT_INTERESTS = ['스터디', '독서', '운동', '영화'];
  const DEFAULT_FRIENDS = 24; // 친구 수 기본값

  // ---- 상태값들 (백엔드 연동 전 그냥 기본값) ----
  const [statusMessage, setStatusMessage] = useState('');
  const [intro, setIntro] = useState('');
  const [interests, setInterests] = useState([]);
  const [friends, setFriends] = useState(DEFAULT_FRIENDS); // friends만 사용

  // 상대 프로필일 때만 보이는 메모
  const [memo, setMemo] = useState('');
  const [memoSaving, setMemoSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 프로필 & 메모 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      const targetNickname = isMe ? myNickname : paramNickname;
      if (!targetNickname) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(targetNickname)}`);
        if (!res.ok) {
          // 처음 접속해서 아직 DB에 없을 수도 있으니까 404면 기본값 사용
          if (res.status === 404) {
            setStatusMessage(isMe ? DEFAULT_STATUS_ME : DEFAULT_STATUS_OTHER);
            setIntro(isMe ? DEFAULT_INTRO_ME : DEFAULT_INTRO_OTHER);
            setInterests(DEFAULT_INTERESTS);
            setFriends(DEFAULT_FRIENDS);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        // 백엔드 응답 예시:
        // { nickname, statusMessage, intro, interests: [], friends }

        setStatusMessage(
          data.statusMessage ??
            (isMe ? DEFAULT_STATUS_ME : DEFAULT_STATUS_OTHER)
        );
        setIntro(
          data.intro ??
            (isMe ? DEFAULT_INTRO_ME : DEFAULT_INTRO_OTHER)
        );
        setInterests(
          Array.isArray(data.interests) && data.interests.length > 0
            ? data.interests
            : DEFAULT_INTERESTS
        );
        setFriends(
          typeof data.friends === 'number' ? data.friends : DEFAULT_FRIENDS
        );
      } catch (err) {
        console.error('프로필 로드 실패', err);
        // 에러 나면 일단 기본값
        setStatusMessage(isMe ? DEFAULT_STATUS_ME : DEFAULT_STATUS_OTHER);
        setIntro(isMe ? DEFAULT_INTRO_ME : DEFAULT_INTRO_OTHER);
        setInterests(DEFAULT_INTERESTS);
        setFriends(DEFAULT_FRIENDS);
      } finally {
        setLoading(false);
      }
    };

    const fetchMemo = async () => {
      // 메모는 "상대 프로필에서 내가 쓴 것"만 존재
      if (isMe || !paramNickname) return;

      try {
        const myNick = localStorage.getItem('nickname');
        if (!myNick) return;

        const encodedNick = encodeURIComponent(myNick);
        const res = await fetch(
          `/api/profile/${encodeURIComponent(paramNickname)}/memo`,
          {
            headers: {
              'Authorization': `Bearer ${encodedNick}`,
            },
          }
        );

        if (res.status === 404) {
          // 메모 없는 상태
          setMemo('');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setMemo(data.content || '');
      } catch (e) {
        console.error('메모 로드 실패', e);
        setMemo('');
      }
    };

    fetchProfile();
    fetchMemo();
  }, [isMe, myNickname, paramNickname]);

  // 뒤로가기 / 로그아웃
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

  // 내 프로필 저장 (편집 모드에서 저장하기 클릭)
  const handleSave = async () => {
    if (!isMe) return;
    setSaving(true);
    try {
      const encodedNick = encodeURIComponent(myNickname);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encodedNick}`,
        },
        body: JSON.stringify({
          statusMessage,
          intro,
          interests, // ['스터디', '운동'] 이런 배열
          friends,   // 숫자 하나
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      alert('프로필이 저장되었습니다.');
      setEditing(false);
    } catch (err) {
      console.error('프로필 저장 실패', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 채팅 / 친구 신청 
  const handleChat = async () => {
    if (!paramNickname) return;

    try {
      const myNick = localStorage.getItem('nickname');
      if (!myNick) {
        navigate('/login');
        return;
      }

      // Try to find an existing room to avoid creating duplicates
      const res = await fetch(`/api/chats/rooms?me=${encodeURIComponent(myNick)}`);
      if (res.ok) {
        const rooms = await res.json();
        const found = Array.isArray(rooms)
          ? rooms.find((r) => r.otherNickname === paramNickname)
          : null;

        if (found && found.roomKey) {
          navigate(`/chat/${encodeURIComponent(paramNickname)}?roomKey=${encodeURIComponent(found.roomKey)}`);
          return;
        }
      }
    } catch (e) {
      // ignore — fallback to normal navigation
      console.error('채팅방 조회 중 에러', e);
    }

    navigate(`/chat/${encodeURIComponent(paramNickname)}`);
  };

  const handleSendFriendRequest = async () => {
    if (!paramNickname) return;
    const ok = window.confirm(`${displayNickname}님에게 친구 신청을 보내시겠습니까?`);
    if (!ok) return;

    try {
      const myNick = localStorage.getItem('nickname');
      const encodedNick = encodeURIComponent(myNick);
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encodedNick}`,
        },
        body: JSON.stringify({ receiverNickname: paramNickname }),
      });

      if (!response.ok) {
        let msg = '친구 신청을 보내는 중 오류가 발생했습니다.';
  
        try {
          const contentType = response.headers.get('Content-Type') || '';
  
          if (contentType.includes('application/json')) {
            // 전역 예외 핸들러로 { "message": "이미 친구입니다" } 내려주는 경우
            const errBody = await response.json();
            if (errBody && errBody.message) {
              msg = errBody.message;
            }
          } else {
            // 기본 에러 HTML인 경우 → 텍스트에서 키워드만 뽑기
            const text = await response.text();
            if (text.includes('이미 친구입니다')) {
              msg = '이미 친구입니다.';
            } else if (text.includes('이미 요청을 보냈')) {
              msg = '이미 친구 요청을 보낸 상태입니다.';
            }
          }
        } catch (e) {
          console.error('parse error response failed', e);
        }
  
        alert(msg);
        return;
      }

      alert('친구 신청을 보냈습니다.');
    } catch (err) {
      console.error('sendFriendRequest error', err);
      alert('친구 신청을 보내는 중 오류가 발생했습니다.');
    }
  };

  //메모 입력 & 저장
  const handleMemoChange = (e) => {
    setMemo(e.target.value);
  };

  const handleSaveMemo = async () => {
    if (isMe || !paramNickname) return;
    setMemoSaving(true);
    try {
      const myNick = localStorage.getItem('nickname');
      if (!myNick) {
        alert('로그인 정보가 없습니다.');
        return;
      }
      const encodedNick = encodeURIComponent(myNick);

      const res = await fetch(
        `/api/profile/${encodeURIComponent(paramNickname)}/memo`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${encodedNick}`,
          },
          body: JSON.stringify({ content: memo }),
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      alert('메모가 저장되었습니다.');
    } catch (e) {
      console.error('메모 저장 실패', e);
      alert('메모 저장 중 오류가 발생했습니다.');
    } finally {
      setMemoSaving(false);
    }
  };

  // 로딩 중일 때 간단한 표시
  if (loading) {
    return (
      <div className="profile-page-layout">
        <header className="profile-header">
          <button className="back-button" onClick={handleBack}>
            ←
          </button>
          <h1 className="profile-header-title">
            {isMe ? '내 프로필' : `${displayNickname}님의 프로필`}
          </h1>
          <div style={{ width: '60px' }} />
        </header>
        <main className="profile-main">
          <p>프로필 불러오는 중...</p>
        </main>
      </div>
    );
  }

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
              fontWeight: '600',
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

          {/* 상대 프로필 → 채팅 / 친구신청 버튼 */}
          {!isMe && (
            <div className="profile-other-actions">
              <button className="profile-chat-btn" onClick={handleChat}>
                채팅
              </button>
              <button className="profile-unfriend-btn" onClick={handleSendFriendRequest}>
                친구 신청
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

          {isMe && editing ? (
            // 간단하게 "쉼표로 구분해서 입력" 방식
            <input
              className="profile-status-input"
              placeholder="예: 스터디, 독서, 운동"
              value={interests.join(', ')}
              onChange={(e) =>
                setInterests(
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
            />
          ) : (
            <div className="profile-tags">
              {interests.map((tag, i) => (
                <span key={i} className="profile-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* 상대만 보는 메모 */}
        {!isMe && (
          <section className="profile-section-card">
            <div className="profile-section-header">
              <h3>개인 메모</h3>
              <span className="profile-memo-hint">나만 볼 수 있습니다</span>
            </div>

            <textarea
              className="profile-textarea"
              placeholder="이 친구에 대한 메모를 남겨보세요."
              value={memo}
              onChange={handleMemoChange}
            />

            <button
              className="profile-edit-btn"
              style={{ marginTop: '8px' }}
              onClick={handleSaveMemo}
              disabled={memoSaving}
            >
              {memoSaving ? '저장 중...' : '메모 저장'}
            </button>

            <p className="profile-memo-sub">
              이 메모는 서버에 저장되며, 나만 볼 수 있습니다.
            </p>
          </section>
        )}

        {/* 통계 (friends만 사용) */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <h3>통계</h3>
          </div>

          <div className="profile-stats-row">
            <div className="profile-stat">
              <div className="profile-stat-number">{friends}</div>
              <div className="profile-stat-label">친구</div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
