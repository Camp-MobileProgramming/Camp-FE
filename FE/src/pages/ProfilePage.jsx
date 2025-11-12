import React from 'react';
import BottomNav from '../components/BottomNav.jsx';

function ProfilePage({ onLogout }) {
  return (
    <div style={{ paddingBottom: '70px' }}>
      <div style={{ padding: '20px' }}>
        <h1>프로필 페이지</h1>
        <p>내 정보 수정</p>
        
        <button 
          onClick={onLogout} 
          style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          로그아웃
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
export default ProfilePage;