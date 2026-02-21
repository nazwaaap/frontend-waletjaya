import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, AlertTriangle, Trash2 } from "lucide-react";

export default function HapusPengguna() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const currentUser = {
    role: localStorage.getItem("userRole"),
    name: localStorage.getItem("userName"),
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.data);
        if (data.data.role === "owner") {
          setError("Akun Owner tidak dapat dihapus untuk menjaga keamanan sistem!");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Gagal memuat data pengguna");
    } finally {
      setLoadingData(false);
    }
  };

  const handleHapus = async () => {
    if (user.role === "owner") return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal menghapus pengguna");
        setLoading(false);
        return;
      }

      alert(`Pengguna "${user.fullName || user.name}" berhasil dihapus!`);
      navigate("/kelola-pengguna");
    } catch (err) {
      setError("Backend tidak dapat diakses");
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-screen bg-gray-50 font-poppins">
        <Sidebar user={currentUser} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50 font-poppins">
        <Sidebar user={currentUser} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Pengguna tidak ditemukan</p>
            <button
              onClick={() => navigate("/kelola-pengguna")}
              className="px-4 py-2 bg-navy text-white rounded-md hover:bg-navySoft text-sm transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      <Sidebar user={currentUser} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/kelola-pengguna")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-navy">Hapus Pengguna</h1>
                <p className="text-[10px] text-gray-500">Konfirmasi penghapusan data pengguna walet jaya</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-500 hidden sm:block" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <div className="bg-white rounded-lg shadow-sm p-5 sm:p-7">

              <div className="flex justify-center mb-2">
                <AlertTriangle className="w-20 h-20 sm:w-24 sm:h-24 text-red-600" />
              </div>

              <div className="text-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  Yakin ingin menghapus pengguna ini?
                </h3>
                <p className="text-sm text-red-600">
                  Data yang dihapus tidak dapat dikembalikan
                </p>
              </div>

              {/* user info*/}
              <div className="flex flex-col items-center mb-3">
                <div className="w-16 h-16 sm:w-10 sm:h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-lg sm:text-xl mb-2">
                  {(user.fullName || user.name || "?").charAt(0).toUpperCase()}
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 text-center">
                  {user.fullName || user.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 text-center truncate max-w-full px-4">
                  {user.email || "-"}
                </p>
                <span
                  className={`inline-block mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                    user.role === "owner"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role === "owner" ? "Owner" : "Admin"}
                </span>
              </div>

              {error && (
                <div className="mb-3 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-md text-xs sm:text-sm text-red-600 text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/kelola-pengguna")}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleHapus}
                  disabled={loading || user.role === "owner"}
                  className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
                    loading || user.role === "owner"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{loading ? "Menghapus..." : "Hapus"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}