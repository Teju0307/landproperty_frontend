// App.js

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ethers } from 'ethers';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://landproperty-backend.onrender.com/api'
  : 'http://localhost:5001/api';

// ====================================================================
// 0. HELPER COMPONENTS
// ====================================================================

const FormMessage = ({ message, type }) => {
    if (!message) return null;
    return <p className={`message ${type}`}>{message}</p>;
};

const Loader = () => <div className="loader"></div>;


// ====================================================================
// 1. AUTHENTICATION COMPONENTS (Login, Register) - UI UPDATED
// ====================================================================

const LoginComponent = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      setToken(response.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <div className="card-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access the registry dashboard.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" className="input-field" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" className="input-field" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader /> : 'Sign In'}
          </button>
        </form>
        {error && <FormMessage message={error} type="error" />}
        <p className="bottom-text">Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
};

const RegisterComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
      setSuccess(response.data.msg + ' Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to register. Please try again.');
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <div className="card-header">
            <h2>Create Your Account</h2>
            <p>Get started with the decentralized registry.</p>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" className="input-field" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" className="input-field" type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader /> : 'Register'}
            </button>
        </form>
        {error && <FormMessage message={error} type="error" />}
        {success && <FormMessage message={success} type="success" />}
        <p className="bottom-text">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};


// ====================================================================
// 2. REGISTRY FORM COMPONENTS - UI UPDATED
// ====================================================================

const RegisterOwnerForm = () => {
    const [formData, setFormData] = useState({ name: '', contact: '', email: '', proofId: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({text: '', type: ''});
        if (!formData.name || !formData.contact || !formData.email || !formData.proofId) {
            setMessage({ text: 'All fields are required.', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/registerOwner`, formData);
            setMessage({ text: response.data.message, type: 'success' });
            setFormData({ name: '', contact: '', email: '', proofId: '' });
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to register owner.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card dashboard-card">
            <h3 className="card-title">Register New Owner</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Owner Name</label><input className="input-field" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., John Doe" disabled={loading} /></div>
                <div className="form-group"><label>Contact Number</label><input className="input-field" name="contact" value={formData.contact} onChange={handleChange} placeholder="e.g., 9876543210" disabled={loading} /></div>
                <div className="form-group"><label>Email ID</label><input className="input-field" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g., john.doe@email.com" disabled={loading} /></div>
                <div className="form-group"><label>Aadhaar / Passport ID</label><input className="input-field" name="proofId" value={formData.proofId} onChange={handleChange} placeholder="e.g., 1234 5678 9012" disabled={loading} /></div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader /> : 'Register Owner'}
                </button>
            </form>
            <FormMessage message={message.text} type={message.type} />
        </div>
    );
};

const RegisterLandForm = () => {
    const [formData, setFormData] = useState({ location: '', area: '', marketValue: '', propertyType: '', surveyNumber: '', currentOwnerId: '' });
    const [owners, setOwners] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/getOwners`);
                setOwners(response.data);
            } catch (error) { console.error("Failed to fetch owners", error); }
        };
        fetchOwners();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (your logic is unchanged)
    };

    return (
        <div className="card dashboard-card">
            <h3 className="card-title">Register New Land/Property</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Location (City, State)</label><input className="input-field" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Mumbai, Maharashtra" /></div>
                <div className="form-group"><label>Size / Area</label><input className="input-field" name="area" value={formData.area} onChange={handleChange} placeholder="e.g., 2 Acres" /></div>
                <div className="form-group"><label>Market Value (INR)</label><input className="input-field" name="marketValue" type="number" value={formData.marketValue} onChange={handleChange} placeholder="e.g., 5000000" /></div>
                <div className="form-group"><label>Property Type</label><input className="input-field" name="propertyType" value={formData.propertyType} onChange={handleChange} placeholder="e.g., Residential, Commercial" /></div>
                <div className="form-group"><label>Survey or Plot Number</label><input className="input-field" name="surveyNumber" value={formData.surveyNumber} onChange={handleChange} placeholder="e.g., 15/B" /></div>
                <div className="form-group">
                    <label>Select Current Owner</label>
                    <select className="input-field" name="currentOwnerId" value={formData.currentOwnerId} onChange={handleChange}>
                        <option value="">-- Select Owner --</option>
                        {owners.map(owner => <option key={owner._id} value={owner._id}>{owner.name} (ID: ...{owner._id.slice(-4)})</option>)}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Register Land</button>
            </form>
            <FormMessage message={message.text} type={message.type} />
        </div>
    );
};

const TransferOwnershipForm = () => {
    const [landId, setLandId] = useState('');
    const [newOwnerId, setNewOwnerId] = useState('');
    const [lands, setLands] = useState([]);
    const [owners, setOwners] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        // ... (your logic is unchanged)
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (your logic is unchanged)
    };
    
    return (
        <div className="card dashboard-card">
            <h3 className="card-title">Transfer Ownership</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Select Land to Transfer</label>
                    <select className="input-field" value={landId} onChange={(e) => setLandId(e.target.value)}>
                        <option value="">-- Select Land --</option>
                        {lands.map(land => <option key={land._id} value={land._id}>{land.location} (Survey#: {land.surveyNumber})</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Select New Owner</label>
                    <select className="input-field" value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)}>
                        <option value="">-- Select New Owner --</option>
                        {owners.map(owner => <option key={owner._id} value={owner._id}>{owner.name} (ID: ...{owner._id.slice(-4)})</option>)}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Transfer Ownership</button>
            </form>
            <FormMessage message={message.text} type={message.type} />
        </div>
    );
};

const ViewRecords = () => {
    const [landId, setLandId] = useState('');
    const [lands, setLands] = useState([]);
    const [record, setRecord] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        // ... (your logic is unchanged)
    }, []);
    
    const handleSearch = async () => {
        // ... (your logic is unchanged)
    };

    return (
        <div className="card dashboard-card">
            <h3 className="card-title">View Land Record & History</h3>
            <div className="search-bar">
                <select className="input-field" value={landId} onChange={(e) => setLandId(e.target.value)}>
                    <option value="">-- Select Land to View --</option>
                    {lands.map(land => <option key={land._id} value={land._id}>{land.location} (Survey#: {land.surveyNumber})</option>)}
                </select>
                <button onClick={handleSearch} className="btn btn-primary">Search</button>
            </div>
            <FormMessage message={message.text} type={message.type} />
            {record && (
                <div className="record-details">
                    <h4>Property Details</h4>
                    <p><strong>Location:</strong> {record.location}</p>
                    <p><strong>Survey Number:</strong> {record.surveyNumber}</p>
                    <p><strong>Area:</strong> {record.area}</p>
                    <p><strong>Market Value:</strong> ₹{record.marketValue.toLocaleString()}</p>
                    <h4>Current Owner</h4>
                    <p><strong>Name:</strong> {record.currentOwner.name}</p>
                    <p><strong>Contact:</strong> {record.currentOwner.contact}</p>
                    <p><strong>Email:</strong> {record.currentOwner.email}</p>
                    <h4>Ownership History</h4>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Owner Name</th>
                                <th>Proof ID</th>
                                <th>Transfer Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {record.ownershipHistory.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.owner.name}</td>
                                    <td>{entry.owner.proofId}</td>
                                    <td>{new Date(entry.transferDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


// ====================================================================
// 3. DASHBOARD COMPONENT - UI UPDATED
// ====================================================================
const DashboardComponent = ({ user, handleLogout, walletAddress, setWalletAddress }) => {
    const [activeTab, setActiveTab] = useState('registerOwner');
    
    const connectWallet = async () => {
        // ... (your logic is unchanged)
    };

    const disconnectWallet = () => setWalletAddress(null);

    const renderActiveTab = () => {
        switch(activeTab) {
            case 'registerOwner': return <RegisterOwnerForm />;
            case 'registerLand': return <RegisterLandForm />;
            case 'transfer': return <TransferOwnershipForm />;
            case 'view': return <ViewRecords />;
            default: return <RegisterOwnerForm />;
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>Certificate Registry</h1>
                </div>

                <div className="sidebar-section">
                    <h3>Wallet Connection</h3>
                    {walletAddress ? (
                        <div>
                            <p>Connected: <strong>{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</strong></p>
                            <button onClick={disconnectWallet} className="btn btn-danger" style={{width: '100%', marginTop: '15px'}}>Disconnect</button>
                        </div>
                    ) : (
                        <div>
                            <p>Connect your wallet to interact with blockchain features.</p>
                            <button onClick={connectWallet} className="btn btn-primary" style={{width: '100%', marginTop: '15px'}}>Connect Wallet</button>
                        </div>
                    )}
                </div>

                <div className="sidebar-section">
                    <h3>Account</h3>
                    <p>Logged in as: <strong>{user?.email}</strong></p>
                </div>
                
                <div className="sidebar-actions">
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </aside>

            <main className="main-content-area">
                <div className="main-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage owners, land properties, and transfers.</p>
                </div>
                <nav className="tabs">
                    <button onClick={() => setActiveTab('registerOwner')} className={`tab-btn ${activeTab === 'registerOwner' ? 'active' : ''}`}>Register Owner</button>
                    <button onClick={() => setActiveTab('registerLand')} className={`tab-btn ${activeTab === 'registerLand' ? 'active' : ''}`}>Register Land</button>
                    <button onClick={() => setActiveTab('transfer')} className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}>Transfer Ownership</button>
                    <button onClick={() => setActiveTab('view')} className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}>View Records</button>
                </nav>
                <div className="tab-content">
                    {renderActiveTab()}
                </div>
            </main>
        </div>
    );
};

// ====================================================================
// 4. MAIN APP COMPONENT (No changes needed here)
// ====================================================================
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setWalletAddress(null);
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedUser = jwtDecode(storedToken);
                if (decodedUser.exp * 1000 < Date.now()) {
                    handleLogout();
                } else {
                    setUser(decodedUser.user);
                    setToken(storedToken);
                }
            } catch (error) {
                handleLogout();
            }
        }
    }, [handleLogout]);

    const handleSetToken = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        try {
            const decodedUser = jwtDecode(newToken);
            setUser(decodedUser.user);
        } catch (error) {
            console.error("Invalid token", error);
            handleLogout();
        }
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!token ? <LoginComponent setToken={handleSetToken} /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!token ? <RegisterComponent /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={token ? <DashboardComponent user={user} handleLogout={handleLogout} walletAddress={walletAddress} setWalletAddress={setWalletAddress} /> : <Navigate to="/login" />} />
                <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;