'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        name,
        redirect: false,
      });

      if (res?.error) {
        setError('登入失敗，請檢查 Email 與名字是否正確且在名單中。');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page animate-fade-in">
      <div className="login-card glass-card">
        <div className="login-header">
          <h1 className="login-title">My Kcal</h1>
          <p className="login-subtitle">專屬你的 AI 飲食追蹤助手</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入您的 Email"
              className="field-input"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">名字</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="請輸入您的名字"
              className="field-input"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? <span className="spinner-sm" /> : '登入系統'}
          </button>
        </form>

        <p className="login-footer">
          此系統為封閉式測試，需預先加入名單方可登入。
        </p>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          background: radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px 32px;
          text-align: center;
        }
        .login-header {
          margin-bottom: 32px;
        }
        .login-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #10b981, #06d6a0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .login-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .login-error {
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: -10px;
        }
        .login-footer {
          margin-top: 32px;
          font-size: 0.8rem;
          color: #64748b;
        }
        .spinner-sm {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(11, 15, 26, 0.1);
          border-top-color: #0b0f1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
