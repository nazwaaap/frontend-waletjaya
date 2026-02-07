import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

export default function EditProduk() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    tanggalPembelian: "",
    jenis: "Mangkok Original",
    hargaBeliPerKg: "",
    beratDibeli: "",
    namaSupplier: "",
    asalProduk: "",
    keterangan: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
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
          hargaBeliPerKg: product.hargaBeliPerKg,
          beratDibeli: product.beratDibeli,
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

    if (!formData.tanggalPembelian || !formData.jenis || !formData.hargaBeliPerKg || 
        !formData.beratDibeli || !formData.namaSupplier || !formData.asalProduk) {
      setError("Semua field wajib harus diisi");
      setLoading(false);
      return;
    }

    if (Number(formData.beratDibeli) <= 0) {
      setError("Berat harus lebih dari 0 kg");
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
          hargaBeliPerKg: Number(formData.hargaBeliPerKg),
          beratDibeli: Number(formData.beratDibeli),
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => navigate("/kelola-produk")} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Edit Produk</h1>
              <p className="text-xs text-white/70 truncate">Perbarui informasi produk</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>
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
                Harga Beli per Kg <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                <input type="number" name="hargaBeliPerKg" value={formData.hargaBeliPerKg} onChange={handleChange}
                  placeholder="5000000"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                  required min="0" step="1000" />
              </div>
              {formData.hargaBeliPerKg && (
                <p className="text-xs text-gray-500 mt-1">≈ Rp {formatCurrency(formData.hargaBeliPerKg)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Berat Dibeli <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="number" name="beratDibeli" value={formData.beratDibeli} onChange={handleChange}
                  placeholder="2.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none pr-12"
                  required min="0.01" step="0.01" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">kg</span>
              </div>
              {formData.hargaBeliPerKg && formData.beratDibeli && (
                <p className="text-xs text-green-700 font-medium mt-1">
                  Total: Rp {formatCurrency(formData.hargaBeliPerKg * formData.beratDibeli)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Mengubah berat akan menyesuaikan stok tersedia</p>
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
  );
}