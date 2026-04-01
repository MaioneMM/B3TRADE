import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/SignUp';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 700px;
  margin: 3rem auto;
  padding: 0 1.5rem;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #fff;
  }

  .subtitle {
    color: #888;
    margin-bottom: 3rem;
    font-size: 0.95rem;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1rem;
    font-weight: 700;
    color: #26a69a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.85rem;
    color: #888;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .input-row {
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: 500px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  input[type="text"] {
    flex: 1;
    padding: 0.85rem 1rem;
    border-radius: 8px;
    border: 1px solid #444;
    background: #1a1a1e;
    color: #fff;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #26a69a;
    }

    &::placeholder {
      color: #666;
    }
  }

  .counter {
    font-size: 0.78rem;
    color: #666;
    margin-top: 0.5rem;
    text-align: right;
  }

  button.save-btn {
    padding: 0.85rem 1.8rem;
    border-radius: 8px;
    background: #26a69a;
    border: none;
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    white-space: nowrap;

    &:hover:not(:disabled) {
      opacity: 0.85;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .current-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(38, 166, 154, 0.1);
    border: 1px solid rgba(38, 166, 154, 0.3);
    border-radius: 30px;
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
    color: #26a69a;
    font-weight: 600;
    margin-bottom: 1.2rem;

    span { color: #fff; }
  }

  .profile-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;

    img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 2px solid #333;
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .name { font-weight: 700; color: #eee; }
      .email { font-size: 0.8rem; color: #888; }
    }
  }
`;

const UserSettings: React.FC = () => {
  const { nickname, updateNickname } = usePortfolio();
  const auth = useAuth();
  const user = auth?.currentUser;

  const [inputVal, setInputVal] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateNickname(inputVal);
    setSaving(false);
    setInputVal('');
  };

  const displayedName = nickname || user?.displayName || user?.email || 'Trader Anônimo';

  return (
    <Container>
      <h1>⚙️ Configurações</h1>
      <p className="subtitle">Personalize sua conta e visibilidade no ranking global.</p>

      <Card>
        <h2>Perfil Conectado</h2>
        <div className="profile-row">
          {user?.photoURL && (
            <img src={user.photoURL} alt="Avatar" />
          )}
          <div className="info">
            <span className="name">{user?.displayName || 'Usuário'}</span>
            <span className="email">{user?.email}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2>Nickname Público</h2>
        <p>
          Esse será o nome exibido no <strong>Ranking de Traders</strong> e para os outros usuários.
          Se deixar em branco, usamos seu nome de cadastro.
          <br />Use entre 3 e 20 caracteres. Pode usar letras, números e underlines.
        </p>

        {nickname && (
          <div className="current-badge">
            🎯 Nickname atual: <span>{nickname}</span>
          </div>
        )}

        <div className="input-row">
          <input
            type="text"
            placeholder={`Ex: TraderPro_99 (atual: ${displayedName})`}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            maxLength={20}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
          />
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving || inputVal.trim().length < 3}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        <div className="counter">{inputVal.length}/20 caracteres</div>
      </Card>
    </Container>
  );
};

export default UserSettings;
