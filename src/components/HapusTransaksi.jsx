import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";

export default function HapusTransaksi() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const userRole = localStorage.getItem("userRole");
  const canDelete = userRole === "owner";

  useEffect(() => {
    if (!canDelete) {
      setLoadingData(false);
      return;
    }
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTransaction(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Gagal memuat data transaksi");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menghapus transaksi");
        setLoading(false);
        return;
      }

      alert("Transaksi berhasil dihapus dan stok produk dikembalikan!");
      navigate("/transaksi-penjualan");
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (!canDelete) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-navy mb-2">Akses Ditolak</h2>
          <p className="text-sm text-gray-600 mb-5">
            Hanya Owner yang dapat menghapus transaksi.
          </p>
          <button
            onClick={() => navigate("/transaksi-penjualan")}
            className="w-full px-6 py-2.5 bg-navy text-white rounded-lg hover:bg-navySoft transition-colors font-medium text-sm"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Memuat data...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Transaksi tidak ditemukan</p>
          <button
            onClick={() => navigate("/transaksi-penjualan")}
            className="px-4 py-2 bg-navy text-white rounded-md hover:bg-navySoft text-sm transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="fixed top-0 left-0 right-0 z-40 bg-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/transaksi-penjualan")}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Hapus Transaksi</h1>
              <p className="text-xs text-white/70 truncate">Konfirmasi penghapusan data transaksi</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-400 hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="pt-16 sm:pt-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">

            <div className="flex justify-center mb-1">
              <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 text-red-600" />
            </div>

            <div className="text-center mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                Yakin ingin menghapus transaksi ini?
              </h3>
              <p className="text-xs text-red-600">Data tidak dapat dikembalikan!</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <h4 className="text-center text-sm font-semibold text-navy mb-2">
                {transaction.nomorTransaksi}
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-medium text-gray-900">{formatDate(transaction.tanggalTransaksi)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pembeli:</span>
                  <span className="font-medium text-gray-900">{transaction.namaPembeli}</span>
                </div>

                {transaction.kontakPembeli && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kontak:</span>
                    <span className="font-medium text-gray-700">{transaction.kontakPembeli}</span>
                  </div>
                )}

                <div className="pt-1.5 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Produk:</span>
                    <span className="font-semibold text-navy">{transaction.jenisProduk || transaction.productSnapshot?.jenis || "-"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Berat Terjual:</span>
                    <span className="font-semibold text-navy">{transaction.beratTerjualGram} gram</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Harga Jual/gram:</span>
                    <span className="font-semibold text-green-700">{formatCurrency(transaction.hargaJualPerGram)}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Modal:</span>
                    <span className="font-bold text-orange-700">{formatCurrency(transaction.totalModalTransaksi)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Penjualan:</span>
                    <span className="font-bold text-green-700">{formatCurrency(transaction.totalHargaJual)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Laba:</span>
                    <span className="font-bold text-blue-700">{formatCurrency(transaction.totalLaba)}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t flex justify-between items-center">
                  <span className="text-gray-600">Metode Pembayaran:</span>
                  <span className="font-medium text-gray-900">{transaction.metodePembayaran}</span>
                </div>

                {transaction.keterangan && (
                  <div className="pt-1.5 border-t">
                    <span className="text-gray-600 block mb-0.5">Keterangan:</span>
                    <p className="text-gray-700">{transaction.keterangan}</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => navigate("/transaksi-penjualan")}
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-white transition-colors ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Trash2 className="w-3 h-3" />
                <span>{loading ? "Menghapus..." : "Hapus Transaksi"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}