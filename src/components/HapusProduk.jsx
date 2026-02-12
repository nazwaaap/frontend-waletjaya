import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Trash2 } from "lucide-react";

export default function HapusProduk() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

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
        setProduct(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Gagal memuat data produk");
    } finally {
      setLoadingData(false);
    }
  };

  const handleHapus = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal menghapus produk");
        setLoading(false);
        return;
      }

      alert(`Produk "${product.jenis}" berhasil dihapus!`);
      navigate("/kelola-produk");
    } catch (err) {
      setError("Backend tidak dapat diakses");
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Memuat data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Produk tidak ditemukan</p>
          <button
            onClick={() => navigate("/kelola-produk")}
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
      <div className="fixed top-0 left-0 right-0 z-40 bg-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/kelola-produk")}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Hapus Produk</h1>
              <p className="text-xs text-white/70 truncate">Konfirmasi penghapusan data produk</p>
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
                Yakin ingin menghapus produk ini?
              </h3>
              <p className="text-xs text-red-600">Data tidak dapat dikembalikan!</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <h4 className="text-center text-sm font-semibold text-navy mb-2">
                {product.jenis}
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tanggal Beli:</span>
                  <span className="font-medium text-gray-900">{formatDate(product.tanggalPembelian)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Supplier:</span>
                  <span className="font-medium text-gray-900">{product.namaSupplier}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Asal:</span>
                  <span className="font-medium text-gray-900">{product.asalProduk}</span>
                </div>

                <div className="pt-1.5 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Berat Kotor:</span>
                    <span className="font-semibold text-gray-800">{product.beratKotorGram} gram</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Berat Bersih:</span>
                    <span className="font-semibold text-gray-800">{product.beratBersihGram} gram</span>
                  </div>

                  {product.beratSusutGram > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Susut:</span>
                      <span className="font-semibold text-orange-700">
                        {product.beratSusutGram} gram ({product.persenSusut?.toFixed(1)}%)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stok Tersedia:</span>
                    <span className="font-semibold text-navy">{product.stokTersediaGram} gram</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Harga Beli/Gram:</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(product.hargaBeliPerGram)}</span>
                  </div>

                  {product.ongkosTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ongkos:</span>
                      <span className="font-semibold text-orange-700">{formatCurrency(product.ongkosTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Modal:</span>
                    <span className="font-bold text-blue-700">{formatCurrency(product.totalModalProduk)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Modal/Gram:</span>
                    <span className="font-bold text-green-700">{formatCurrency(product.modalPerGram)}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    product.status === "Tersedia" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {product.status}
                  </span>
                </div>

                {product.keterangan && (
                  <div className="pt-1.5 border-t">
                    <span className="text-gray-600 block mb-0.5">Keterangan:</span>
                    <p className="text-gray-700">{product.keterangan}</p>
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
                onClick={() => navigate("/kelola-produk")}
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleHapus}
                disabled={loading}
                className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-white transition-colors ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Trash2 className="w-3 h-3" />
                <span>{loading ? "Menghapus..." : "Hapus Produk"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}