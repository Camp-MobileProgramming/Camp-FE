import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');          // 인증코드
  const [emailSent, setEmailSent] = useState(false); // 코드 보냄 여부
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 한성대 이메일만 허용하는 버전
  const validateEmail = (email) => {
    const regex = /^[A-Za-z0-9._%+-]+@hansung\.ac\.kr$/;
    return regex.test(email);
  };

  const validateNickname = (nickname) => {
    const korRegex = /^[ㄱ-ㅎㅏ-ㅣ가-힣]{2,8}$/;
    const engRegex = /^[a-z0-9]{4,16}$/;
    return korRegex.test(nickname) || engRegex.test(nickname);
  };

  // 1단계: 인증코드 요청
  const handleSendCode = async () => {
    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('올바른 한성대학교 이메일 형식이 아닙니다. (예: example@hansung.ac.kr)');
      return;
    }

    try {
      const response = await fetch('/api/signup/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('인증코드를 학교 이메일로 보냈습니다. 메일함을 확인해주세요!');
        setEmailSent(true);
      } else {
        const msg = await response.text();
        setErrorMessage(msg || '인증코드 발송에 실패했습니다.');
      }
    } catch (err) {
      console.error('인증코드 발송 오류:', err);
      setErrorMessage('인증코드 발송 중 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  // 2단계: 인증코드 + 닉네임 + 비밀번호로 회원가입
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('올바른 한성대학교 이메일 형식이 아닙니다.');
      return;
    }
    if (!validateNickname(nickname)) {
      setErrorMessage('닉네임은 한글 2~8자 또는 영문/숫자 4~16자여야 합니다.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (!emailSent) {
      setErrorMessage('먼저 이메일 인증코드를 요청해주세요.');
      return;
    }
    if (!code) {
      setErrorMessage('이메일로 받은 인증코드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 백엔드로 인증코드도 같이 전송
        body: JSON.stringify({ email, nickname, password, code }),
      });

      if (response.ok) {
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        navigate('/login');
      } else {
        const msg = await response.text();
        setErrorMessage(msg || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 중 오류:', error);
      setErrorMessage('회원가입 중 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  return (
    <div className="login-page-container">
      <div className="logo-section">
        <span className="logo-icon">🏕️</span>
        <h1 className="logo-title">캠프</h1>
        <h2 className="app-name">Campus Friend</h2>
        <p className="app-subtitle">캠퍼스에서 친구를 만나보세요</p>
      </div>

      <div className="login-form-box">
        <h3 className="login-title">회원가입</h3>
        <p className="login-subtitle">학교 이메일로 가입하세요</p>

        <form onSubmit={handleSubmit}>
          {/* 이메일 + 인증코드 요청 버튼 */}
          <div className="form-group">
            <label htmlFor="email">학교 이메일</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                id="email"
                placeholder="example@hansung.ac.kr"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-button"
                style={{ whiteSpace: 'nowrap' }}
                onClick={handleSendCode}
              >
                인증코드 요청
              </button>
            </div>
          </div>

          {/* 인증코드 입력 */}
          <div className="form-group">
            <label htmlFor="code">이메일 인증코드</label>
            <input
              type="text"
              id="code"
              placeholder="메일로 받은 인증코드"
              className="input-field"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              placeholder="한글 2~8자 또는 영어 4~16자"
              className="input-field"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <p className="form-helper-text">한글 2~8자 또는 영어 4~16자</p>
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}

          <button type="submit" className="login-button">
            가입하기
          </button>
        </form>

        <div className="signup-link-box">
          <Link to="/login" className="signup-link">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
