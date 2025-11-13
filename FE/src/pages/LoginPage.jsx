import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    // Allow empty email for dev mode - skip validation
    const emailInput = email.trim();
    if (emailInput && !validateEmail(emailInput)) {
      setErrorMessage('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // Dev mode: skip backend and auto-login (no email required)
    console.log('Dev mode: 임시 로그인 실행:', { email: emailInput || 'test@university.ac.kr', password });
    onLogin('dev-test-token-' + Date.now());
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
        <h3 className="login-title">로그인</h3>
        <p className="login-subtitle">학교 이메일로 로그인하세요 (dev mode: 선택사항)</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">학교 이메일</label>
            <input
              type="text"
              id="email"
              placeholder="example@university.ac.kr (선택)"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              placeholder="아무거나 입력해도 됩니다"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}

          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        <div className="signup-link-box">
          <Link to="/signup" className="signup-link">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;