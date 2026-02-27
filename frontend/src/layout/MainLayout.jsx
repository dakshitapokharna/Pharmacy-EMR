import "./MainLayout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      <div className="sidebar">
        <div className="icon"></div>
        <div className="icon"></div>
        <div className="icon"></div>
        <div className="icon"></div>
      </div>

      <div className="content">{children}</div>
    </div>
  );
};

export default MainLayout;
