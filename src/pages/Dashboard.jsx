import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { 
  TrendingUp, Wallet, DollarSign, Boxes, 
  AlertCircle, Menu, X, BarChart3, PieChart as PieChartIcon
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalModalUsaha: 0, totalBeratBersih: 0, totalStokTersedia: 0, totalBeratSusut: 0,
    avgPersenSusut: 0, totalTransaksi: 0, modalTerpakai: 0, totalPenjualan: 0,
    totalLaba: 0, totalBeratTerjual: 0, modalSisa: 0, persenMargin: 0, persenTerjual: 0
  });
  const [chartData, setChartData] = useState({ salesPerDay: [], salesPerMonth: [], salesPerProduct: [], metodePembayaran: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [chartPeriod, setChartPeriod] = useState("daily");

  const CHART_COLORS = { navy: '#1e293b', yellow: '#eab308', teal: '#14b8a6', orange: '#f97316', green: '#10b981', cyan: '#06b6d4', pink: '#ec4899', indigo: '#6366f1' };

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");
    setUser({ role: userRole, name: userName, fotoProfil: localStorage.getItem("fotoProfil") });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(""); 
    const BASE_URL = import.meta.env.VITE_API_URL;
    try {
      const token = localStorage.getItem("token");
      const [productRes, transactionRes] = await Promise.all([
        fetch(`${BASE_URL}/api/products/stats/summary`, { headers: { Authorization: `Bearer ${token}` }}),
        fetch(`${BASE_URL}/api/transactions/stats/summary`, { headers: { Authorization: `Bearer ${token}` }})
      ]);

      if (!productRes.ok || !transactionRes.ok) {
        setError("Gagal mengambil data statistik dari server"); 
        setLoading(false);
        return;
      }

      const productData = await productRes.json();
      const transactionData = await transactionRes.json();

      const totalModalUsaha = productData?.data?.berat?.totalModalProduk ?? 0;
      const modalTerpakai = transactionData?.data?.financial?.totalModalTransaksi ?? 0;
      const totalPenjualan = transactionData?.data?.financial?.totalHargaJual ?? 0;
      const totalLaba = transactionData?.data?.financial?.totalLaba ?? 0;
      const totalBeratBersih = productData?.data?.berat?.totalBeratBersih ?? 0;
      const totalBeratTerjual = transactionData?.data?.financial?.totalBeratTerjual ?? 0;

      setStats({
        totalModalUsaha, totalBeratBersih,
        totalStokTersedia: productData?.data?.berat?.totalStokTersedia ?? 0,
        totalBeratSusut: productData?.data?.berat?.totalBeratSusut ?? 0,
        avgPersenSusut: productData?.data?.berat?.avgPersenSusut ?? 0,
        totalTransaksi: transactionData?.data?.totalTransactions ?? 0,
        modalTerpakai, totalPenjualan, totalLaba, totalBeratTerjual,
        modalSisa: totalModalUsaha - modalTerpakai,
        persenMargin: totalPenjualan > 0 ? (totalLaba / totalPenjualan) * 100 : 0,
        persenTerjual: totalBeratBersih > 0 ? (totalBeratTerjual / totalBeratBersih) * 100 : 0
      });

      setChartData({
        salesPerDay: (transactionData?.data?.salesPerDay || []).reverse().map(item => ({
          tanggal: new Date(item._id).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          penjualan: item.totalPenjualan, laba: item.totalLaba, modal: item.totalModal
        })),
        salesPerMonth: (transactionData?.data?.salesPerMonth || []).reverse().map(item => ({
          bulan: new Date(item._id + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
          penjualan: item.totalPenjualan, laba: item.totalLaba, modal: item.totalModal
        })),
        salesPerProduct: (transactionData?.data?.salesPerProduct || []).map(item => ({
          jenis: item._id, total: item.totalHargaJual, berat: item.totalBeratTerjual
        })),
        metodePembayaran: (transactionData?.data?.metodePembayaran || []).map(item => ({
          metode: item._id, total: item.totalNilai
        }))
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda."); 
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  const formatNumber = (num) => (num === null || num === undefined || isNaN(num)) ? "0" : Number(num).toFixed(0);
  const formatPercent = (num) => (num === null || num === undefined || isNaN(num)) ? "0.0" : Number(num).toFixed(1);

  const renderLineChart = (data, height = 240) => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={chartPeriod === "daily" ? "tanggal" : "bulan"} style={{ fontSize: '11px' }} tick={{ fill: '#6b7280' }} />
        <YAxis style={{ fontSize: '11px' }} tick={{ fill: '#6b7280' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="line" />
        <Line type="monotone" dataKey="penjualan" stroke={CHART_COLORS.navy} strokeWidth={2.5} dot={{ fill: CHART_COLORS.navy, r: 3 }} activeDot={{ r: 5 }} name="Total Penjualan" />
        <Line type="monotone" dataKey="laba" stroke={CHART_COLORS.yellow} strokeWidth={2.5} dot={{ fill: CHART_COLORS.yellow, r: 3 }} activeDot={{ r: 5 }} name="Total Laba" />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex-shrink-0 md:hidden" />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-navy">Dashboard</h2>
                <p className="text-[10px] text-gray-500">Selamat datang, {user?.name}!</p>
              </div>
              <div className="hidden md:block text-[10px] text-gray-500 flex-shrink-0">
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Memuat dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 text-sm">Gagal Memuat Data</h3>
                      <p className="text-xs text-red-700 mt-1">{error}</p>
                      <button
                        onClick={fetchDashboardData}
                        className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                </div>
              )}


              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-navy/10 rounded-lg">
                      <Wallet className="w-4 h-4 text-navy" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mb-0.5">Total Modal Usaha</p>
                  <p className="text-xl font-bold text-gray-900 mb-0.5">{formatCurrency(stats.totalModalUsaha)}</p>
                  <p className="text-[9px] text-gray-500">Modal pembelian produk</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-navy/10 rounded-lg">
                      <DollarSign className="w-4 h-4 text-navy" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mb-0.5">Modal Terpakai</p>
                  <p className="text-xl font-bold text-gray-900 mb-0.5">{formatCurrency(stats.modalTerpakai)}</p>
                  <p className="text-[9px] text-gray-500">{stats.totalModalUsaha > 0 ? `${formatPercent((stats.modalTerpakai / stats.totalModalUsaha) * 100)}% dari total` : 'Belum ada transaksi'}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-navy/10 rounded-lg">
                      <Boxes className="w-4 h-4 text-navy" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mb-0.5">Stok Tersedia</p>
                  <p className="text-xl font-bold text-gray-900 mb-0.5">{formatNumber(stats.totalStokTersedia)} gram</p>
                  <p className="text-[9px] text-gray-500">Stok produk siap jual</p>
                </div>

                <div className="bg-navy text-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-[10px] opacity-90 mb-0.5">Total Laba</p>
                  <p className="text-xl font-bold mb-0.5">{formatCurrency(stats.totalLaba)}</p>
                  <p className="text-[9px] opacity-75">Margin {formatPercent(stats.persenMargin)}% • {stats.totalTransaksi} transaksi</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-navy" />
                      <h3 className="font-semibold text-navy">Tren Penjualan</h3>
                    </div>
                    <select value={chartPeriod} onChange={(e) => setChartPeriod(e.target.value)} className="text-xs border rounded px-2 py-1 focus:ring-2 focus:ring-navy outline-none">
                      <option value="daily">Harian</option>
                      <option value="monthly">Bulanan</option>
                    </select>
                  </div>
                  {chartPeriod === "daily" && chartData.salesPerDay.length > 0 ? renderLineChart(chartData.salesPerDay)
                    : chartPeriod === "monthly" && chartData.salesPerMonth.length > 0 ? renderLineChart(chartData.salesPerMonth)
                    : <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm"><div className="text-center"><BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>Belum ada data transaksi</p></div></div>
                  }
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-navy" />
                    <h3 className="font-semibold text-navy">Penjualan per Produk</h3>
                  </div>
                  {chartData.salesPerProduct.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={chartData.salesPerProduct} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="jenis" style={{ fontSize: '11px' }} tick={{ fill: '#6b7280' }} />
                        <YAxis style={{ fontSize: '11px' }} tick={{ fill: '#6b7280' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="total" fill={CHART_COLORS.navy} name="Total Penjualan" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm"><div className="text-center"><BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>Belum ada data penjualan</p></div></div>}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChartIcon className="w-5 h-5 text-navy" />
                    <h3 className="font-semibold text-navy">Metode Pembayaran</h3>
                  </div>
                  {chartData.metodePembayaran.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={chartData.metodePembayaran} dataKey="total" nameKey="metode" cx="50%" cy="50%" outerRadius={75} label={({ metode, percent }) => `${metode} ${(percent * 100).toFixed(0)}%`} labelStyle={{ fontSize: '11px', fontWeight: '600' }}>
                          {chartData.metodePembayaran.map((entry, index) => {
                            const colors = [CHART_COLORS.navy, CHART_COLORS.yellow, CHART_COLORS.teal, CHART_COLORS.orange];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm"><div className="text-center"><PieChartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>Belum ada data pembayaran</p></div></div>}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-navy" />
                    <h3 className="font-semibold text-navy">Statistik Produk</h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Total Berat Bersih',   value: `${formatNumber(stats.totalBeratBersih)} gram` },
                      { label: 'Berat Terjual',         value: `${formatNumber(stats.totalBeratTerjual)} gram` },
                      { label: 'Stok Tersedia',         value: `${formatNumber(stats.totalStokTersedia)} gram` },
                      { label: 'Persentase Terjual',    value: `${formatPercent(stats.persenTerjual)}%` },
                      { label: 'Rata-rata Susut',       value: `${formatPercent(stats.avgPersenSusut)}%` }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <span className="text-sm font-bold text-navy">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}