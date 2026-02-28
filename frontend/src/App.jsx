import { Routes, Route } from "react-router-dom";
import Inventory from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/sales" element={<Sales />} />
    </Routes>
  );
}

export default App;
