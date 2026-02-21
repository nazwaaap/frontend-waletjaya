import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Plus, Edit, Trash2, Search, ArrowLeft, Package as PackageIcon, ShieldAlert, TrendingDown, AlertCircle } from "lucide-react";

export default function KelolaProduk() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(""); 

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    setUser({ role, name });
    
    if (role !== "owner") {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(""); 
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
      if (res.ok) {
        setProducts(data.data);
      } else {
        setError(data.message || "Gagal memuat data produk"); 
      }
    } catch (err) {
      console.error(err);
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda."); 
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

    if (filterTanggalMulai && filterTanggalAkhir) {
      filtered = filtered.filter(product => {
        const productDate = new Date(product.tanggalPembelian).toISOString().split('T')[0];
        return productDate >= filterTanggalMulai && productDate <= filterTanggalAkhir;
      });
    } else if (filterTanggalMulai) {
      filtered = filtered.filter(product => {
        const productDate = new Date(product.tanggalPembelian).toISOString().split('T')[0];
        return productDate >= filterTanggalMulai;
      });
    } else if (filterTanggalAkhir) {
      filtered = filtered.filter(product => {
        const productDate = new Date(product.tanggalPembelian).toISOString().split('T')[0];
        return productDate <= filterTanggalAkhir;
      });
    }

    if (filterStatus) {
      filtered = filtered.filter(product => product.status === filterStatus);
    }

    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(product => {
        const jenis = (product.jenis || '').toLowerCase();
        const supplier = (product.namaSupplier || '').toLowerCase();
        const asal = (product.asalProduk || '').toLowerCase();
        const status = (product.status || '').toLowerCase();
        
        const modalPerGram = String(product.modalPerGram || '');
        const stokTersedia = String(product.stokTersediaGram || '');
        const beratBersih = String(product.beratBersihGram || '');
        const beratSusut = String(product.beratSusutGram || '');
        const totalModal = String(product.totalModalProduk || '');
        const ongkos = String(product.ongkosTotal || '');
        
        const combinedText = `${jenis} ${supplier} ${asal} ${status} ${modalPerGram} ${stokTersedia} ${beratBersih} ${beratSusut} ${totalModal} ${ongkos}`;
        
        return combinedText.includes(search) ||
               jenis.includes(search) || 
               supplier.includes(search) || 
               asal.includes(search) ||
               status.includes(search) ||
               modalPerGram.includes(search) ||
               stokTersedia.includes(search) ||
               beratBersih.includes(search) ||
               beratSusut.includes(search) ||
               totalModal.includes(search) ||
               ongkos.includes(search);
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
    <div className="flex h-screen bg-gray-50 font-poppins">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-navy">Kelola Produk</h1>
                <p className="text-[10px] text-gray-500">Manajemen produk sarang burung walet</p>
              </div>
              <button
                onClick={() => navigate("/tambah-produk")}
                className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 text-navy rounded-lg text-xs font-semibold hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tambah Produk</span>
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
                      onClick={fetchProducts}
                      className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari jenis, nama supplier, atau asal produk..."
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
                    <label className="text-[9px] text-gray-600 mb-0.5 px-1">Status</label>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-1.5 py-1 border rounded text-[10px] focus:ring-1 focus:ring-navy outline-none"
                    >
                      <option value="">Semua</option>
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
                    className="px-3 py-2.5 bg-yellow-400 text-navy rounded text-[10px] font-semibold hover:bg-yellow-500 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

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
            
                  <div className="hidden lg:block w-full overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-navy text-white text-xs">
                        <tr>
                          <th className="px-3 py-2.5 text-center" style={{width: "3%"}}>No</th>
                          <th className="px-3 py-2.5 text-left" style={{width: "10%"}}>Tanggal</th>
                          <th className="px-3 py-2.5 text-left" style={{width: "8%"}}>Jenis</th>
                          <th className="px-3 py-2.5 text-right" style={{width: "8%"}}>Modal/Gram</th>
                          <th className="px-3 py-2.5 text-right" style={{width: "8%"}}>Tersedia</th>
                          <th className="px-3 py-2.5 text-right" style={{width: "7%"}}>Susut</th>
                          <th className="px-3 py-2.5 text-right" style={{width: "10%"}}>Total Modal</th>
                          <th className="px-3 py-2.5 text-right" style={{width: "9%"}}>Ongkos</th>
                          <th className="px-3 py-2.5 text-center" style={{width: "9%"}}>Supplier</th>
                          <th className="px-3 py-2.5 text-left" style={{width: "6%"}}>Asal</th>
                          <th className="px-3 py-2.5 text-center" style={{width: "6%"}}>Status</th>
                          <th className="px-3 py-2.5 text-center" style={{width: "7%"}}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product, i) => (
                          <tr key={product._id} className={i % 2 !== 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="px-3 py-2.5 text-center text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2.5 text-gray-700">{formatDate(product.tanggalPembelian)}</td>
                            <td className="px-3 py-2.5"><span className="font-medium text-gray-700">{product.jenis}</span></td>
                            <td className="px-3 py-2.5 font-medium text-gray-700 text-right">{formatCurrency(product.modalPerGram)}</td>
                            <td className="px-3 py-2.5 text-right">
                              <div className="font-medium text-gray-700">{product.stokTersediaGram}g</div>
                              <div className="text-[8px] text-gray-500">bersih: {product.beratBersihGram}g</div>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {product.beratSusutGram > 0 ? (
                                <div>
                                  <div className="font-medium text-gray-700">{product.beratSusutGram}g</div>
                                  <div className="text-[8px] text-gray-500">{product.persenSusut?.toFixed(1)}%</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <div className="font-medium text-gray-700">{formatCurrency(product.totalModalProduk)}</div>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {product.ongkosTotal > 0 ? (
                                <div className="font-medium text-gray-700">{formatCurrency(product.ongkosTotal)}</div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-700">{product.namaSupplier}</td>
                            <td className="px-3 py-2.5 text-gray-700">{product.asalProduk}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                                product.status === "Tersedia" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>{product.status}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-center gap-1">
                                <button onClick={() => navigate(`/edit-produk/${product._id}`)}
                                  className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors" title="Edit">
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button onClick={() => navigate(`/hapus-produk/${product._id}`)}
                                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Hapus">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
                            <span className="font-bold text-blue-700">{formatCurrency(product.totalModalProduk)}</span>
                          </div>
                          <div className="flex justify-between bg-orange-50 -mx-2 px-2 py-1 rounded">
                            <span className="text-gray-600">Ongkos:</span>
                            <span className={`font-semibold ${product.ongkosTotal > 0 ? "text-orange-600" : "text-gray-400"}`}>
                              {product.ongkosTotal > 0 ? formatCurrency(product.ongkosTotal) : "-"}
                            </span>
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
    </div>
  );
}