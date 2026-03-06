import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Plus, Edit, Trash2, Search, ArrowLeft, ShoppingCart, ShieldAlert, Image as ImageIcon, AlertCircle } from "lucide-react";

export default function TransaksiPenjualan() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(""); 

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");  
    setUser({ role, name });  
    
    if (role !== "owner" && role !== "admin") {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(""); 
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.data);
      } else {
        setError(data.message || "Gagal memuat data transaksi"); 
      }
    } catch (err) {
      console.error(err);
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda."); 
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (filterTanggalMulai && filterTanggalAkhir) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.tanggalTransaksi).toISOString().split("T")[0];
        return txDate >= filterTanggalMulai && txDate <= filterTanggalAkhir;
      });
    } else if (filterTanggalMulai) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.tanggalTransaksi).toISOString().split("T")[0];
        return txDate >= filterTanggalMulai;
      });
    } else if (filterTanggalAkhir) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.tanggalTransaksi).toISOString().split("T")[0];
        return txDate <= filterTanggalAkhir;
      });
    }

    if (filterJenis) {
      filtered = filtered.filter((tx) => tx.jenisProduk === filterJenis);
    }

    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((tx) => {
        const namaPembeli = (tx.namaPembeli || "").toLowerCase();
        const kontakPembeli = (tx.kontakPembeli || "").toLowerCase();
        const jenisProduk = (tx.jenisProduk || "").toLowerCase();
        const metodePembayaran = (tx.metodePembayaran || "").toLowerCase();
        const beratTerjual = String(tx.beratTerjualGram || "");
        const totalHargaJual = String(tx.totalHargaJual || "");
        const totalModal = String(tx.totalModalTransaksi || "");
        const totalLaba = String(tx.totalLaba || "");
        const hargaPerGram = String(tx.hargaJualPerGram || "");

        return (
          namaPembeli.includes(search) ||
          kontakPembeli.includes(search) ||
          jenisProduk.includes(search) ||
          metodePembayaran.includes(search) ||
          beratTerjual.includes(search) ||
          totalHargaJual.includes(search) ||
          totalModal.includes(search) ||
          totalLaba.includes(search) ||
          hargaPerGram.includes(search)
        );
      });
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  const totalPenjualan = filteredTransactions.reduce((sum, t) => sum + (t.totalHargaJual || 0), 0);
  const totalLaba = filteredTransactions.reduce((sum, t) => sum + (t.totalLaba || 0), 0);
  const totalModal = filteredTransactions.reduce((sum, t) => sum + (t.totalModalTransaksi || 0), 0);
  const totalBerat = filteredTransactions.reduce((sum, t) => sum + (t.beratTerjualGram || 0), 0);

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-navy mb-4">Akses Ditolak</h2>
          <p className="text-base text-gray-600 mb-5">
            Halaman ini hanya dapat diakses oleh Owner & Admin!
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full px-6 py-2.5 bg-navy text-white rounded-lg hover:bg-navySoft transition-colors font-medium"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      <Sidebar user={user} /> 
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setViewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={viewImage}
                alt="Nota"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setViewImage(null)}
                className="absolute top-4 right-4 bg-white text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-navy">Transaksi Penjualan</h1>
                <p className="text-[10px] text-gray-500">Manajemen transaksi penjualan produk</p>
              </div>
              <button
                onClick={() => navigate("/tambah-transaksi")}
                className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 text-navy rounded-lg text-xs font-semibold hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tambah Transaksi</span>
                <span className="sm:hidden">Tambah</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-3 space-y-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 text-sm">Gagal Memuat Data</h3>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                    <button
                      onClick={fetchTransactions}
                      className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-navy text-white p-2 rounded-lg shadow-sm">
                <p className="text-[9px] opacity-80 mb-0.5">Total Modal</p>
                <p className="text-sm font-bold truncate">{formatCurrency(totalModal)}</p>
              </div>
              <div className="bg-navy text-white p-2 rounded-lg shadow-sm">
                <p className="text-[9px] opacity-80 mb-0.5">Total Penjualan</p>
                <p className="text-sm font-bold truncate">{formatCurrency(totalPenjualan)}</p>
              </div>
              <div className="bg-navy text-white p-2 rounded-lg shadow-sm">
                <p className="text-[9px] opacity-80 mb-0.5">Total Laba</p>
                <p className="text-sm font-bold truncate">{formatCurrency(totalLaba)}</p>
              </div>
              <div className="bg-navy text-white p-2 rounded-lg shadow-sm">
                <p className="text-[9px] opacity-80 mb-0.5">Total Berat</p>
                <p className="text-sm font-bold">{totalBerat.toFixed(0)} gram</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, produk, berat, harga..."
                  className="w-full pl-9 pr-3 py-1.5 border rounded-md text-xs focus:ring-2 focus:ring-navy outline-none"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 grid grid-cols-3 gap-1.5">
                  <div className="flex flex-col">
                    <label className="text-[9px] text-gray-600 mb-0.5 px-1">Dari</label>
                    <input
                      type="date"
                      value={filterTanggalMulai}
                      onChange={(e) => setFilterTanggalMulai(e.target.value)}
                      max={filterTanggalAkhir || undefined}
                      className="px-1.5 py-1 border rounded text-[10px] focus:ring-1 focus:ring-navy outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] text-gray-600 mb-0.5 px-1">Sampai</label>
                    <input
                      type="date"
                      value={filterTanggalAkhir}
                      onChange={(e) => setFilterTanggalAkhir(e.target.value)}
                      min={filterTanggalMulai || undefined}
                      className="px-1.5 py-1 border rounded text-[10px] focus:ring-1 focus:ring-navy outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] text-gray-600 mb-0.5 px-1">Jenis</label>
                    <select
                      value={filterJenis}
                      onChange={(e) => setFilterJenis(e.target.value)}
                      className="px-1.5 py-1 border rounded text-[10px] focus:ring-1 focus:ring-navy outline-none"
                    >
                      <option value="">Semua</option>
                      <option value="Mangkok Original">Mangkok</option>
                      <option value="Patahan">Patahan</option>
                      <option value="Segitiga">Segitiga</option>
                      <option value="Strip">Strip</option>
                      <option value="Merah">Merah</option>
                    </select>
                  </div>
                </div>
                {(filterTanggalMulai || filterTanggalAkhir || filterJenis || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilterTanggalMulai("");
                      setFilterTanggalAkhir("");
                      setFilterJenis("");
                      setSearchTerm("");
                    }}
                    className="px-2 py-1.5 bg-yellow-400 text-navy rounded text-[10px] font-semibold hover:bg-yellow-500 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="py-10 text-center text-sm text-gray-500">Memuat data transaksi...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  <ShoppingCart className="mx-auto mb-2 w-10 h-10 text-gray-300" />
                  <p className="text-sm">
                    {searchTerm || filterTanggalMulai || filterTanggalAkhir || filterJenis
                      ? "Tidak ada transaksi yang sesuai filter"
                      : "Belum ada transaksi"}
                  </p>
                </div>
              ) : (
                <>
        
                  <div className="hidden lg:block w-full overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-navy text-white">
                          <th className="px-3 py-2.5 text-center" style={{width: "3%"}}>No</th>
                          <th className="px-3 py-2.5 text-left" style={{width: "10%"}}>Tanggal</th>
                          <th className="px-3 py-2.5 text-left" style={{width: "10%"}}>Pembeli</th>
                          <th className="px-3 py-2.5 text-left" style={{width: "8%"}}>Produk</th>
                          <th className="px-3 py-2.5 text-left" style={{width: "6%"}}>Berat</th>
                          <th className="px-3 py-2.5 text-right" style={{width: "11%"}}>Modal</th>
                          <th className="px-3 py-2.5 text-right" style={{width: "11%"}}>Jual</th>
                          <th className="px-3 py-2.5 text-right" style={{width: "10%"}}>Laba</th>
                          <th className="px-3 py-2.5 text-center" style={{width: "7%"}}>Metode</th>
                          <th className="px-3 py-2.5 text-center" style={{width: "4%"}}>Nota</th>
                          <th className="px-3 py-2.5 text-center" style={{width: "8%"}}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredTransactions.map((tx, i) => (
                          <tr key={tx._id} className={i % 2 !== 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="px-3 py-2.5 text-center text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2.5 text-gray-700">{formatDate(tx.tanggalTransaksi)}</td>
                            <td className="px-3 py-2.5">
                              <div className="font-medium text-gray-700 truncate">{tx.namaPembeli}</div>
                              {tx.kontakPembeli && (
                                <div className="text-[8px] text-gray-500 truncate">{tx.kontakPembeli}</div>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="font-medium text-gray-700 truncate">
                                {(tx.jenisProduk || tx.productSnapshot?.jenis || "-").replace('Mangkok Original', 'Mangkok')}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="font-medium text-gray-700">{tx.beratTerjualGram}g</span>
                              <div className="text-[8px] text-gray-500">+{(tx.persenMarkup || 0).toFixed(1)}%</div>
                            </td>
                            <td className="px-3 py-2.5 font-medium text-gray-700 text-right">{formatCurrency(tx.totalModalTransaksi)}</td>
                            <td className="px-3 py-2.5 font-medium text-gray-700 text-right">{formatCurrency(tx.totalHargaJual)}</td>
                            <td className="px-3 py-2.5 text-right">
                              <div className="font-medium text-gray-700">{formatCurrency(tx.totalLaba)}</div>
                              <div className="text-[8px] text-gray-500">{(tx.persenLaba || 0).toFixed(1)}%</div>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="text-[9px] text-gray-700 truncate">{tx.metodePembayaran === 'Transfer Bank' ? 'TF' : tx.metodePembayaran === 'E-Wallet' ? 'EW' : 'Tunai'}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {tx.fotoNota ? (
                                <button
                                  onClick={() => setViewImage(tx.fotoNota)}
                                  className="p-0.5 bg-blue-100 text-gray-700 rounded hover:bg-blue-200 transition-colors"
                                  title="Lihat Nota"
                                >
                                  <ImageIcon className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-[9px] text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => navigate(`/edit-transaksi/${tx._id}`)}
                                  className="p-1 text-[9px] bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                {userRole === "owner" && (
                                  <button
                                    onClick={() => navigate(`/hapus-transaksi/${tx._id}`)}
                                    className="p-1 text-[9px] bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

        
                  <div className="lg:hidden divide-y">
                    {filteredTransactions.map((tx, i) => (
                      <div key={tx._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-navy">{tx.namaPembeli}</h3>
                            <p className="text-xs text-gray-500">#{i + 1} • {formatDate(tx.tanggalTransaksi)}</p>
                            {tx.kontakPembeli && <p className="text-[10px] text-gray-400">{tx.kontakPembeli}</p>}
                          </div>
                          <span className="text-[10px] font-semibold text-navy bg-navy/10 px-2 py-0.5 rounded-full">
                            {(tx.jenisProduk || tx.productSnapshot?.jenis || "-").replace('Mangkok Original', 'Mangkok')}
                          </span>
                        </div>

                        <div className="space-y-1.5 mb-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-xs">Berat</span>
                            <span className="font-medium text-xs">{tx.beratTerjualGram}g <span className="text-gray-400 text-[10px]">+{(tx.persenMarkup || 0).toFixed(1)}%</span></span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-xs">Modal</span>
                            <span className="font-medium text-xs">{formatCurrency(tx.totalModalTransaksi)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-xs">Jual</span>
                            <span className="font-semibold text-xs">{formatCurrency(tx.totalHargaJual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-xs">Laba</span>
                            <span className="font-bold text-xs text-navy">{formatCurrency(tx.totalLaba)} <span className="text-gray-400 text-[10px]">{(tx.persenLaba || 0).toFixed(1)}%</span></span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-xs">Metode</span>
                            <span className="text-xs">{tx.metodePembayaran}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {tx.fotoNota && (
                            <button
                              onClick={() => setViewImage(tx.fotoNota)}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Nota</span>
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/edit-transaksi/${tx._id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" /><span>Edit</span>
                          </button>
                          {userRole === "owner" && (
                            <button
                              onClick={() => navigate(`/hapus-transaksi/${tx._id}`)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" /><span>Hapus</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}