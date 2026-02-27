import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/purchase" element={<Purchase />} />
    </Routes>
  );
}

export default App;
