import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MasukAkun() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("isAuthenticated", "true");

      navigate("/dashboard");
    } catch (err) {
      setError("Backend tidak bisa diakses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-poppins">
      <style>{`@keyframes slideIn{0%{opacity:0;transform:translateY(-20px)}100%{opacity:1;transform:translateY(0)}}.slide-in{animation:slideIn .8s ease-out forwards}`}</style>
      
      {/* section kiri */}
      <div className="hidden lg:flex items-center justify-center bg-navy text-white p-8">
        <div className="max-w-md text-center">
          <svg className="mx-auto mb-6" width="160" height="120" viewBox="0 0 160 120" fill="none">
            <ellipse cx="80" cy="60" rx="28" ry="35" fill="white" opacity=".9"/>
            <circle cx="80" cy="42" r="16" fill="white" opacity=".95"/>
            <circle cx="83" cy="40" r="2.5" fill="#0F172A"/>
            <path d="M92 42L98 41L92 45Z" fill="#FFA500"/>
            <path d="M58 58Q43 47 40 62Q43 66 58 66Z" fill="white" opacity=".85"/>
            <path d="M102 58Q117 47 120 62Q117 66 102 66Z" fill="white" opacity=".85"/>
            <path d="M77 88L70 102L80 92L90 102L83 88Z" fill="white" opacity=".8"/>
            <ellipse cx="80" cy="110" rx="45" ry="8" fill="white" opacity=".2"/>
            <path d="M45 106Q58 100 80 103Q102 100 115 106" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".6"/>
          </svg>
          <h2 className="text-3xl font-bold mb-2 slide-in">Halo! Selamat Datang</h2>
          <h1 className="text-2xl font-semibold mb-4 slide-in" style={{animationDelay:'.2s'}}>di Walet Jaya</h1>
          <p className="text-sm text-white/80 leading-relaxed slide-in" style={{animationDelay:'.4s'}}>
            Sistem manajemen penjualan terpadu untuk pengelolaan penjualan sarang burung walet yang terarah, efisien, dan terkendali.
          </p>
          <div className="mt-6 flex justify-center gap-2 slide-in" style={{animationDelay:'.6s'}}>
            <div className="w-2 h-2 bg-white/30 rounded-full"/>
            <div className="w-2 h-2 bg-white/50 rounded-full"/>
            <div className="w-2 h-2 bg-white/30 rounded-full"/>
          </div>
        </div>
      </div>

      {/* section kanan */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-semibold text-navy mb-1">Walet Jaya</h1>
            <p className="text-xs text-gray-500">Sistem Manajemen Penjualan</p>
          </div>

          <h2 className="text-2xl font-semibold text-navy mb-2 text-center">Masuk Akun</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Sistem Manajemen Penjualan Sarang Burung Walet</p>

          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none" 
                placeholder="email@waletjaya.com" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-navy focus:border-navy outline-none" 
                  placeholder="••••••••" 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-2.5 rounded-lg text-white text-sm font-medium transition ${loading?"bg-gray-400 cursor-not-allowed":"bg-navy hover:bg-navySoft"}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Memproses...
                  </span>
                ) : "Masuk"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">© 2026 Walet Jaya. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}