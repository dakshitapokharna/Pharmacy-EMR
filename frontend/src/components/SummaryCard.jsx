import "./SummaryCard.css";

const SummaryCard = ({ title, value, color, icon }) => {
  return (
    <div className="summary-card">
      <div className="card-top">
        <div className={`icon-box ${color}`}>{icon}</div>
      </div>

      <div className="card-content">
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
};

export default SummaryCard;
