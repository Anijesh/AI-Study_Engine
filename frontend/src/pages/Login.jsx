import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingForm(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoadingForm(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-visual">
                <div className="auth-visual-content">
                    <h1>Master Your<br /><span>Intelligence</span></h1>
                    <p>The AI-native study engine designed for raw performance and absolute focus.</p>
                </div>
            </div>
            <div className="auth-form-container">
                <div className="auth-form-wrapper">
                    <h2>Welcome Back</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loadingForm}>
                            {loadingForm ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="auth-footer">
                        Don't have an account? <Link to="/register">Create one now</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
