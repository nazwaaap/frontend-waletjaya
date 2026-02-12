import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, ArrowLeft, Package as PackageIcon, ShieldAlert, TrendingDown } from "lucide-react";

export default function KelolaProduk() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
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
      const url = "http://localhost:5000/api/products";

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

  const getFilteredProducts = () => {
    let filtered = products;

    // Filter berdasarkan range tanggal 
    if (filterTanggalMulai && filterTanggalAkhir) {
      filtered = filtered.filter(product => {
        const productDate = new Date(product.tanggalPembelian).toISOString().split('T')[0];
        return productDate >= filterTanggalMulai && productDate <= filterTanggalAkhir;
      });
    } else if (filterTanggalMulai) {
      // Hanya tanggal mulai 
      filtered = filtered.filter(product => {
        const productDate = new Date(product.tanggalPembelian).toISOString().split('T')[0];
        return productDate >= filterTanggalMulai;
      });
    } else if (filterTanggalAkhir) {
      // Hanya tanggal akhir 
      filtered = filtered.filter(product => {
        const productDate = new Date(product.tanggalPembelian).toISOString().split('T')[0];
        return productDate <= filterTanggalAkhir;
      });
    }

    // Filter berdasarkan status
    if (filterStatus) {
      filtered = filtered.filter(product => product.status === filterStatus);
    }

    // Filter berdasarkan search term 
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(product => {
        const jenis = (product.jenis || '').toLowerCase();
        const supplier = (product.namaSupplier || '').toLowerCase();
        const asal = (product.asalProduk || '').toLowerCase();
        
        return jenis.includes(search) || 
               supplier.includes(search) || 
               asal.includes(search);
      });
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

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

      {/* FIXED HEADER */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Kelola Produk</h1>
              <p className="text-xs text-white/70 truncate">Manajemen produk sarang burung walet</p>
            </div>
            <button
              onClick={() => navigate("/tambah-produk")}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-yellow-400 text-navy rounded-lg text-xs sm:text-sm font-semibold hover:bg-yellow-500 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Produk</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm top-[76px] sm:top-[84px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari jenis, nama supplier, atau asal produk..."
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
            />
          </div>
          
          <div className="flex gap-2.5 items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1 px-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  value={filterTanggalMulai} 
                  onChange={(e) => setFilterTanggalMulai(e.target.value)}
                  max={filterTanggalAkhir || undefined}
                  className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1 px-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={filterTanggalAkhir} 
                  onChange={(e) => setFilterTanggalAkhir(e.target.value)}
                  min={filterTanggalMulai || undefined}
                  className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1 px-1">Status</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
                >
                  <option value="">Semua Status</option>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Habis">Habis</option>
                </select>
              </div>
            </div>
            {(filterTanggalMulai || filterTanggalAkhir || filterStatus || searchTerm) && (
              <button
                onClick={() => {
                  setFilterTanggalMulai("");
                  setFilterTanggalAkhir("");
                  setFilterStatus("");
                  setSearchTerm("");
                }}
                className="px-4 py-3 bg-yellow-400 text-navy rounded-md text-xs font-semibold hover:bg-yellow-500 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-[195px] sm:pt-[205px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Memuat data produk...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <PackageIcon className="mx-auto mb-2 w-10 h-10 text-gray-300" />
              <p className="text-sm">{searchTerm || filterTanggalMulai || filterTanggalAkhir || filterStatus ? "Tidak ada produk yang sesuai filter" : "Belum ada produk"}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">No</th>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jenis</th>
                      <th className="px-4 py-3 text-left">Modal/Gram</th>
                      <th className="px-4 py-3 text-left">Berat</th>
                      <th className="px-4 py-3 text-left">Susut</th>
                      <th className="px-4 py-3 text-left">Total Modal</th>
                      <th className="px-4 py-3 text-left">Supplier</th>
                      <th className="px-4 py-3 text-left">Asal</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProducts.map((product, i) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{formatDate(product.tanggalPembelian)}</td>
                        <td className="px-4 py-3"><span className="font-medium text-navy">{product.jenis}</span></td>
                        <td className="px-4 py-3 font-semibold text-green-700">{formatCurrency(product.modalPerGram)}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-navy">{product.stokTersediaGram} gram</div>
                          <div className="text-xs text-gray-500">bersih: {product.beratBersihGram} gram</div>
                        </td>
                        <td className="px-4 py-3">
                          {product.beratSusutGram > 0 ? (
                            <div className="flex items-center gap-1">
                              <TrendingDown className="w-3 h-3 text-orange-600" />
                              <div>
                                <div className="font-semibold text-orange-700">{product.beratSusutGram} gram</div>
                                <div className="text-xs text-gray-500">{product.persenSusut?.toFixed(1)}%</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-blue-700">{formatCurrency(product.totalModalProduk)}</div>
                          {product.ongkosTotal > 0 && (
                            <div className="text-xs text-gray-500">ongkos: {formatCurrency(product.ongkosTotal)}</div>
                          )}
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
                              className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => navigate(`/hapus-produk/${product._id}`)}
                              className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y">
                {filteredProducts.map((product, i) => (
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
                        <span className="text-gray-600">Modal/Gram:</span>
                        <span className="font-semibold text-green-700">{formatCurrency(product.modalPerGram)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stok Tersedia:</span>
                        <span className="font-semibold text-navy">{product.stokTersediaGram} gram</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Berat Bersih:</span>
                        <span className="font-medium">{product.beratBersihGram} gram</span>
                      </div>
                      {product.beratSusutGram > 0 && (
                        <div className="flex justify-between items-center bg-orange-50 -mx-2 px-2 py-1 rounded">
                          <span className="text-gray-600 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-orange-600" />
                            Susut:
                          </span>
                          <span className="font-semibold text-orange-700">
                            {product.beratSusutGram} gram ({product.persenSusut?.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between bg-blue-50 -mx-2 px-2 py-1 rounded">
                        <span className="text-gray-600">Total Modal:</span>
                        <div className="text-right">
                          <span className="font-bold text-blue-700">{formatCurrency(product.totalModalProduk)}</span>
                          {product.ongkosTotal > 0 && (
                            <div className="text-xs text-gray-500">ongkos: {formatCurrency(product.ongkosTotal)}</div>
                          )}
                        </div>
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
    </div>
  );
}