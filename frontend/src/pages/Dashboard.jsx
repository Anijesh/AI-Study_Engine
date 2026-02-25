import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { logout } = useContext(AuthContext);

    return (
        <div className="page-container">
            <h2>Welcome to your Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your analytics will appear here soon.</p>
            <button onClick={logout} style={{ width: 'auto' }}>Logout</button>
        </div>
    );
};

export default Dashboard;
