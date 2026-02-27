import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import SummaryCard from "../components/SummaryCard";
import API from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [sales, setSales] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [summary, setSummary] = useState({});
  const [medicines, setMedicines] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    generic_name: "",
    manufacturer: "",
    batch_no: "",
    expiry_date: "",
    quantity: 0,
    price: 0,
  });

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      const s1 = await API.get("/dashboard/today-sales");
      const s2 = await API.get("/dashboard/items-sold");
      const s3 = await API.get("/dashboard/low-stock");
      const s4 = await API.get("/dashboard/summary");
      const m1 = await API.get("/medicines");

      setSales(s1.data.total_sales || 0);
      setItemsSold(s2.data.items_sold || 0);
      setLowStock(s3.data || []);
      setSummary(s4.data || {});
      setMedicines(m1.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

useEffect(() => {
  const load = async () => {
    await fetchData();
  };

  load();
}, []);

  /* ================= FILTER LOGIC ================= */
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || med.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    const headers = [
      "Name",
      "Generic",
      "Batch",
      "Expiry",
      "Quantity",
      "Price",
      "Status",
    ];

    const rows = filteredMedicines.map((m) => [
      m.name,
      m.generic_name,
      m.batch_no,
      m.expiry_date,
      m.quantity,
      m.price,
      m.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
  };

  /* ================= ADD MEDICINE ================= */
  const handleAddMedicine = async () => {
    try {
      await API.post("/medicines", newMedicine);
      setShowModal(false);
      setNewMedicine({
        name: "",
        generic_name: "",
        manufacturer: "",
        batch_no: "",
        expiry_date: "",
        quantity: 0,
        price: 0,
      });
      fetchData();
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  /* ================= UI ================= */
  return (
    <MainLayout>
      <div className="dashboard-card">
        {/* NAVIGATION */}
        <div className="top-nav">
          <button onClick={() => navigate("/")}>Dashboard</button>
          <button onClick={() => navigate("/sales")}>Sales</button>
          <button onClick={() => navigate("/purchase")}>Purchase</button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="card-grid">
          <SummaryCard
            title="Today's Sales"
            value={`₹${sales}`}
            color="green"
            icon="$"
          />
          <SummaryCard
            title="Items Sold Today"
            value={itemsSold}
            color="blue"
            icon="🛒"
          />
          <SummaryCard
            title="Low Stock Items"
            value={lowStock.length}
            color="orange"
            icon="⚠"
          />
          <SummaryCard
            title="Inventory Value"
            value={`₹${summary.total_inventory_value || 0}`}
            color="purple"
            icon="📦"
          />
        </div>

        {/* INVENTORY SECTION */}
        <div className="inventory-section">
          <div className="inventory-header">
            <h2>Complete Inventory</h2>

            <div className="inventory-actions">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All</option>
                <option>Active</option>
                <option>Low Stock</option>
                <option>Expired</option>
                <option>Out of Stock</option>
              </select>

              <button onClick={exportCSV}>Export</button>
              <button onClick={() => setShowModal(true)}>Add Medicine</button>
            </div>
          </div>

          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Generic</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((med) => (
                <tr key={med.id}>
                  <td>{med.name}</td>
                  <td>{med.generic_name}</td>
                  <td>{med.batch_no}</td>
                  <td>{med.expiry_date}</td>
                  <td>{med.quantity}</td>
                  <td>₹{med.price}</td>
                  <td>
                    <span
                      className={`status-badge ${med.status.replace(" ", "-")}`}>
                      {med.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MEDICINE MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Medicine</h3>

            <input
              placeholder="Name"
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, name: e.target.value })
              }
            />

            <input
              placeholder="Generic"
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, generic_name: e.target.value })
              }
            />

            <input
              placeholder="Batch No"
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, batch_no: e.target.value })
              }
            />

            <input
              type="date"
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, expiry_date: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Quantity"
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  quantity: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="Price"
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  price: Number(e.target.value),
                })
              }
            />

            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleAddMedicine}>Save</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
