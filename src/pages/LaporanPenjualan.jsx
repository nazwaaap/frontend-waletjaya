import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, FileText, Image as ImageIcon, X, AlertCircle } from "lucide-react";

const hitungRange = (mode) => {
  const now = new Date();
  let start, end;
  if (mode === "harian") {
    start = new Date(now); start.setHours(0,0,0,0);
    end = new Date(now); end.setHours(23,59,59,999);
  } else if (mode === "mingguan") {
    const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
    start = new Date(now); start.setDate(now.getDate() + diff); start.setHours(0,0,0,0);
    end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  
  const formatLocal = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  
  return { start: formatLocal(start), end: formatLocal(end) };
};

const fmt = {
  currency: (n) => new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR", minimumFractionDigits: 0}).format(n || 0),
  dateLong: (d) => new Date(d).toLocaleDateString("id-ID", {day: "2-digit", month: "long", year: "numeric"}),
  dateShort: (d) => new Date(d).toLocaleDateString("id-ID", {day: "2-digit", month: "short", year: "numeric"}),
  dateNum: (d) => new Date(d).toLocaleDateString("id-ID", {day: "2-digit", month: "2-digit", year: "numeric"})
};

const addPDFHeader = (doc, W, periodLabel) => {
  doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text("LAPORAN PENJUALAN", W / 2, 14, { align: "center" });
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text("Walet Jaya", W / 2, 20, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Periode: ${periodLabel}`, W / 2, 26, { align: "center" });
  doc.text(`Dicetak: ${fmt.dateLong(new Date())}`, W / 2, 31, { align: "center" });
  doc.setLineWidth(0.4); doc.line(10, 34, W - 10, 34);
};

const addPDFSummary = (doc, W, summary) => {
  let y = 39;
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("Ringkasan:", 10, y); y += 5;
  const items = [
    ["Jumlah Transaksi", (summary.jumlahTransaksi||0) + " transaksi"],
    ["Total Berat Terjual", (summary.totalBerat||0).toFixed(0) + " gram"],
    ["Total Modal", fmt.currency(summary.totalModal)],
    ["Total Penjualan", fmt.currency(summary.totalPenjualan)],
    ["Total Laba", fmt.currency(summary.totalLaba)],
    ["Rata-rata Margin", (summary.avgMargin||0).toFixed(1) + "%"],
  ];
  const hw = (W - 20) / 2;
  items.forEach(([lbl, val], i) => {
    const x = 10 + (i % 2) * hw, yy = y + Math.floor(i / 2) * 5;
    doc.setFont("helvetica", "normal"); doc.text(lbl + ":", x, yy);
    doc.setFont("helvetica", "bold"); doc.text(val, x + 52, yy);
  });
  y += Math.ceil(items.length / 2) * 5 + 3;
  doc.setDrawColor(180); doc.setLineWidth(0.2); doc.line(10, y, W - 10, y);
  return y + 4;
};

const addFotoNotaSection = (doc, W, transaksiDenganFoto) => {
  doc.addPage();
  let currentY = 15;
  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(0, 0, 0);
  doc.text("LAMPIRAN: FOTO NOTA TRANSAKSI", W / 2, currentY, { align: "center" });
  doc.setLineWidth(0.3); doc.setDrawColor(0, 0, 0);
  doc.line(10, currentY + 2, W - 10, currentY + 2);
  currentY += 12;
  
  transaksiDenganFoto.forEach((tx, i) => {
    if (currentY > doc.internal.pageSize.getHeight() - 100) { doc.addPage(); currentY = 15; }
    doc.setFillColor(255, 255, 255); doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3);
    doc.rect(10, currentY, W - 20, 10, 'FD');
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(0, 0, 0);
    doc.text(`No. Transaksi: ${tx.nomorTransaksi}`, 12, currentY + 6.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Pembeli: ${tx.namaPembeli}`, 80, currentY + 6.5);
    doc.text(`Tanggal: ${fmt.dateNum(tx.tanggalTransaksi)}`, W - 50, currentY + 6.5);
    currentY += 14;
    doc.setFontSize(8);
    const infoLeft = 12;
    doc.text(`Produk: ${tx.jenisProduk || tx.productSnapshot?.jenis || "-"}`, infoLeft, currentY);
    doc.text(`Berat: ${tx.beratTerjualGram} gram`, infoLeft + 70, currentY);
    doc.text(`Harga/gram: ${fmt.currency(tx.hargaJualPerGram)}`, infoLeft + 120, currentY);
    currentY += 5; doc.setFont("helvetica", "bold");
    doc.text(`Total: ${fmt.currency(tx.totalHargaJual)}`, infoLeft, currentY);
    currentY += 8;
    try {
      const imgW = 120, imgH = 75, imgX = (W - imgW) / 2, imgY = currentY;
      doc.setFillColor(255, 255, 255); doc.rect(imgX, imgY, imgW, imgH, 'F');
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.3); doc.rect(imgX, imgY, imgW, imgH);
      doc.addImage(tx.fotoNota, 'JPEG', imgX + 1, imgY + 1, imgW - 2, imgH - 2);
      currentY += imgH + 3;
      doc.setFont("helvetica", "italic"); doc.setFontSize(7);
      doc.text(`Gambar ${i + 1}: Nota transaksi ${tx.nomorTransaksi}`, W / 2, currentY, { align: "center" });
      currentY += 10;
    } catch (error) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(8);
      doc.text('[Foto nota gagal dimuat]', W / 2, currentY, { align: "center" });
      currentY += 15;
    }
    if (i < transaksiDenganFoto.length - 1) {
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.2);
      doc.line(15, currentY, W - 15, currentY); currentY += 8;
    }
  });
};

export default function LaporanPenjualan() {
  const navigate = useNavigate();
  const defRange = hitungRange("bulanan");
  const [startDate, setStartDate] = useState(defRange.start);
  const [endDate, setEndDate] = useState(defRange.end);
  const [activeMode, setActiveMode] = useState("bulanan");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterMetode, setFilterMetode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedNota, setExpandedNota] = useState(null);
  const [data, setData] = useState({
    summary: { totalPenjualan:0, totalModal:0, totalLaba:0, totalBerat:0, jumlahTransaksi:0, avgMargin:0 },
    transaksi: [], perProduk: []
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "owner" && role !== "admin") navigate("/dashboard");
  }, [navigate]);

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:5000/api/laporan/laporan?startDate=${startDate}&endDate=${endDate}&_t=${Date.now()}`;
      if (filterJenis) url += `&jenisProduk=${encodeURIComponent(filterJenis)}`;
      if (filterMetode) url += `&metodePembayaran=${encodeURIComponent(filterMetode)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-cache' });
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
      } else {
        setError(json.message || "Gagal memuat data laporan");
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filterJenis, filterMetode]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLaporan();
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [startDate, endDate, filterJenis, filterMetode, fetchLaporan]);

  useEffect(() => {
    const handleTransaksiUpdate = () => { if (startDate && endDate) fetchLaporan(); };
    window.addEventListener('transaksiUpdated', handleTransaksiUpdate);
    return () => window.removeEventListener('transaksiUpdated', handleTransaksiUpdate);
  }, [startDate, endDate, fetchLaporan]);

  const pilihMode = (mode) => {
    const { start, end } = hitungRange(mode);
    setActiveMode(mode); setStartDate(start); setEndDate(end);
  };

  const periodLabel = () => {
    if (!startDate || !endDate) return "";
    if (startDate === endDate) return fmt.dateLong(startDate);
    return `${fmt.dateLong(startDate)} s/d ${fmt.dateLong(endDate)}`;
  };

  const handleExportPDF = async () => {
    if (!data.transaksi.length) return;
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const { summary, transaksi, perProduk } = data;
    const isDaily = startDate === endDate;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    addPDFHeader(doc, W, periodLabel());
    let y = addPDFSummary(doc, W, summary);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("Detail Transaksi", 10, y); y += 2;
    
    autoTable(doc, {
      startY: y,
      head: [["No","Tanggal","No. Transaksi","Pembeli","Produk","Berat (g)","Harga/g","Total Modal","Total Jual","Laba","Margin","Metode"]],
      body: transaksi.map((tx, i) => [
        i+1, fmt.dateNum(tx.tanggalTransaksi), tx.nomorTransaksi, tx.namaPembeli,
        tx.jenisProduk||tx.productSnapshot?.jenis||"-", tx.beratTerjualGram,
        fmt.currency(tx.hargaJualPerGram), fmt.currency(tx.totalModalTransaksi), 
        fmt.currency(tx.totalHargaJual), fmt.currency(tx.totalLaba), 
        (tx.persenLaba||0).toFixed(1)+"%", tx.metodePembayaran
      ]),
      foot: [["","","","","","","TOTAL", fmt.currency(summary.totalModal), fmt.currency(summary.totalPenjualan),
        fmt.currency(summary.totalLaba), (summary.avgMargin||0).toFixed(1)+"%", ""]],
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1.5, textColor: [0,0,0] },
      headStyles: { fillColor: [255,255,255], textColor: [0,0,0], fontStyle: "bold", halign: "center", fontSize: 7, lineWidth: 0.1, lineColor: [200,200,200] },
      footStyles: { fillColor: [255,255,255], textColor: [0,0,0], fontStyle: "bold", fontSize: 7, lineWidth: 0.1, lineColor: [200,200,200] },
      alternateRowStyles: { fillColor: [255,255,255] },
      columnStyles: {
        0:{halign:"center",cellWidth:7}, 1:{cellWidth:18}, 2:{cellWidth:26}, 3:{cellWidth:28}, 4:{cellWidth:20}, 
        5:{halign:"right",cellWidth:14}, 6:{halign:"right",cellWidth:20}, 7:{halign:"right",cellWidth:26},
        8:{halign:"right",cellWidth:26}, 9:{halign:"right",cellWidth:26}, 10:{halign:"center",cellWidth:13}, 11:{halign:"center",cellWidth:17}
      }
    });

    if (perProduk.length > 0) {
      const fy = doc.lastAutoTable.finalY + 6;
      doc.setFont("helvetica","bold"); doc.setFontSize(9);
      doc.text("Ringkasan per Produk", 10, fy);
      autoTable(doc, {
        startY: fy + 3,
        head: [["Produk","Jml Transaksi","Total Berat (g)","Total Modal","Total Penjualan","Total Laba"]],
        body: perProduk.map(p => [p._id||"-", p.jumlahTransaksi, (p.totalBerat||0).toFixed(0),
          fmt.currency(p.totalModal), fmt.currency(p.totalPenjualan), fmt.currency(p.totalLaba)]),
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 1.5, textColor: [0,0,0] },
        headStyles: { fillColor: [255,255,255], textColor: [0,0,0], fontStyle: "bold", fontSize: 7, lineWidth: 0.1, lineColor: [200,200,200] },
        columnStyles: { 1:{halign:"center"}, 2:{halign:"right"}, 3:{halign:"right"}, 4:{halign:"right"}, 5:{halign:"right"} }
      });
    }

    if (isDaily && transaksi.filter(tx => tx.fotoNota).length > 0) {
      addFotoNotaSection(doc, W, transaksi.filter(tx => tx.fotoNota));
    }

    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i); doc.setFontSize(7); doc.setTextColor(150);
      doc.text(`Halaman ${i} dari ${total}`, W/2, doc.internal.pageSize.getHeight()-5, { align: "center" });
    }
    doc.save(`Laporan-Penjualan-${startDate}-sd-${endDate}.pdf`);
  };

  const handleExportExcel = async () => {
    if (!data.transaksi.length) return;
    const XLSX = await import("xlsx");
    const { summary, transaksi, perProduk } = data;
    const wsDetail = [
      ["LAPORAN PENJUALAN — WALET JAYA"], [`Periode: ${periodLabel()}`], [`Dicetak: ${fmt.dateLong(new Date())}`], [],
      ["Jumlah Transaksi", summary.jumlahTransaksi], ["Total Berat (gram)", summary.totalBerat],
      ["Total Modal", summary.totalModal], ["Total Penjualan", summary.totalPenjualan],
      ["Total Laba", summary.totalLaba], ["Avg. Margin (%)", summary.avgMargin], [],
      ["No","Tanggal","No. Transaksi","Nama Pembeli","Kontak","Produk","Berat (g)","Harga Jual/g","Modal/g","Total Modal","Total Penjualan","Total Laba","Margin (%)","Metode"],
      ...transaksi.map((tx, i) => [i+1, fmt.dateNum(tx.tanggalTransaksi), tx.nomorTransaksi, tx.namaPembeli,
        tx.kontakPembeli||"", tx.jenisProduk||tx.productSnapshot?.jenis||"-", tx.beratTerjualGram, 
        tx.hargaJualPerGram, tx.modalPerGramTransaksi, tx.totalModalTransaksi, tx.totalHargaJual, 
        tx.totalLaba, tx.persenLaba, tx.metodePembayaran]), [],
      ["","","","","","","","","TOTAL", summary.totalModal, summary.totalPenjualan, summary.totalLaba, summary.avgMargin, ""]
    ];
    const wsProduk = [["RINGKASAN PER PRODUK"], [],
      ["Produk","Jumlah Transaksi","Total Berat (g)","Total Modal","Total Penjualan","Total Laba"],
      ...perProduk.map(p => [p._id, p.jumlahTransaksi, p.totalBerat, p.totalModal, p.totalPenjualan, p.totalLaba])
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsDetail), "Detail Transaksi");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsProduk), "Per Produk");
    XLSX.writeFile(wb, `Laporan-Penjualan-${startDate}-sd-${endDate}.xlsx`);
  };

  const { summary, transaksi, perProduk } = data;

  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-navy">Laporan Penjualan</h1>
                <p className="text-[10px] text-gray-500 truncate">{periodLabel()}</p>
              </div>
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
                      onClick={fetchLaporan}
                      className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-2 space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                <span className="text-gray-500 font-medium">Periode:</span>
                {["harian", "mingguan", "bulanan"].map(key => (
                  <button key={key} onClick={() => pilihMode(key)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                      activeMode === key ? "bg-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {key === "harian" ? "Hari Ini" : key === "mingguan" ? "Minggu Ini" : "Bulan Ini"}
                  </button>
                ))}
                <button onClick={() => { const r = hitungRange("bulanan"); setActiveMode("bulanan"); setStartDate(r.start); setEndDate(r.end); setFilterJenis(""); setFilterMetode(""); }} disabled={loading}
                  className="ml-auto px-2 py-1 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600 disabled:opacity-50">
                  {loading ? "..." : "Perbarui"}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                <div>
                  <label className="text-[9px] text-gray-600 block mb-0.5">Dari</label>
                  <input type="date" value={startDate}
                    onChange={e => { setActiveMode("custom"); setStartDate(e.target.value);
                      if (endDate && e.target.value > endDate) setEndDate(e.target.value); }}
                    className="w-full px-1.5 py-1 border rounded text-[10px] focus:ring-1 focus:ring-navy outline-none" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-600 block mb-0.5">Sampai</label>
                  <input type="date" value={endDate}
                    onChange={e => { setActiveMode("custom"); setEndDate(e.target.value);
                      if (startDate && e.target.value < startDate) setStartDate(e.target.value); }}
                    className="w-full px-1.5 py-1 border rounded text-[10px] focus:ring-1 focus:ring-navy outline-none" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-600 block mb-0.5">Produk</label>
                  <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}
                    className="w-full px-1.5 py-1 border rounded text-[10px] focus:ring-1 focus:ring-navy outline-none">
                    <option value="">Semua</option>
                    {["Mangkok Original", "Patahan", "Segitiga", "Strip", "Merah"].map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-gray-600 block mb-0.5">Metode</label>
                  <select value={filterMetode} onChange={e => setFilterMetode(e.target.value)}
                    className="w-full px-1.5 py-1 border rounded text-[10px] focus:ring-1 focus:ring-navy outline-none">
                    <option value="">Semua</option>
                    {["Tunai", "Transfer Bank", "E-Wallet", "Kredit"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm py-12 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy mx-auto mb-2" />
                <p className="text-[10px] text-gray-400">Memuat...</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b bg-gray-50">
                    <div>
                      <h3 className="font-semibold text-navy text-[11px]">Detail Transaksi</h3>
                      <p className="text-[9px] text-gray-400">{transaksi.length} transaksi</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={handleExportExcel} disabled={!transaksi.length}
                        className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-medium hover:bg-green-100 disabled:opacity-40">
                        Excel
                      </button>
                      <button onClick={handleExportPDF} disabled={!transaksi.length}
                        className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[9px] font-medium hover:bg-red-100 disabled:opacity-40">
                        PDF
                      </button>
                    </div>
                  </div>

                  {transaksi.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-[10px]">Tidak ada transaksi</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="min-w-[1000px]">
                        <table className="w-full text-[11px]">
                        <thead>
                          <tr className="bg-navy text-white">
                            <th className="px-2 py-2 text-center" style={{width: "3%"}}>No</th>
                            <th className="px-2 py-2 text-left" style={{width: "7%"}}>Tanggal</th>
                            <th className="px-2 py-2 text-left" style={{width: "10%"}}>No. Transaksi</th>
                            <th className="px-2 py-2 text-left" style={{width: "11%"}}>Pembeli</th>
                            <th className="px-2 py-2 text-left" style={{width: "8%"}}>Produk</th>
                            <th className="px-2 py-2 text-right" style={{width: "5%"}}>Berat</th>
                            <th className="px-2 py-2 text-right" style={{width: "10%"}}>Modal</th>
                            <th className="px-2 py-2 text-right" style={{width: "10%"}}>Jual</th>
                            <th className="px-2 py-2 text-right" style={{width: "9%"}}>Laba</th>
                            <th className="px-2 py-2 text-center" style={{width: "3%"}}>%</th>
                            <th className="px-2 py-2 text-center" style={{width: "7%"}}>Metode</th>
                            <th className="px-2 py-2 text-center" style={{width: "3%"}}>Nota</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {transaksi.map((tx, i) => (
                            <tr key={tx._id} className={i % 2 !== 0 ? "bg-gray-50" : "bg-white"}>
                              <td className="px-2 py-2 text-center text-gray-400">{i + 1}</td>
                              <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{fmt.dateShort(tx.tanggalTransaksi)}</td>
                              <td className="px-2 py-2">
                                <span className="font-mono text-[10px] text-gray-600">{tx.nomorTransaksi}</span>
                              </td>
                              <td className="px-2 py-2">
                                <div className="font-medium text-gray-800 truncate">{tx.namaPembeli}</div>
                                {tx.kontakPembeli && <div className="text-[10px] text-gray-400 truncate">{tx.kontakPembeli}</div>}
                              </td>
                              <td className="px-2 py-2 text-gray-700 truncate">{tx.jenisProduk || tx.productSnapshot?.jenis || "-"}</td>
                              <td className="px-2 py-2 text-right font-medium text-gray-800">{tx.beratTerjualGram}g</td>
                              <td className="px-2 py-2 text-right text-gray-800 font-medium">{fmt.currency(tx.totalModalTransaksi)}</td>
                              <td className="px-2 py-2 text-right text-gray-800 font-medium">{fmt.currency(tx.totalHargaJual)}</td>
                              <td className="px-2 py-2 text-right text-gray-800 font-medium">{fmt.currency(tx.totalLaba)}</td>
                              <td className="px-2 py-2 text-center text-gray-600">{(tx.persenLaba||0).toFixed(0)}%</td>
                              <td className="px-2 py-2 text-center text-gray-600">{tx.metodePembayaran}</td>
                              <td className="px-2 py-2 text-center">
                                {tx.fotoNota ? (
                                  <button onClick={() => setExpandedNota(tx._id)}
                                    className="p-1 hover:bg-blue-50 rounded" title="Lihat">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                  </button>
                                ) : <span className="text-gray-300">-</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 font-bold text-gray-700 border-t-2">
                            <td colSpan={6} className="px-2 py-2 text-right">TOTAL</td>
                            <td className="px-2 py-2 text-right">{fmt.currency(summary.totalModal)}</td>
                            <td className="px-2 py-2 text-right">{fmt.currency(summary.totalPenjualan)}</td>
                            <td className="px-2 py-2 text-right">{fmt.currency(summary.totalLaba)}</td>
                            <td className="px-2 py-2 text-center">{(summary.avgMargin||0).toFixed(0)}%</td>
                            <td colSpan={2} />
                          </tr>
                        </tfoot>
                      </table>
                      </div>
                    </div>
                  )}
                </div>

                {perProduk.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-2 py-1.5 border-b bg-gray-50">
                      <h3 className="font-semibold text-navy text-[11px]">Per Produk</h3>
                    </div>
                    <table className="w-full text-[9px]">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 font-semibold border-b">
                          <th className="px-2 py-1.5 text-center">Produk</th>
                          <th className="px-2 py-1.5 text-center">Jml</th>
                          <th className="px-2 py-1.5 text-center">Berat</th>
                          <th className="px-2 py-1.5 text-center">Modal</th>
                          <th className="px-2 py-1.5 text-center">Jual</th>
                          <th className="px-2 py-1.5 text-center">Laba</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {perProduk.map((p, i) => (
                          <tr key={i} className={i % 2 !== 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="px-2 py-1.5 font-medium text-center">{p._id || "-"}</td>
                            <td className="px-2 py-1.5 text-center">{p.jumlahTransaksi}</td>
                            <td className="px-2 py-1.5 text-center">{(p.totalBerat||0).toFixed(0)}g</td>
                            <td className="px-2 py-1.5 text-center">{fmt.currency(p.totalModal)}</td>
                            <td className="px-2 py-1.5 text-center font-semibold">{fmt.currency(p.totalPenjualan)}</td>
                            <td className="px-2 py-1.5 text-center font-bold">{fmt.currency(p.totalLaba)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {expandedNota && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedNota(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden">
            <button onClick={() => setExpandedNota(null)}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg z-10 transition-colors">
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <div className="p-4">
              {(() => {
                const tx = transaksi.find(t => t._id === expandedNota);
                return tx?.fotoNota ? (
                  <img src={tx.fotoNota} alt="Foto Nota" className="w-full h-auto rounded-lg"
                    onClick={(e) => e.stopPropagation()} />
                ) : (
                  <p className="text-center text-gray-500">Foto tidak tersedia</p>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}