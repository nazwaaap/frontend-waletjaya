import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MasukAkun from "./pages/MasukAkun";
import Dashboard from "./pages/Dashboard";
import KelolaPengguna from "./pages/KelolaPengguna";
import KelolaProduk from "./pages/KelolaProduk";
import TransaksiPenjualan from "./pages/TransaksiPenjualan"; 
import LaporanPenjualan from "./pages/LaporanPenjualan";
import KelolaProfil from "./pages/KelolaProfil";

import TambahPengguna from "./components/TambahPengguna";
import EditPengguna from "./components/EditPengguna";
import HapusPengguna from "./components/HapusPengguna";

import TambahProduk from "./components/TambahProduk";
import EditProduk from "./components/EditProduk";
import HapusProduk from "./components/HapusProduk";

import TambahTransaksi from "./components/TambahTransaksi";
import EditTransaksi from "./components/EditTransaksi";
import HapusTransaksi from "./components/HapusTransaksi";

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("userRole");

  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<MasukAkun />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        {/* Kelola Pengguna hanya owner*/}
        <Route path="/kelola-pengguna" element={
          <ProtectedRoute roles={["owner"]}><KelolaPengguna /></ProtectedRoute>
        } />
        <Route path="/tambah-pengguna" element={
          <ProtectedRoute roles={["owner"]}><TambahPengguna /></ProtectedRoute>
        } />
        <Route path="/edit-pengguna/:id" element={
          <ProtectedRoute roles={["owner"]}><EditPengguna /></ProtectedRoute>
        } />
        <Route path="/hapus-pengguna/:id" element={
          <ProtectedRoute roles={["owner"]}><HapusPengguna /></ProtectedRoute>
        } />

        {/* Kelola Produk hanya owner */}
        <Route path="/kelola-produk" element={
          <ProtectedRoute roles={["owner"]}><KelolaProduk /></ProtectedRoute>
        } />
        <Route path="/tambah-produk" element={
          <ProtectedRoute roles={["owner"]}><TambahProduk /></ProtectedRoute>
        } />
        <Route path="/edit-produk/:id" element={
          <ProtectedRoute roles={["owner"]}><EditProduk /></ProtectedRoute>
        } />
        <Route path="/hapus-produk/:id" element={
          <ProtectedRoute roles={["owner"]}><HapusProduk /></ProtectedRoute>
        } />

        {/* Transaksi Penjualan */}
        <Route path="/transaksi-penjualan" element={
          <ProtectedRoute roles={["owner", "admin"]}><TransaksiPenjualan /></ProtectedRoute>
        } />
        <Route path="/tambah-transaksi" element={
          <ProtectedRoute roles={["owner", "admin"]}><TambahTransaksi /></ProtectedRoute>
        } />
        <Route path="/edit-transaksi/:id" element={
          <ProtectedRoute roles={["owner", "admin"]}><EditTransaksi /></ProtectedRoute>
        } />
        <Route path="/hapus-transaksi/:id" element={
          <ProtectedRoute roles={["owner", "admin"]}><HapusTransaksi /></ProtectedRoute>
        } />

        {/* Laporan Penjualan */}
        <Route path="/laporan-penjualan" element={
          <ProtectedRoute roles={["owner", "admin"]}><LaporanPenjualan /></ProtectedRoute>
        } />

        {/* Kelola Profil */}
        <Route path="/kelola-profil" element={
          <ProtectedRoute roles={["owner", "admin"]}><KelolaProfil /></ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;