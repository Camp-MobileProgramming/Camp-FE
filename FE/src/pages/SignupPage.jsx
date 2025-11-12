import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const validateNickname = (nickname) => {
    const korRegex = /^[ㄱ-ㅎㅏ-ㅣ가-힣]{2,8}$/;
    const engRegex = /^[a-z0-9]{4,16}$/;
    return korRegex.test(nickname) || engRegex.test(nickname);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('올바른 이메일 형식이 아닙니다.');
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

    alert('회원가입 성공! (테스트) 로그인 페이지로 이동합니다.');
    navigate('/login');
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
          <div className="form-group">
            <label htmlFor="email">학교 이메일</label>
            <input
              type="email"
              id="email"
              placeholder="example@hansung.ac.kr"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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