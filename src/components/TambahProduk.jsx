import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, Save, Package, AlertCircle } from "lucide-react";

export default function TambahProduk() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tanggalPembelian: new Date().toISOString().split('T')[0],
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

  const user = {
    role: localStorage.getItem("userRole"),
    name: localStorage.getItem("userName"),
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
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
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
        setError(data.message || "Gagal menambahkan produk");
        setLoading(false);
        return;
      }

      alert("Produk berhasil ditambahkan!");
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

  const beratKotor = parseFloat(formData.beratKotorGram) || 0;
  const beratBersih = parseFloat(formData.beratBersihGram) || 0;
  const beratSusut = beratKotor - beratBersih;
  const persenSusut = beratKotor > 0 ? (beratSusut / beratKotor) * 100 : 0;
  const hargaBeli = parseFloat(formData.hargaBeliPerGram) || 0;
  const ongkos = parseFloat(formData.ongkosTotal) || 0;
  
  const totalHargaBeli = hargaBeli * beratKotor;
  const totalModalProduk = totalHargaBeli + ongkos;
  const modalPerGram = beratBersih > 0 ? totalModalProduk / beratBersih : 0;

  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/kelola-produk")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-navy">Tambah Produk</h1>
                <p className="text-[10px] text-gray-500">Tambahkan produk sarang burung walet baru</p>
              </div>
              <Package className="w-5 h-5 text-navy hidden sm:block" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
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
                  <input
                    type="date"
                    name="tanggalPembelian"
                    value={formData.tanggalPembelian}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Jenis Sarang Walet <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                    required
                  >
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
                    <input
                      type="number"
                      name="hargaBeliPerGram"
                      value={formData.hargaBeliPerGram}
                      onChange={handleChange}
                      placeholder="15000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                      required
                      min="0"
                      step="1"
                    />
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
                    <input
                      type="number"
                      name="beratKotorGram"
                      value={formData.beratKotorGram}
                      onChange={handleChange}
                      placeholder="4635"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors pr-16"
                      required
                      min="1"
                      step="1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">gram</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Berat kotor yang dibeli dari supplier</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Berat Bersih (Setelah Dibersihkan) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="beratBersihGram"
                      value={formData.beratBersihGram}
                      onChange={handleChange}
                      placeholder="3559"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors pr-16"
                      required
                      min="0"
                      step="1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">gram</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Berat bersih setelah proses pembersihan</p>
                </div>

                {/* preview susut */}
                {beratKotor > 0 && beratBersih >= 0 && (
                  <div className="bg-blue-50 border border-gray-300 rounded-md p-3 space-y-2 text-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Kalkulasi Otomatis</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Berat Susut:</span>
                      <span className="font-semibold text-gray-700">{beratSusut.toFixed(0)} gram ({persenSusut.toFixed(2)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Berat Bersih:</span>
                      <span className="font-semibold text-gray-700">{beratBersih.toFixed(0)} gram</span>
                    </div>
                    <div className="pt-2 border-t border-blue-300 text-xs text-gray-600">
                      Stok yang tersedia untuk dijual: <span className="font-bold text-navy">{beratBersih.toFixed(0)} gram</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ongkos (Biaya Tambahan)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                    <input
                      type="number"
                      name="ongkosTotal"
                      value={formData.ongkosTotal}
                      onChange={handleChange}
                      placeholder="24343000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {formData.ongkosTotal && (
                    <>
                      <p className="text-xs text-gray-500 mt-1">≈ Rp {formatCurrency(formData.ongkosTotal)}</p>
                      <input
                        type="text"
                        name="keteranganOngkos"
                        value={formData.keteranganOngkos}
                        onChange={handleChange}
                        placeholder="Keterangan ongkos (misal: transport, pembersihan)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors mt-2"
                      />
                    </>
                  )}
                </div>

                {/* preview total modal */}
                {formData.hargaBeliPerGram && formData.beratKotorGram && formData.beratBersihGram && (
                  <div className="bg-yellow-50 border border-gray-300 rounded-md p-3 space-y-2 text-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Preview Total Modal</h4>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Harga Beli Total:</span>
                      <span className="font-semibold">Rp {formatCurrency(totalHargaBeli)}</span>
                    </div>
                    {ongkos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Ongkos:</span>
                        <span className="font-semibold text-orange-700">+ Rp {formatCurrency(ongkos)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-yellow-300">
                      <span className="text-gray-900 font-semibold">Total Modal:</span>
                      <span className="font-bold text-navy">Rp {formatCurrency(totalModalProduk)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Modal per Gram:</span>
                      <span className="font-semibold text-blue-700">Rp {formatCurrency(modalPerGram)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nama Supplier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="namaSupplier"
                    value={formData.namaSupplier}
                    onChange={handleChange}
                    placeholder="Pak Budi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Asal Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="asalProduk"
                    value={formData.asalProduk}
                    onChange={handleChange}
                    placeholder="Kalimantan Barat"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Keterangan <span className="text-gray-400 text-xs">(Opsional)</span>
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    placeholder=""
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none resize-none transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => navigate("/kelola-produk")}
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
                    <span>{loading ? "Menyimpan..." : "Simpan"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}