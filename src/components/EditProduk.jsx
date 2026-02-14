import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle, Edit, ShieldAlert } from "lucide-react";

export default function EditProduk() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    tanggalPembelian: "",
    jenis: "Mangkok Original",
    hargaBeliPerGram: "",
    beratKotorGram: "",
    beratBersihGram: "",
    ongkosTotal: "",
    keteranganOngkos: "",
    namaSupplier: "",
    asalProduk: "",
    keterangan: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const userRole = localStorage.getItem("userRole");
  const canEdit = userRole === "owner";

  useEffect(() => {
    if (!canEdit) {
      setLoadingData(false);
      return;
    }
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok) {
        const product = data.data;
        setFormData({
          tanggalPembelian: new Date(product.tanggalPembelian).toISOString().split('T')[0],
          jenis: product.jenis,
          hargaBeliPerGram: product.hargaBeliPerGram,
          beratKotorGram: product.beratKotorGram,
          beratBersihGram: product.beratBersihGram,
          ongkosTotal: product.ongkosTotal || 0,
          keteranganOngkos: product.keteranganOngkos || "",
          namaSupplier: product.namaSupplier,
          asalProduk: product.asalProduk,
          keterangan: product.keterangan || ""
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.tanggalPembelian || !formData.jenis || !formData.hargaBeliPerGram || 
        !formData.beratKotorGram || !formData.beratBersihGram || !formData.namaSupplier || !formData.asalProduk) {
      setError("Semua field wajib harus diisi");
      setLoading(false);
      return;
    }

    const beratKotor = Number(formData.beratKotorGram);
    const beratBersih = Number(formData.beratBersihGram);

    if (beratKotor <= 0 || beratBersih <= 0) {
      setError("Berat harus lebih dari 0 gram");
      setLoading(false);
      return;
    }

    if (beratBersih > beratKotor) {
      setError("Berat bersih tidak boleh lebih besar dari berat kotor");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggalPembelian: formData.tanggalPembelian,
          jenis: formData.jenis,
          hargaBeliPerGram: Number(formData.hargaBeliPerGram),
          beratKotorGram: beratKotor,
          beratBersihGram: beratBersih,
          ongkosTotal: Number(formData.ongkosTotal) || 0,
          keteranganOngkos: formData.keteranganOngkos,
          namaSupplier: formData.namaSupplier,
          asalProduk: formData.asalProduk,
          keterangan: formData.keterangan
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengupdate produk");
        setLoading(false);
        return;
      }

      alert("Produk berhasil diupdate!"); 
      navigate("/kelola-produk");
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Kalkulasi
  const beratKotor = parseFloat(formData.beratKotorGram) || 0;
  const beratBersih = parseFloat(formData.beratBersihGram) || 0;
  const beratSusut = beratKotor - beratBersih;
  const persenSusut = beratKotor > 0 ? (beratSusut / beratKotor) * 100 : 0;

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
            Hanya Owner yang dapat mengedit produk.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full px-6 py-2.5 bg-navy text-white rounded-lg hover:bg-navySoft transition-colors font-medium text-sm"
          >
            Kembali ke Dashboard
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

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="fixed top-0 left-0 right-0 z-40 bg-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate("/kelola-produk")} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Edit Produk</h1>
              <p className="text-xs text-white/70 truncate">Mengubah data produk sarang burung walet</p>
            </div>
            
            <div className="p-2 bg-yellow-400/20 rounded-lg flex-shrink-0">
              <Edit className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 sm:pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tanggal Pembelian <span className="text-red-500">*</span>
                </label>
                <input type="date" name="tanggalPembelian" value={formData.tanggalPembelian} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Jenis Sarang Walet <span className="text-red-500">*</span>
                </label>
                <select name="jenis" value={formData.jenis} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none" required>
                  <option value="Mangkok Original">Mangkok Original</option>
                  <option value="Patahan">Patahan</option>
                  <option value="Segitiga">Segitiga</option>
                  <option value="Strip">Strip</option>
                  <option value="Merah">Merah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Harga Beli per Gram <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                  <input type="number" name="hargaBeliPerGram" value={formData.hargaBeliPerGram} onChange={handleChange}
                    placeholder="5000"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                    required min="0" step="1" />
                </div>
                {formData.hargaBeliPerGram && (
                  <p className="text-xs text-gray-500 mt-1">≈ Rp {formatCurrency(formData.hargaBeliPerGram)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Berat Kotor (Dibeli) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type="number" name="beratKotorGram" value={formData.beratKotorGram} onChange={handleChange}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none pr-16"
                    required min="1" step="1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">gram</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mengubah berat akan menyesuaikan stok tersedia</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Berat Bersih (Setelah Dibersihkan) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type="number" name="beratBersihGram" value={formData.beratBersihGram} onChange={handleChange}
                    placeholder="800"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none pr-16"
                    required min="0" step="1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">gram</span>
                </div>
              </div>

              {/* PREVIEW SUSUT */}
              {beratKotor > 0 && beratBersih >= 0 && (
                <div className="bg-blue-50 border border-gray-300 rounded-md p-3 space-y-2 text-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Kalkulasi Otomatis</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Berat Susut:</span>
                    <span className="font-bold text-orange-700">{beratSusut.toFixed(0)} gram ({persenSusut.toFixed(2)}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Berat Bersih:</span>
                    <span className="font-bold text-green-700">{beratBersih.toFixed(0)} gram</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ongkos (Biaya Tambahan) <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                  <input type="number" name="ongkosTotal" value={formData.ongkosTotal} onChange={handleChange}
                    placeholder="500000"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                    min="0" step="1000" />
                </div>
                {formData.ongkosTotal > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mt-1">≈ Rp {formatCurrency(formData.ongkosTotal)}</p>
                    <input type="text" name="keteranganOngkos" value={formData.keteranganOngkos} onChange={handleChange}
                      placeholder="Keterangan ongkos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none mt-2" />
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Supplier <span className="text-red-500">*</span>
                </label>
                <input type="text" name="namaSupplier" value={formData.namaSupplier} onChange={handleChange}
                  placeholder="Pak Budi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Asal Produk <span className="text-red-500">*</span>
                </label>
                <input type="text" name="asalProduk" value={formData.asalProduk} onChange={handleChange}
                  placeholder="Kalimantan Timur"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Keterangan <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <textarea name="keterangan" value={formData.keterangan} onChange={handleChange}
                  placeholder="Catatan tambahan..." rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none resize-none" />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t">
                <button type="button" onClick={() => navigate("/kelola-produk")}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-yellow-400 hover:bg-yellow-500 text-navy"
                  }`}>
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