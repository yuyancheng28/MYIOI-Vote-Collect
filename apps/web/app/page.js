'use client';

import { useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function HomePage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState('');
  const [pollTitle, setPollTitle] = useState('Weekly meeting time');
  const [pollDescription, setPollDescription] = useState('Please choose the weekly meeting time.');
  const [pollOptions, setPollOptions] = useState('Monday 18:00, Wednesday 18:00, Friday 19:00');
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [pollDetail, setPollDetail] = useState(null);
  const [options, setOptions] = useState([]);
  const [results, setResults] = useState([]);

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }), [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem('myioi-token');
    if (savedToken) {
      setToken(savedToken);
      fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${savedToken}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => localStorage.removeItem('myioi-token'));
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadPolls();
  }, [token]);

  async function loadPolls() {
    const res = await fetch(`${API_BASE}/polls`, { headers: authHeaders });
    if (!res.ok) return;
    const data = await res.json();
    setPolls(data.polls || []);
  }

  async function handleLogin() {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Login failed');

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('myioi-token', data.token);
  }

  async function handleRegister() {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: registerUsername, password: registerPassword, role: 'user' }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Registration failed');

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('myioi-token', data.token);
  }

  async function handleCreatePoll() {
    if (!token) return alert('Please log in first');

    const parsedOptions = pollOptions
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const res = await fetch(`${API_BASE}/polls`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: pollTitle, description: pollDescription, options: parsedOptions }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Failed to create poll');

    alert('Poll created successfully');
    setPollTitle('');
    setPollDescription('');
    setPollOptions('');
    await loadPolls();
  }

  async function openPoll(id) {
    setSelectedPollId(id);
    const res = await fetch(`${API_BASE}/polls/${id}`, { headers: authHeaders });
    if (!res.ok) return alert('Failed to load poll');
    const data = await res.json();
    setPollDetail(data.poll);
    setOptions(data.options || []);

    const resultRes = await fetch(`${API_BASE}/polls/${id}/results`, { headers: authHeaders });
    if (resultRes.ok) {
      const resultData = await resultRes.json();
      setResults(resultData.results || []);
    }
  }

  async function vote() {
    if (!selectedPollId || !selectedOptionId) {
      return alert('Please select an option');
    }

    const res = await fetch(`${API_BASE}/polls/${selectedPollId}/vote`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ optionId: selectedOptionId }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Vote failed');

    alert('Vote submitted');
    await openPoll(selectedPollId);
    await loadPolls();
  }

  return (
    <main className="page-shell">
      <div className="container">
        <header className="topbar">
          <div>
            <p className="eyebrow">MYIOI Vote Collect</p>
            <h1>Online voting system</h1>
          </div>

          {user ? (
            <div className="user-chip">
              <span>{user.username}</span>
              <strong>{user.role}</strong>
            </div>
          ) : (
            <div className="user-chip login-box">
              <button onClick={() => setMode('login')} className={mode === 'login' ? 'active' : ''}>Login</button>
              <button onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>Register</button>
            </div>
          )}
        </header>

        {!user && (
          <section className="card auth-card">
            {mode === 'login' ? (
              <>
                <h2>Login</h2>
                <label>
                  Username
                  <input value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                  Password
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <button className="primary" onClick={handleLogin}>Login</button>
              </>
            ) : (
              <>
                <h2>Create account</h2>
                <label>
                  Username
                  <input value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} />
                </label>
                <label>
                  Password
                  <input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
                </label>
                <button className="primary" onClick={handleRegister}>Register</button>
              </>
            )}
          </section>
        )}

        {user && (
          <>
            <section className="grid two-col">
              <div className="card">
                <h2>Create poll</h2>
                <label>
                  Title
                  <input value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} />
                </label>
                <label>
                  Description
                  <textarea value={pollDescription} onChange={(e) => setPollDescription(e.target.value)} />
                </label>
                <label>
                  Options (comma separated)
                  <textarea value={pollOptions} onChange={(e) => setPollOptions(e.target.value)} />
                </label>
                <button className="primary" onClick={handleCreatePoll}>Create poll</button>
              </div>

              <div className="card">
                <h2>Poll list</h2>
                <div className="poll-list">
                  {polls.length === 0 ? (
                    <p>No polls yet.</p>
                  ) : (
                    polls.map((poll) => (
                      <button key={poll.id} className="poll-item" onClick={() => openPoll(poll.id)}>
                        <div>
                          <strong>{poll.title}</strong>
                        </div>
                        <span>{poll.total_votes || 0} votes</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </section>

            {selectedPollId && pollDetail && (
              <section className="card vote-section">
                <h2>{pollDetail.title}</h2>
                <p>{pollDetail.description}</p>

                <div className="vote-options">
                  {options.map((option) => (
                    <label key={option.id} className="option-row">
                      <input
                        type="radio"
                        name="vote-option"
                        checked={selectedOptionId === option.id}
                        onChange={() => setSelectedOptionId(option.id)}
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>

                <button className="primary" onClick={vote}>Submit vote</button>

                {results.length > 0 && (
                  <div className="results-box">
                    <h3>Results</h3>
                    {results.map((item) => (
                      <div key={item.id} className="result-row">
                        <span>{item.text}</span>
                        <strong>{item.vote_count}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
