import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import SummaryCard from "../components/SummaryCard";
import API from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
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
    category: "",
    manufacturer: "",
    supplier: "",
    batch_no: "",
    expiry_date: "",
    quantity: "",
    cost_price: "",
    mrp: "",
  });

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      const s1 = await API.get("/dashboard/today-sales");
      const s2 = await API.get("/dashboard/items-sold");
      const s3 = await API.get("/dashboard/low-stock");
      const s4 = await API.get("/dashboard/summary");
      const m1 = await API.get("/medicines/");

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
     await API.post("/medicines", {
       ...newMedicine,
       quantity: Number(newMedicine.quantity),
       cost_price: Number(newMedicine.cost_price),
       mrp: Number(newMedicine.mrp),
     });

     setShowModal(false);

     setNewMedicine({
       name: "",
       generic_name: "",
       category: "",
       manufacturer: "",
       supplier: "",
       batch_no: "",
       expiry_date: "",
       quantity: "",
       cost_price: "",
       mrp: "",
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
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Pharmacy CRM</h1>
            <p>Manage inventory, sales, and purchase orders</p>
          </div>

          <div className="header-actions">
            <button className="export-btn" onClick={exportCSV}>
              Export
            </button>

            <button className="add-btn" onClick={() => setShowModal(true)}>
              Add Medicine
            </button>
          </div>
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
        <div className="bottomsection">
          <div className="section-bar">
            <div className="section-tabs">
              <button
                onClick={() => navigate("/sales")}
                className={`tab ${location.pathname === "/sales" ? "active" : ""}`}>
                🛒 Sales
              </button>

              <button
                onClick={() => navigate("/purchase")}
                className={`tab ${location.pathname === "/purchase" ? "active" : ""}`}>
                📦 Purchase
              </button>

              <button
                onClick={() => navigate("/")}
                className={`tab ${location.pathname === "/" ? "active" : ""}`}>
                📋 Inventory
              </button>
            </div>

            <div className="section-actions">
              <button className="outline-btn">＋ New Sale</button>
              <button className="outline-btn">＋ New Purchase</button>
            </div>
          </div>

          <div className="inventory-overview">
            <h3>Inventory Overview</h3>

            <div className="overview-grid">
              <div className="overview-card">
                <div className="overview-header">
                  <p>Total Items</p>
                  <span className="icon blue">📦</span>
                </div>
                <h2>10</h2>
              </div>

              <div className="overview-card">
                <div className="overview-header">
                  <p>Active Stock</p>
                  <span className="icon green">✔</span>
                </div>
                <h2>5</h2>
              </div>

              <div className="overview-card">
                <div className="overview-header">
                  <p>Low Stock</p>
                  <span className="icon orange">⚠</span>
                </div>
                <h2>3</h2>
              </div>

              <div className="overview-card">
                <div className="overview-header">
                  <p>Total Value</p>
                  <span className="icon purple">₹</span>
                </div>
                <h2>₹153034</h2>
              </div>
            </div>
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
              </div>
            </div>

            <table className="inventory-table">
              <thead>
                <tr>
                  <th>MEDICINE NAME</th>
                  <th>GENERIC NAME</th>
                  <th>CATEGORY</th>
                  <th>BATCH NO</th>
                  <th>EXPIRY DATE</th>
                  <th>QUANTITY</th>
                  <th>COST PRICE</th>
                  <th>MRP</th>
                  <th>SUPPLIER</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => (
                  <tr key={med.id}>
                    <td>{med.name}</td>
                    <td>{med.generic_name}</td>
                    <td>{med.category}</td>
                    <td>{med.batch_no}</td>
                    <td>{med.expiry_date}</td>
                    <td className="qty-cell">{med.quantity}</td>
                    <td>₹{med.cost_price}</td>
                    <td>₹{med.mrp}</td>
                    <td>{med.supplier}</td>
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
      </div>
      {/* ADD MEDICINE MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Medicine</h3>

            <input
              placeholder="Name"
              value={newMedicine.name}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, name: e.target.value })
              }
            />

            <input
              placeholder="Generic Name"
              value={newMedicine.generic_name}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, generic_name: e.target.value })
              }
            />

            <input
              placeholder="Category"
              value={newMedicine.category}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, category: e.target.value })
              }
            />

            <input
              placeholder="Manufacturer"
              value={newMedicine.manufacturer}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, manufacturer: e.target.value })
              }
            />

            <input
              placeholder="Supplier"
              value={newMedicine.supplier}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, supplier: e.target.value })
              }
            />

            <input
              placeholder="Batch No"
              value={newMedicine.batch_no}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, batch_no: e.target.value })
              }
            />

            <input
              type="date"
              value={newMedicine.expiry_date}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, expiry_date: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Quantity"
              value={newMedicine.quantity}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  quantity: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="Cost Price"
              value={newMedicine.cost_price}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  cost_price: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="MRP"
              value={newMedicine.mrp}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  mrp: Number(e.target.value),
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
