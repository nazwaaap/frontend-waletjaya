import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, AlertCircle, Edit3, TrendingUp, ShieldAlert } from "lucide-react";

export default function EditTransaksi() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [formData, setFormData] = useState({
    tanggalTransaksi: "",
    namaPembeli: "",
    kontakPembeli: "",
    hargaJualPerGram: "",
    metodePembayaran: "Tunai",
    fotoNota: null,
    keterangan: ""
  });
  const [preview, setPreview] = useState({
    totalModal: 0,
    totalHargaJual: 0,
    totalLaba: 0,
    persenLaba: 0,
    persenMarkup: 0
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const userRole = localStorage.getItem("userRole");
  const canEdit = userRole === "owner" || userRole === "admin";

  useEffect(() => {
    if (!canEdit) {
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
        const tx = data.data;
        setTransaction(tx);
        setFormData({
          tanggalTransaksi: new Date(tx.tanggalTransaksi).toISOString().split('T')[0],
          namaPembeli: tx.namaPembeli,
          kontakPembeli: tx.kontakPembeli || "",
          hargaJualPerGram: tx.hargaJualPerGram,
          metodePembayaran: tx.metodePembayaran,
          fotoNota: tx.fotoNota || null,
          keterangan: tx.keterangan || ""
        });
        
        calculatePreview(tx.modalPerGramTransaksi, tx.beratTerjualGram, tx.hargaJualPerGram);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Gagal memuat data transaksi");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "hargaJualPerGram" && transaction) {
      calculatePreview(transaction.modalPerGramTransaksi, transaction.beratTerjualGram, value);
    }
    
    if (error) setError("");
  };

  const calculatePreview = (modalPerGram, beratTerjual, hargaJual) => {
    if (!modalPerGram || !beratTerjual || !hargaJual) return;
    
    const totalModal = parseFloat(modalPerGram) * parseFloat(beratTerjual);
    const totalHargaJual = parseFloat(hargaJual) * parseFloat(beratTerjual);
    const totalLaba = totalHargaJual - totalModal;
    const persenLaba = totalHargaJual > 0 ? (totalLaba / totalHargaJual) * 100 : 0;
    const persenMarkup = parseFloat(modalPerGram) > 0 ? ((parseFloat(hargaJual) - parseFloat(modalPerGram)) / parseFloat(modalPerGram)) * 100 : 0;
    
    setPreview({
      totalModal,
      totalHargaJual,
      totalLaba,
      persenLaba,
      persenMarkup
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, fotoNota: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.namaPembeli || !formData.hargaJualPerGram) {
      setError("Nama pembeli dan harga jual harus diisi");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggalTransaksi: formData.tanggalTransaksi,
          namaPembeli: formData.namaPembeli,
          kontakPembeli: formData.kontakPembeli,
          hargaJualPerGram: parseFloat(formData.hargaJualPerGram),
          metodePembayaran: formData.metodePembayaran,
          fotoNota: formData.fotoNota,
          keterangan: formData.keterangan
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengupdate transaksi");
        setLoading(false);
        return;
      }

      alert("Transaksi berhasil diupdate!");
      navigate("/transaksi-penjualan");
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat('id-ID').format(value);
  };

  if (!canEdit) {
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
            Hanya Owner dan Admin yang dapat mengedit transaksi.
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
            <button onClick={() => navigate("/transaksi-penjualan")} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Edit Transaksi</h1>
              <p className="text-xs text-white/70 truncate">Perbarui informasi transaksi</p>
            </div>
            <Edit3 className="w-6 h-6 text-yellow-400 hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="pt-16 sm:pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-blue-50 border border-gray-300 rounded-lg p-3">
                <h4 className="font-semibold text-navy text-sm mb-2">
                  Informasi Produk (Tidak dapat diubah)
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Produk:</span>
                    <span className="font-semibold text-navy">{transaction.jenisProduk}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Berat Terjual:</span>
                    <span className="font-semibold text-navy">{transaction.beratTerjualGram} gram</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Modal/gram:</span>
                    <span className="font-semibold text-navy">Rp {formatCurrency(transaction.modalPerGramTransaksi)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 bg-blue-100 rounded px-2 py-1.5">
                    <span className="text-gray-700 font-medium">Total Modal Transaksi:</span>
                    <span className="font-bold text-navy">Rp {formatCurrency(transaction.totalModalTransaksi)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tanggal Transaksi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggalTransaksi"
                  value={formData.tanggalTransaksi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Pembeli <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaPembeli"
                  value={formData.namaPembeli}
                  onChange={handleChange}
                  placeholder="PT. ABC / Tuan Budi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kontak Pembeli <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <input
                  type="text"
                  name="kontakPembeli"
                  value={formData.kontakPembeli}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Harga Jual per Gram <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                  <input
                    type="number"
                    name="hargaJualPerGram"
                    value={formData.hargaJualPerGram}
                    onChange={handleChange}
                    placeholder="12000"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                    required
                    min="0"
                    step="10"
                  />
                </div>
                {formData.hargaJualPerGram && (
                  <p className="text-xs text-gray-500 mt-1">≈ Rp {formatCurrency(formData.hargaJualPerGram)}</p>
                )}
              </div>
              
              {/* PREVIEW KALKULASI */}
              <div className="bg-yellow-50 border border-gray-300 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-700" />
                  <h4 className="font-medium text-gray-900 text-sm">Preview Kalkulasi</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded-md p-2 border border-gray-300">
                    <p className="text-gray-600 mb-0.5">Harga Jual/gram</p>
                    <p className="font-medium text-green-700">Rp {formatCurrency(formData.hargaJualPerGram)}</p>
                  </div>
                  
                  <div className="bg-white rounded-md p-2 border border-gray-300">
                    <p className="text-gray-600 mb-0.5">Markup</p>
                    <p className="font-medium text-navy">{preview.persenMarkup.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="pt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Modal:</span>
                    <span className="font-medium text-orange-600">Rp {formatCurrency(preview.totalModal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Penjualan:</span>
                    <span className="font-medium text-green-700">Rp {formatCurrency(preview.totalHargaJual)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-300">
                    <span className="text-gray-900 font-medium">Total Laba:</span>
                    <span className="font-bold text-navy text-base">Rp {formatCurrency(preview.totalLaba)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-yellow-100 rounded px-2 py-1">
                    <span className="text-gray-700">Margin Laba:</span>
                    <span className="font-medium text-navy">{preview.persenLaba.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Metode Pembayaran <span className="text-red-500">*</span>
                </label>
                <select
                  name="metodePembayaran"
                  value={formData.metodePembayaran}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                  required
                >
                  <option value="Tunai">Tunai</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Kredit">Kredit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Foto Nota <span className="text-gray-400 text-xs">(Opsional, max 5MB)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-navy transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload Foto</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.fotoNota && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, fotoNota: null })}
                      className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {formData.fotoNota && (
                  <div className="mt-2">
                    <img src={formData.fotoNota} alt="Preview" className="w-full max-w-xs rounded-md border" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Keterangan <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  placeholder="Catatan tambahan..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/transaksi-penjualan")}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-yellow-400 hover:bg-yellow-500 text-navy"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Menyimpan..." : "Update"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}