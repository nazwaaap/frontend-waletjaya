import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MasukAkun from "./pages/MasukAkun";
import Dashboard from "./pages/Dashboard";
import KelolaPengguna from "./pages/KelolaPengguna";
import KelolaProduk from "./pages/KelolaProduk";
import TransaksiPenjualan from "./pages/TransaksiPenjualan"; 

import TambahPengguna from "./components/TambahPengguna";
import EditPengguna from "./components/EditPengguna";
import HapusPengguna from "./components/HapusPengguna";

import TambahProduk from "./components/TambahProduk";
import EditProduk from "./components/EditProduk";
import HapusProduk from "./components/HapusProduk";

import TambahTransaksi from "./components/TambahTransaksi";
import EditTransaksi from "./components/EditTransaksi";
import HapusTransaksi from "./components/HapusTransaksi";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<MasukAkun />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Kelola Pengguna */}
        <Route path="/kelola-pengguna" element={<KelolaPengguna />} />
        <Route path="/tambah-pengguna" element={<TambahPengguna />} />
        <Route path="/edit-pengguna/:id" element={<EditPengguna />} />
        <Route path="/hapus-pengguna/:id" element={<HapusPengguna />} />
        
        {/* Kelola Produk */}
        <Route path="/kelola-produk" element={<KelolaProduk />} />
        <Route path="/tambah-produk" element={<TambahProduk />} />
        <Route path="/edit-produk/:id" element={<EditProduk />} />
        <Route path="/hapus-produk/:id" element={<HapusProduk />} />
        
        {/* Transaksi Penjualan */}
        <Route path="/transaksi-penjualan" element={<TransaksiPenjualan />} />
        <Route path="/tambah-transaksi" element={<TambahTransaksi />} />
        <Route path="/edit-transaksi/:id" element={<EditTransaksi />} />
        <Route path="/hapus-transaksi/:id" element={<HapusTransaksi />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;