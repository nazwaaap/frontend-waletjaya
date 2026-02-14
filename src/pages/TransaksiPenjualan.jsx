import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, ArrowLeft, ShoppingCart, ShieldAlert, Image as ImageIcon } from "lucide-react";

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

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "owner" && role !== "admin") {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) setTransactions(data.data);
    } catch (err) {
      console.error(err);
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

  const totalPenjualan = filteredTransactions.reduce((sum, t) => sum + t.totalHargaJual, 0);
  const totalLaba = filteredTransactions.reduce((sum, t) => sum + t.totalLaba, 0);
  const totalModal = filteredTransactions.reduce((sum, t) => sum + t.totalModalTransaksi, 0);
  const totalBerat = filteredTransactions.reduce((sum, t) => sum + t.beratTerjualGram, 0);

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
    <div className="min-h-screen bg-gray-50 font-poppins">
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

      <div className="fixed top-0 left-0 right-0 z-40 bg-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Transaksi Penjualan</h1>
              <p className="text-xs text-white/70 truncate">Manajemen transaksi penjualan produk</p>
            </div>
            <button
              onClick={() => navigate("/tambah-transaksi")}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-yellow-400 text-navy rounded-lg text-xs sm:text-sm font-semibold hover:bg-yellow-500 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Transaksi</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-[76px] sm:pt-[84px]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2.5 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] opacity-80 mb-0.5">Total Modal</p>
              <p className="text-sm sm:text-lg font-bold truncate">{formatCurrency(totalModal)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-2.5 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] opacity-80 mb-0.5">Total Penjualan</p>
              <p className="text-sm sm:text-lg font-bold truncate">{formatCurrency(totalPenjualan)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2.5 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] opacity-80 mb-0.5">Total Laba</p>
              <p className="text-sm sm:text-lg font-bold truncate">{formatCurrency(totalLaba)}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-2.5 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] opacity-80 mb-0.5">Total Berat</p>
              <p className="text-sm sm:text-lg font-bold">{totalBerat.toFixed(0)} gram</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-2.5 sm:p-3 space-y-2">
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
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-600 mb-0.5 px-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={filterTanggalMulai}
                    onChange={(e) => setFilterTanggalMulai(e.target.value)}
                    max={filterTanggalAkhir || undefined}
                    className="px-2 py-1.5 border rounded-md text-xs focus:ring-2 focus:ring-navy outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-600 mb-0.5 px-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={filterTanggalAkhir}
                    onChange={(e) => setFilterTanggalAkhir(e.target.value)}
                    min={filterTanggalMulai || undefined}
                    className="px-2 py-1.5 border rounded-md text-xs focus:ring-2 focus:ring-navy outline-none"
                  />
                </div>
                <div className="flex flex-col col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-gray-600 mb-0.5 px-1">Jenis</label>
                  <select
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value)}
                    className="px-2 py-1.5 border rounded-md text-xs focus:ring-2 focus:ring-navy outline-none"
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
                  className="px-3 py-2.5 bg-yellow-400 text-navy rounded-md text-[10px] font-semibold hover:bg-yellow-500 transition-colors whitespace-nowrap"
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
                {/* DESKTOP TABLE */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-navy text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-left">Pembeli</th>
                        <th className="px-4 py-3 text-left">Produk</th>
                        <th className="px-4 py-3 text-left">Berat</th>
                        <th className="px-4 py-3 text-left">Modal</th>
                        <th className="px-4 py-3 text-left">Total Jual</th>
                        <th className="px-4 py-3 text-left">Laba</th>
                        <th className="px-4 py-3 text-center">Metode</th>
                        <th className="px-4 py-3 text-center">Nota</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredTransactions.map((tx, i) => (
                        <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-700 text-xs">{formatDate(tx.tanggalTransaksi)}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-navy">{tx.namaPembeli}</div>
                            {tx.kontakPembeli && (
                              <div className="text-xs text-gray-500">{tx.kontakPembeli}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-navy">{tx.jenisProduk}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-navy">{tx.beratTerjualGram} gram</span>
                            <div className="text-xs text-gray-500">+{tx.persenMarkup.toFixed(1)}%</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-orange-700">{formatCurrency(tx.totalModalTransaksi)}</td>
                          <td className="px-4 py-3 font-bold text-green-700">{formatCurrency(tx.totalHargaJual)}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-blue-700">{formatCurrency(tx.totalLaba)}</div>
                            <div className="text-xs text-gray-500">{tx.persenLaba?.toFixed(1)}%</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs text-gray-700">{tx.metodePembayaran}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {tx.fotoNota ? (
                              <button
                                onClick={() => setViewImage(tx.fotoNota)}
                                className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                title="Lihat Nota"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => navigate(`/edit-transaksi/${tx._id}`)}
                                className="p-2 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {userRole === "owner" && (
                                <button
                                  onClick={() => navigate(`/hapus-transaksi/${tx._id}`)}
                                  className="p-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="lg:hidden divide-y">
                  {filteredTransactions.map((tx, i) => (
                    <div key={tx._id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-navy text-base truncate">{tx.namaPembeli}</h3>
                          <p className="text-xs sm:text-sm text-gray-500">#{i + 1} • {formatDate(tx.tanggalTransaksi)}</p>
                        </div>
                        {tx.fotoNota && (
                          <button
                            onClick={() => setViewImage(tx.fotoNota)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 ml-2 flex-shrink-0"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Produk:</span>
                          <span className="font-medium text-navy">{tx.jenisProduk}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Berat:</span>
                          <span className="font-semibold text-navy">{tx.beratTerjualGram} gram (+{tx.persenMarkup.toFixed(1)}%)</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2 sm:pt-2.5">
                          <span className="text-gray-600">Modal:</span>
                          <span className="font-semibold text-orange-700">{formatCurrency(tx.totalModalTransaksi)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Jual:</span>
                          <span className="font-bold text-green-700">{formatCurrency(tx.totalHargaJual)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Laba:</span>
                          <span className="font-bold text-blue-700">{formatCurrency(tx.totalLaba)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Metode:</span>
                          <span className="text-gray-700">{tx.metodePembayaran}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/edit-transaksi/${tx._id}`)}
                          className={`flex items-center justify-center gap-2 px-3 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium ${userRole === "owner" ? "flex-1" : "w-full"}`}
                        >
                          <Edit className="w-4 h-4" /><span>Edit</span>
                        </button>
                        {userRole === "owner" && (
                          <button
                            onClick={() => navigate(`/hapus-transaksi/${tx._id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
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
  );
}