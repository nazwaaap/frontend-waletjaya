import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ShoppingCart, Upload, X, TrendingUp, AlertCircle, Info, ShieldAlert } from "lucide-react";

export default function TambahTransaksi() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    tanggalTransaksi: new Date().toISOString().split('T')[0],
    namaPembeli: "",
    kontakPembeli: "",
    beratTerjualGram: "",
    hargaJualPerGram: "",
    metodePembayaran: "Tunai",
    fotoNota: null,
    keterangan: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const userRole = localStorage.getItem("userRole");
  const canCreate = userRole === "owner" || userRole === "admin";

  useEffect(() => {
    if (!canCreate) return;
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/products?status=Tersedia", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setProducts(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setFormData({ ...formData, productId });
    
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product || null);
    setError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
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

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.productId || !formData.namaPembeli || !formData.kontakPembeli || 
        !formData.beratTerjualGram || !formData.hargaJualPerGram || !formData.metodePembayaran) {
      setError("Semua field wajib harus diisi (kecuali keterangan dan foto nota)");
      setLoading(false);
      return;
    }

    const beratTerjual = parseFloat(formData.beratTerjualGram);

    if (beratTerjual <= 0) {
      setError("Berat harus lebih dari 0");
      setLoading(false);
      return;
    }

    if (selectedProduct && beratTerjual > selectedProduct.stokTersediaGram) {
      setError(`Stok tidak mencukupi! Stok tersedia: ${selectedProduct.stokTersediaGram} gram`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: formData.productId,
          tanggalTransaksi: formData.tanggalTransaksi,
          namaPembeli: formData.namaPembeli,
          kontakPembeli: formData.kontakPembeli,
          beratTerjualGram: beratTerjual,
          hargaJualPerGram: parseFloat(formData.hargaJualPerGram),
          metodePembayaran: formData.metodePembayaran,
          fotoNota: formData.fotoNota,
          keterangan: formData.keterangan
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambahkan transaksi");
        setLoading(false);
        return;
      }

      alert("Transaksi berhasil ditambahkan!");
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

  const beratTerjual = parseFloat(formData.beratTerjualGram) || 0;
  const modalPerGram = selectedProduct?.modalPerGram || 0;
  const hargaJual = parseFloat(formData.hargaJualPerGram) || 0;
  
  const totalModal = beratTerjual * modalPerGram;
  const totalPenjualan = beratTerjual * hargaJual;
  const totalLaba = totalPenjualan - totalModal;
  const persenLaba = totalPenjualan > 0 ? (totalLaba / totalPenjualan) * 100 : 0;
  const persenMarkup = modalPerGram > 0 ? ((hargaJual - modalPerGram) / modalPerGram) * 100 : 0;

  if (!canCreate) {
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
            Hanya Owner dan Admin yang dapat menambah transaksi.
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

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="fixed top-0 left-0 right-0 z-40 bg-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => navigate("/transaksi-penjualan")} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Tambah Transaksi</h1>
              <p className="text-xs text-white/70 truncate">Rekap pencatatan transaksi penjualan walet jaya yang sudah terjadi</p>
            </div>
            <ShoppingCart className="w-6 h-6 text-yellow-400 hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="pt-16 sm:pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="p-4 sm:p-6 space-y-4">
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                  Pilih Produk <span className="text-red-500">*</span>
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                  required
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.jenis} - {product.namaSupplier} (Stok: {product.stokTersediaGram} gram)
                    </option>
                  ))}
                </select>
                
                {selectedProduct && (
                  <div className="mt-2 p-3 bg-blue-50 border border-gray-300 rounded-md text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-600">Modal/gram:</span>
                            <span className="ml-2 font-semibold text-navy">Rp {formatCurrency(selectedProduct.modalPerGram)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Modal Produk:</span>
                            <span className="ml-2 font-semibold text-orange-600">Rp {formatCurrency(selectedProduct.totalModalProduk)}</span>
                          </div>
                          {selectedProduct.beratSusutGram > 0 && (
                            <div>
                              <span className="text-gray-600">Susut:</span>
                              <span className="ml-2 font-semibold text-orange-700">{selectedProduct.beratSusutGram} gram ({selectedProduct.persenSusut?.toFixed(1)}%)</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Stok Tersedia:</span>
                            <span className="ml-2 font-semibold text-green-700">{selectedProduct.stokTersediaGram} gram</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-300 text-xs text-gray-600">
                          Modal sudah termasuk harga beli + ongkos
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  Kontak Pembeli <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="kontakPembeli"
                  value={formData.kontakPembeli}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Berat Terjual <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="beratTerjualGram"
                    value={formData.beratTerjualGram}
                    onChange={handleChange}
                    placeholder="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none pr-16"
                    required
                    min="1"
                    step="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">gram</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Berat bersih yang dijual ke customer</p>
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
                <p className="text-xs text-blue-600 mt-1">Gunakan TAB untuk pindah ke field berikutnya</p>
              </div>

              {selectedProduct && beratTerjual > 0 && hargaJual > 0 && (
                <div className="bg-yellow-50 border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-gray-700" />
                    <h4 className="font-medium text-gray-900 text-base">Preview Kalkulasi Transaksi</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-xs text-gray-600 mb-1">Modal/gram</p>
                      <p className="font-medium text-orange-600">Rp {formatCurrency(modalPerGram)}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <p className="text-xs text-gray-600 mb-1">Harga Jual/gram</p>
                      <p className="font-medium text-green-600">Rp {formatCurrency(hargaJual)}</p>
                      <p className="text-xs text-navy mt-0.5">Markup: {persenMarkup.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-300 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 font-medium">Total Modal:</span>
                      <span className="font-medium text-orange-600">Rp {formatCurrency(totalModal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 font-medium">Total Penjualan:</span>
                      <span className="font-medium text-green-600">Rp {formatCurrency(totalPenjualan)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="text-navy font-medium">Laba Bersih:</span>
                      <span className="font-bold text-navy text-xl">Rp {formatCurrency(totalLaba)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm bg-yellow-100 rounded px-2 py-1">
                      <span className="text-gray-700 font-medium">Margin Laba:</span>
                      <span className="font-medium text-navy">{persenLaba.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              )}

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
                      <span className="text-sm text-gray-600">Upload Foto Nota</span>
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
                  placeholder="Catatan tambahan transaksi..."
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
                  <span>{loading ? "Menyimpan..." : "Simpan Transaksi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}