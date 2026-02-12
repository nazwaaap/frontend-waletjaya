import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, ArrowLeft, Users as UsersIcon, ShieldAlert } from "lucide-react";

export default function KelolaPengguna() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [accessDenied, setAccessDenied] = useState(false); 

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "owner") {
      setAccessDenied(true); 
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = (u.fullName || "").toLowerCase();
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    
    return fullName.includes(searchLower) || 
           name.includes(searchLower) || 
           email.includes(searchLower);
  });

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
      {/* FIXED HEADER */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate("/dashboard")} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Kelola Pengguna</h1>
              <p className="text-xs text-white/70 truncate">Manajemen data pengguna walet jaya</p>
            </div>
            
            <button
              onClick={() => navigate("/tambah-pengguna")}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-yellow-400 text-navy rounded-lg text-xs sm:text-sm font-semibold hover:bg-yellow-500 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Pengguna</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm top-[76px] sm:top-[84px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-navy outline-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-[137px] sm:pt-[149px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Memuat data pengguna...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <UsersIcon className="mx-auto mb-2 w-10 h-10 text-gray-300" />
                <p className="text-sm">
                  {searchTerm ? "Tidak ada hasil pencarian" : "Data pengguna kosong"}
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-navy text-white">
                      <tr>
                        <th className="px-4 lg:px-5 py-3 text-left">No</th>
                        <th className="px-4 lg:px-5 py-3 text-left">Nama</th>
                        <th className="px-4 lg:px-5 py-3 text-left">Email</th>
                        <th className="px-4 lg:px-5 py-3 text-left">Role</th>
                        <th className="px-4 lg:px-5 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.map((user, i) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 lg:px-5 py-3">{i + 1}</td>

                          <td className="px-4 lg:px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                {(user.fullName || user.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium truncate">
                                {user.fullName || user.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 lg:px-5 py-3 text-gray-700">
                            <span className="truncate block max-w-xs">{user.email || "-"}</span>
                          </td>

                          <td className="px-4 lg:px-5 py-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === "owner"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role === "owner" ? "Owner" : "Admin"}
                            </span>
                          </td>

                          <td className="px-4 lg:px-5 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => navigate(`/edit-pengguna/${user._id}`)}
                                className="p-2 text-xs bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/hapus-pengguna/${user._id}`)}
                                disabled={user.role === "owner"}
                                className={`p-2 text-xs rounded-md transition-colors ${
                                  user.role === "owner"
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="md:hidden divide-y">
                  {filteredUsers.map((user, i) => (
                    <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-semibold flex-shrink-0">
                          {(user.fullName || user.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-navy truncate">
                              {user.fullName || user.name}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0">#{i + 1}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{user.email || "-"}</p>
                          <span
                            className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              user.role === "owner"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role === "owner" ? "Owner" : "Admin"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/edit-pengguna/${user._id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => navigate(`/hapus-pengguna/${user._id}`)}
                          disabled={user.role === "owner"}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                            user.role === "owner"
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
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