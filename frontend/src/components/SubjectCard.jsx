import { Link } from 'react-router-dom';

const SubjectCard = ({ subject }) => {
    // Format the date to look nice (e.g. October 10, 2026)
    const formattedDate = new Date(subject.exam_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className={`subject-card ${subject.has_pending_plans ? 'has-pending' : ''}`}>
            <div className="subject-info">
                <h3>{subject.name}</h3>
                <p>Exam Date: {formattedDate}</p>
            </div>
            <Link to={`/subjects/${subject.id}`} className="view-btn">
                View Subject
            </Link>
        </div>
    );
};

export default SubjectCard;
