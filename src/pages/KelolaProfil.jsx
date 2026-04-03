import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, User, Camera, Save, KeyRound, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function KelolaProfil() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profil");

  const [profilForm, setProfilForm] = useState({
    nama: "",
    email: "",
    fotoProfil: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });

  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  const [loadingProfil, setLoadingProfil] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorProfil, setErrorProfil] = useState("");
  const [successProfil, setSuccessProfil] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [successPassword, setSuccessPassword] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    const fotoProfil = localStorage.getItem("fotoProfil") || null;
    setUser({ role, name, fotoProfil });
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const token = localStorage.getItem("token");
      // const res = await fetch("http://localhost:5000/api/users/profile", {
      const BASE_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const foto = data.data.fotoProfil || null;
        setProfilForm({
          nama: data.data.name || data.data.nama || "",
          email: data.data.email || "",
          fotoProfil: foto,
        });
       
        if (foto) {
          localStorage.setItem("fotoProfil", foto);
        } else {
          localStorage.removeItem("fotoProfil");
        }
      }
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    }
  };

  const kompressFoto = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");

          const MAX = 400;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
          } else {
            if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
          }

          canvas.width  = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorProfil("Format foto harus JPEG, PNG, atau WebP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorProfil("Ukuran foto maksimal 5MB");
      return;
    }

    try {
      const base64 = await kompressFoto(file);
      
      const base64Size = (base64.length * 3) / 4; 
      const base64SizeKB = base64Size / 1024;
      
      if (base64SizeKB > 500) {
        setErrorProfil(`Foto terlalu besar setelah kompresi (${base64SizeKB.toFixed(0)}KB). Maksimal 500KB. Gunakan foto dengan resolusi lebih kecil.`);
        return;
      }
      
      setProfilForm((prev) => ({ ...prev, fotoProfil: base64 }));
      setErrorProfil("");
    } catch (err) {
      setErrorProfil("Gagal memproses foto. Coba lagi.");
    }
  };

  const handleProfilChange = (e) => {
    setProfilForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorProfil) setErrorProfil("");
    if (successProfil) setSuccessProfil("");
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorPassword) setErrorPassword("");
    if (successPassword) setSuccessPassword("");
  };

  const handleSimpanProfil = async (e) => {
    e.preventDefault();
    setLoadingProfil(true);
    setErrorProfil("");
    setSuccessProfil("");

    if (!profilForm.nama.trim() || !profilForm.email.trim()) {
      setErrorProfil("Nama dan email wajib diisi");
      setLoadingProfil(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profilForm.email)) {
      setErrorProfil("Format email tidak valid");
      setLoadingProfil(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const BASE_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: profilForm.nama,
          email: profilForm.email,
          fotoProfil: profilForm.fotoProfil,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorProfil(data.message || "Gagal menyimpan profil");
        setLoadingProfil(false);
        return;
      }

      localStorage.setItem("userName", profilForm.nama);
      if (profilForm.fotoProfil) {
        localStorage.setItem("fotoProfil", profilForm.fotoProfil);
      } else {
        localStorage.removeItem("fotoProfil");
      }
      setUser((prev) => ({ ...prev, name: profilForm.nama, fotoProfil: profilForm.fotoProfil }));
      window.dispatchEvent(new Event("storage-profil-update"));
      setSuccessProfil("Profil berhasil diperbarui!");
    } catch (err) {
      setErrorProfil("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoadingProfil(false);
    }
  };

  const handleSimpanPassword = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    setErrorPassword("");
    setSuccessPassword("");

    if (!passwordForm.passwordLama || !passwordForm.passwordBaru || !passwordForm.konfirmasiPassword) {
      setErrorPassword("Semua field password wajib diisi");
      setLoadingPassword(false);
      return;
    }

    if (passwordForm.passwordBaru.length < 6) {
      setErrorPassword("Password baru minimal 6 karakter");
      setLoadingPassword(false);
      return;
    }

    if (passwordForm.passwordBaru !== passwordForm.konfirmasiPassword) {
      setErrorPassword("Konfirmasi password tidak cocok");
      setLoadingPassword(false);
      return;
    }

    // try {
    //   const token = localStorage.getItem("token");
    //   const res = await fetch("http://localhost:5000/api/users/change-password", {
        
    //     method: "PUT",
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       passwordLama: passwordForm.passwordLama,
    //       passwordBaru: passwordForm.passwordBaru,
    //     }),
    //   });

    try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/users/change-password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passwordLama: passwordForm.passwordLama,
        passwordBaru: passwordForm.passwordBaru,
      }),
    });

      const data = await res.json();
      if (!res.ok) {
        setErrorPassword(data.message || "Gagal mengubah password");
        setLoadingPassword(false);
        return;
      }

      setSuccessPassword("Password berhasil diubah!");
      setPasswordForm({ passwordLama: "", passwordBaru: "", konfirmasiPassword: "" });
    } catch (err) {
      setErrorPassword("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoadingPassword(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === "owner") return { label: "Owner", className: "bg-yellow-100 text-yellow-800" };
    if (role === "admin") return { label: "Admin", className: "bg-blue-100 text-blue-800" };
    return { label: role, className: "bg-gray-100 text-gray-700" };
  };

  const badge = getRoleBadge(user?.role);

  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      <Sidebar user={{ ...user, fotoProfil: profilForm.fotoProfil }} />

      <div className="flex-1 flex flex-col overflow-hidden">
    
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-navy">Kelola Profil</h1>
                <p className="text-[10px] text-gray-500">Perbarui informasi akun Anda</p>
              </div>
              <User className="w-5 h-5 text-navy hidden sm:block" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-4 py-5 space-y-4">

            <div className="bg-white rounded-lg shadow-sm p-5 flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {profilForm.fotoProfil ? (
                    <img src={profilForm.fotoProfil} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-navy">
                      <span className="text-3xl font-bold text-white">
                        {profilForm.nama ? profilForm.nama.charAt(0).toUpperCase() : "?"}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center shadow transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-navy" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-navy text-base">{profilForm.nama || "-"}</p>
                <p className="text-xs text-gray-500 mb-1">{profilForm.email || "-"}</p>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            <div className="flex bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <button
                onClick={() => setActiveTab("profil")}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "profil" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Info Profil
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "password" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Ubah Password
              </button>
            </div>

            {activeTab === "profil" && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <form onSubmit={handleSimpanProfil} className="space-y-4">

                  {errorProfil && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{errorProfil}</span>
                    </div>
                  )}
                  {successProfil && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{successProfil}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="nama" value={profilForm.nama} onChange={handleProfilChange}
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none transition-colors"
                      required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input type="email" name="email" value={profilForm.email} onChange={handleProfilChange}
                      placeholder="contoh@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none transition-colors"
                      required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                    <div className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed">
                      {badge.label}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Role tidak dapat diubah sendiri</p>
                  </div>

                  <div className="pt-2 border-t">
                    <button type="submit" disabled={loadingProfil}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                        loadingProfil ? "bg-gray-400 cursor-not-allowed text-white" : "bg-yellow-400 hover:bg-yellow-500 text-navy"
                      }`}>
                      <Save className="w-4 h-4" />
                      <span>{loadingProfil ? "Menyimpan..." : "Simpan Perubahan"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <form onSubmit={handleSimpanPassword} className="space-y-4">

                  {errorPassword && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{errorPassword}</span>
                    </div>
                  )}
                  {successPassword && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{successPassword}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password Lama <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input type={showPasswordLama ? "text" : "password"} name="passwordLama"
                        value={passwordForm.passwordLama} onChange={handlePasswordChange}
                        placeholder="Masukkan password lama"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none transition-colors"
                        required />
                      <button type="button" onClick={() => setShowPasswordLama(!showPasswordLama)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPasswordLama ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input type={showPasswordBaru ? "text" : "password"} name="passwordBaru"
                        value={passwordForm.passwordBaru} onChange={handlePasswordChange}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none transition-colors"
                        required />
                      <button type="button" onClick={() => setShowPasswordBaru(!showPasswordBaru)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPasswordBaru ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.passwordBaru && passwordForm.passwordBaru.length < 6 && (
                      <p className="text-xs text-red-500 mt-1">Password minimal 6 karakter</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Konfirmasi Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input type={showKonfirmasi ? "text" : "password"} name="konfirmasiPassword"
                        value={passwordForm.konfirmasiPassword} onChange={handlePasswordChange}
                        placeholder="Ulangi password baru"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy outline-none transition-colors"
                        required />
                      <button type="button" onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showKonfirmasi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.konfirmasiPassword && passwordForm.passwordBaru !== passwordForm.konfirmasiPassword && (
                      <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                    )}
                    {passwordForm.konfirmasiPassword && passwordForm.passwordBaru === passwordForm.konfirmasiPassword && passwordForm.passwordBaru.length >= 6 && (
                      <p className="text-xs text-green-600 mt-1">Password cocok ✓</p>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <button type="submit" disabled={loadingPassword}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                        loadingPassword ? "bg-gray-400 cursor-not-allowed text-white" : "bg-yellow-400 hover:bg-yellow-500 text-navy"
                      }`}>
                      <KeyRound className="w-4 h-4" />
                      <span>{loadingPassword ? "Menyimpan..." : "Ubah Password"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}