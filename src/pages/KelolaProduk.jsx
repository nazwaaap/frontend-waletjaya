import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, ArrowLeft, Package as PackageIcon, ShieldAlert } from "lucide-react";

export default function KelolaProduk() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "owner") {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = "http://localhost:5000/api/products";
      
      const params = new URLSearchParams();
      if (filterJenis) params.append('jenis', filterJenis);
      if (filterStatus) params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "owner") fetchProducts();
  }, [filterJenis, filterStatus, searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (accessDenied) {
  return (
    <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-navy mb-4">
          Akses Ditolak
        </h2>
        
        <p className="text-base text-gray-600 mb-5">
          Halaman ini hanya dapat diakses oleh Owner!
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
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <button onClick={() => navigate("/dashboard")} className="self-start p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Kelola Produk</h1>
              <p className="text-xs text-white/70 truncate">Manajemen produk sarang burung walet</p>
            </div>
            <button
              onClick={() => navigate("/tambah-produk")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-navy rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari jenis, nama supplier, atau asal produk..."
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-navy outline-none">
              <option value="">Semua Jenis</option>
              <option value="Mangkok Original">Mangkok Original</option>
              <option value="Patahan">Patahan</option>
              <option value="Segitiga">Segitiga</option>
              <option value="Strip">Strip</option>
              <option value="Merah">Merah</option>
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-navy outline-none">
              <option value="">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Habis">Habis</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Memuat data produk...</div>
          ) : products.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <PackageIcon className="mx-auto mb-2 w-10 h-10 text-gray-300" />
              <p className="text-sm">{searchTerm || filterJenis || filterStatus ? "Tidak ada produk yang sesuai filter" : "Belum ada produk"}</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">No</th>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jenis</th>
                      <th className="px-4 py-3 text-left">Harga/Kg</th>
                      <th className="px-4 py-3 text-left">Berat</th>
                      <th className="px-4 py-3 text-left">Supplier</th>
                      <th className="px-4 py-3 text-left">Asal</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product, i) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{formatDate(product.tanggalPembelian)}</td>
                        <td className="px-4 py-3"><span className="font-medium text-navy">{product.jenis}</span></td>
                        <td className="px-4 py-3 font-semibold text-green-700">{formatCurrency(product.hargaBeliPerKg)}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-navy">{product.beratTersedia} kg</div>
                          <div className="text-xs text-gray-500">dari {product.beratDibeli} kg</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{product.namaSupplier}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{product.asalProduk}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === "Tersedia" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>{product.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => navigate(`/edit-produk/${product._id}`)}
                              className="p-2 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => navigate(`/hapus-produk/${product._id}`)}
                              className="p-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y">
                {products.map((product, i) => (
                  <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-navy">{product.jenis}</h3>
                        <p className="text-xs text-gray-500">#{i + 1} • {formatDate(product.tanggalPembelian)}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        product.status === "Tersedia" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>{product.status}</span>
                    </div>

                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harga/Kg:</span>
                        <span className="font-semibold text-green-700">{formatCurrency(product.hargaBeliPerKg)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Berat:</span>
                        <span className="font-semibold text-navy">{product.beratTersedia} / {product.beratDibeli} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supplier:</span>
                        <span className="font-medium">{product.namaSupplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Asal:</span>
                        <span className="text-gray-700">{product.asalProduk}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/edit-produk/${product._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium">
                        <Edit className="w-4 h-4" /><span>Edit</span>
                      </button>
                      <button onClick={() => navigate(`/hapus-produk/${product._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium">
                        <Trash2 className="w-4 h-4" /><span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}