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

    if (!validateEmail(email)) {
      setErrorMessage('올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.token);
      } else {
        setErrorMessage('아이디 또는 비밀번호가 틀렸습니다.');
      }
    } catch (error) {
      console.error('로그인 요청 중 오류 발생:', error);
      setErrorMessage('로그인 중 문제가 발생했습니다. 나중에 다시 시도해주세요.');
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
        <h3 className="login-title">로그인</h3>
        <p className="login-subtitle">학교 이메일로 로그인하세요</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">학교 이메일</label>
            <input
              type="email"
              id="email"
              placeholder="example@university.ac.kr"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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

/* 메인 화면 볼 때 위 코드 주석처리 후 아래 코드 사용

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

    if (!validateEmail(email)) {
      setErrorMessage('올바른 이메일 형식이 아닙니다.');
      return;
    }

    console.log('백엔드 없이 임시 로그인 실행:', { email, password });
    onLogin('fake-test-token-for-development');
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
        <p className="login-subtitle">학교 이메일로 로그인하세요</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">학교 이메일</label>
            <input
              type="email"
              id="email"
              placeholder="example@university.ac.kr"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
*/