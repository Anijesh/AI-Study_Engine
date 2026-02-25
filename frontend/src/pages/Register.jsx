import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingForm(true);
        try {
            await register(email, password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoadingForm(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-visual">
                <div className="auth-visual-content">
                    <h1>Begin Your<br /><span>Ascension</span></h1>
                    <p>Forge your personalized study path with ruthless efficiency and algorithmic precision.</p>
                </div>
            </div>
            <div className="auth-form-container">
                <div className="auth-form-wrapper">
                    <h2>Initialize</h2>
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
                                placeholder="Choose a secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loadingForm}>
                            {loadingForm ? 'Initializing...' : 'Create Account'}
                        </button>
                    </form>
                    <div className="auth-footer">
                        Already have access? <Link to="/login">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
