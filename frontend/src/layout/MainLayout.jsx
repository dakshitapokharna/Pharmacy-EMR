import "./MainLayout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-inner">
          <div className="sidebar-icon active">🔍</div>
          <div className="sidebar-icon">📦</div>
          <div className="sidebar-icon">📋</div>
          <div className="sidebar-icon">📈</div>
          <div className="sidebar-icon">📅</div>
          <div className="sidebar-icon">👥</div>
          <div className="sidebar-icon">🩺</div>
          <div className="sidebar-icon">💊</div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-icon add-btn">＋</div>
          <div className="sidebar-icon">✨</div>

          <div className="sidebar-bottom">⚙</div>
        </div>
      </div>
      <div className="content">{children}</div>
    </div>
  );
};

export default MainLayout;
