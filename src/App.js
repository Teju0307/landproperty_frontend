// App.js

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ethers } from 'ethers';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5001/api';

// ====================================================================
// 0. HELPER COMPONENTS
// ====================================================================

const FormMessage = ({ message, type }) => {
    if (!message) return null;
    return <p className={`message ${type}`}>{message}</p>;
};


// ====================================================================
// 1. AUTHENTICATION COMPONENTS (Login, Register) - UPDATED
// ====================================================================

const LoginComponent = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      setToken(response.data.token);
    } catch (err) {
      // Use error response from axios for more specific messages
      setError(err.response?.data?.msg || 'Failed to login. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
};

const RegisterComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
      setSuccess(response.data.msg + ' Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to register. Please try again.');
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};


// ====================================================================
// 2. REGISTRY FORM COMPONENTS (No changes needed, code is good)
// ====================================================================

// --- 2a. Register Owner Form ---
const RegisterOwnerForm = () => {
    const [formData, setFormData] = useState({ name: '', contact: '', email: '', proofId: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.contact || !formData.email || !formData.proofId) {
            setMessage({ text: 'All fields are required.', type: 'error' });
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/registerOwner`, formData);
            setMessage({ text: response.data.message, type: 'success' });
            setFormData({ name: '', contact: '', email: '', proofId: '' });
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to register owner.', type: 'error' });
        }
    };

    return (
        <div className="form-container">
            <h3>Register New Owner</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><input name="name" value={formData.name} onChange={handleChange} placeholder="Owner Name" /></div>
                <div className="form-group"><input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact Number" /></div>
                <div className="form-group"><input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email ID" /></div>
                <div className="form-group"><input name="proofId" value={formData.proofId} onChange={handleChange} placeholder="Aadhaar / Passport ID" /></div>
                <button type="submit">Register Owner</button>
            </form>
            <FormMessage message={message.text} type={message.type} />
        </div>
    );
};

// --- 2b. Register Land Form ---
const RegisterLandForm = () => {
    const [formData, setFormData] = useState({ location: '', area: '', marketValue: '', propertyType: '', surveyNumber: '', currentOwnerId: '' });
    const [owners, setOwners] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/getOwners`);
                setOwners(response.data);
            } catch (error) {
                console.error("Failed to fetch owners", error);
            }
        };
        fetchOwners();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(formData).some(val => val === '')) {
            setMessage({ text: 'All fields are required.', type: 'error' });
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/registerLand`, formData);
            setMessage({ text: response.data.message, type: 'success' });
            setFormData({ location: '', area: '', marketValue: '', propertyType: '', surveyNumber: '', currentOwnerId: '' });
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to register land.', type: 'error' });
        }
    };

    return (
        <div className="form-container">
            <h3>Register New Land/Property</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><input name="location" value={formData.location} onChange={handleChange} placeholder="Location (City, State)" /></div>
                <div className="form-group"><input name="area" value={formData.area} onChange={handleChange} placeholder="Size / Area (e.g., 2 Acres)" /></div>
                <div className="form-group"><input name="marketValue" type="number" value={formData.marketValue} onChange={handleChange} placeholder="Market Value (in INR)" /></div>
                <div className="form-group"><input name="propertyType" value={formData.propertyType} onChange={handleChange} placeholder="Property Type (Residential, etc.)" /></div>
                <div className="form-group"><input name="surveyNumber" value={formData.surveyNumber} onChange={handleChange} placeholder="Survey or Plot Number" /></div>
                <div className="form-group">
                    <select name="currentOwnerId" value={formData.currentOwnerId} onChange={handleChange}>
                        <option value="">-- Select Current Owner --</option>
                        {owners.map(owner => <option key={owner._id} value={owner._id}>{owner.name} (ID: ...{owner._id.slice(-4)})</option>)}
                    </select>
                </div>
                <button type="submit">Register Land</button>
            </form>
            <FormMessage message={message.text} type={message.type} />
        </div>
    );
};

// --- 2c. Transfer Ownership Form ---
const TransferOwnershipForm = () => {
    const [landId, setLandId] = useState('');
    const [newOwnerId, setNewOwnerId] = useState('');
    const [lands, setLands] = useState([]);
    const [owners, setOwners] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [landsRes, ownersRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/getLands`),
                    axios.get(`${API_BASE_URL}/getOwners`)
                ]);
                setLands(landsRes.data);
                setOwners(ownersRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!landId || !newOwnerId) {
            setMessage({ text: 'Please select both land and a new owner.', type: 'error' });
            return;
        }
        try {
            const response = await axios.put(`${API_BASE_URL}/transferOwnership`, { landId, newOwnerId });
            setMessage({ text: response.data.message, type: 'success' });
            setLandId('');
            setNewOwnerId('');
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to transfer ownership.', type: 'error' });
        }
    };
    
    return (
        <div className="form-container">
            <h3>Transfer Ownership</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Select Land to Transfer:</label>
                    <select value={landId} onChange={(e) => setLandId(e.target.value)}>
                        <option value="">-- Select Land --</option>
                        {lands.map(land => <option key={land._id} value={land._id}>{land.location} (Survey#: {land.surveyNumber})</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Select New Owner:</label>
                    <select value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)}>
                        <option value="">-- Select New Owner --</option>
                        {owners.map(owner => <option key={owner._id} value={owner._id}>{owner.name} (ID: ...{owner._id.slice(-4)})</option>)}
                    </select>
                </div>
                <button type="submit">Transfer</button>
            </form>
            <FormMessage message={message.text} type={message.type} />
        </div>
    );
};

// --- 2d. View Records Component ---
const ViewRecords = () => {
    const [landId, setLandId] = useState('');
    const [lands, setLands] = useState([]);
    const [record, setRecord] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchLands = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/getLands`);
                setLands(response.data);
            } catch (error) { console.error("Failed to fetch lands", error); }
        };
        fetchLands();
    }, []);
    
    const handleSearch = async () => {
        if (!landId) {
            setMessage({ text: 'Please select a land to view its record.', type: 'error' });
            return;
        }
        setMessage({ text: '', type: '' });
        setRecord(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/getLandRecord/${landId}`);
            setRecord(response.data);
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to fetch record.', type: 'error' });
        }
    };

    return (
        <div className="form-container">
            <h3>View Land Record & Ownership History</h3>
            <div className="search-bar">
                <select value={landId} onChange={(e) => setLandId(e.target.value)}>
                    <option value="">-- Select Land by Location --</option>
                    {lands.map(land => <option key={land._id} value={land._id}>{land.location} (Survey#: {land.surveyNumber})</option>)}
                </select>
                <button onClick={handleSearch}>Search</button>
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
// 3. DASHBOARD COMPONENT (The Main Hub) - No changes needed, code is good
// ====================================================================
const DashboardComponent = ({ user, handleLogout, walletAddress, setWalletAddress }) => {
    const [activeTab, setActiveTab] = useState('registerOwner');
    
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setWalletAddress(accounts[0]);
            } catch (error) {
                console.error("Error connecting to MetaMask", error);
                if (error.code === 4001) {
                    alert("You rejected the connection request.");
                } else {
                    alert("Failed to connect wallet. Is it unlocked?");
                }
            }
        } else {
            alert("MetaMask is not installed.");
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
    };

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
        <div className="dashboard-container">
            <div className="header">
                <h1>Land Registry System</h1>
                <div className="header-right">
                    <span>Logged in: <strong>{user?.email}</strong></span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </div>

            <div className="wallet-section">
                <h2>Wallet Connection</h2>
                {walletAddress ? (
                    <div>
                        <p>Connected Address: <strong>{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</strong></p>
                        <button onClick={disconnectWallet} className="wallet-btn disconnect">Disconnect Wallet</button>
                    </div>
                ) : (
                    <div>
                        <p>Connect your wallet to interact with blockchain features.</p>
                        <button onClick={connectWallet} className="wallet-btn connect">Connect Wallet</button>
                    </div>
                )}
            </div>

            <div className="main-content">
                <nav className="tabs">
                    <button onClick={() => setActiveTab('registerOwner')} className={activeTab === 'registerOwner' ? 'active' : ''}>Register Owner</button>
                    <button onClick={() => setActiveTab('registerLand')} className={activeTab === 'registerLand' ? 'active' : ''}>Register Land</button>
                    <button onClick={() => setActiveTab('transfer')} className={activeTab === 'transfer' ? 'active' : ''}>Transfer Ownership</button>
                    <button onClick={() => setActiveTab('view')} className={activeTab === 'view' ? 'active' : ''}>View Records</button>
                </nav>
                <div className="tab-content">
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
};

// ====================================================================
// 4. MAIN APP COMPONENT (Handles State and Routing) - No changes needed, code is good
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
            <div className="App">
                <Routes>
                    <Route path="/login" element={!token ? <LoginComponent setToken={handleSetToken} /> : <Navigate to="/dashboard" />} />
                    <Route path="/register" element={!token ? <RegisterComponent /> : <Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={token ? <DashboardComponent user={user} handleLogout={handleLogout} walletAddress={walletAddress} setWalletAddress={setWalletAddress} /> : <Navigate to="/login" />} />
                    <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;