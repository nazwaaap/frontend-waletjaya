import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Package, ShoppingCart, FileText, Users, Menu, X, LogOut, 
  LayoutDashboard, UserCircle, ChevronRight
} from "lucide-react";
import logoWaletJaya from "../assets/logowaletjaya.png";

export default function Sidebar({ user: userProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fotoProfil, setFotoProfil] = useState(null);

  useEffect(() => {
    const storedFoto = localStorage.getItem("fotoProfil");
    if (userProp?.fotoProfil !== undefined) {
      setFotoProfil(userProp.fotoProfil);
    } else if (storedFoto) {
      setFotoProfil(storedFoto);
    }
  }, [userProp?.fotoProfil]);

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedFoto = localStorage.getItem("fotoProfil");
      setFotoProfil(updatedFoto);
    };
    
    window.addEventListener("storage-profil-update", handleStorageChange);
    window.addEventListener("storage", handleStorageChange); 
    
    return () => {
      window.removeEventListener("storage-profil-update", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const user = {
    role:       userProp?.role  || localStorage.getItem("userRole"),
    name:       userProp?.name  || localStorage.getItem("userName"),
    email:      userProp?.email || localStorage.getItem("userEmail"),
    fotoProfil: fotoProfil, 
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("fotoProfil"); 
    navigate("/");
  };

  const menus = [
    { id: "dashboard", label: "Dashboard",           icon: LayoutDashboard, path: "/dashboard" },
    { id: "pengguna",  label: "Kelola Pengguna",     icon: Users,           path: "/kelola-pengguna",     roles: ["owner"] },
    { id: "produk",    label: "Kelola Produk",       icon: Package,         path: "/kelola-produk",       roles: ["owner"] },
    { id: "transaksi", label: "Transaksi Penjualan", icon: ShoppingCart,    path: "/transaksi-penjualan", roles: ["owner", "admin"] },
    { id: "laporan",   label: "Laporan Penjualan",   icon: FileText,        path: "/laporan-penjualan",   roles: ["owner", "admin"] },
    { id: "profil",    label: "Kelola Profil",       icon: UserCircle,      path: "/kelola-profil",       roles: ["owner", "admin"] },
  ];

  const handleMenuClick = (menu) => {
    setSidebarOpen(false);
    if (menu.path) navigate(menu.path);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-52 bg-gradient-to-b from-navy via-navy to-navySoft text-white flex flex-col transition-transform duration-300 shadow-xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
          <img
            src={logoWaletJaya}
            alt="Walet Jaya"
            className="w-8 h-8 object-contain brightness-0 invert flex-shrink-0"
          />
          <div>
            <p className="font-bold text-sm leading-tight">Walet Jaya</p>
            <p className="text-[9px] text-white/40 leading-tight">Sistem Manajemen</p>
          </div>
        </div>

        <button
          onClick={() => { setSidebarOpen(false); navigate("/kelola-profil"); }}
          className="flex items-center gap-2.5 px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-colors text-left w-full"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            {user?.fotoProfil ? (
              <img src={user.fotoProfil} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[11px] text-white truncate leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[9px] text-white/50 truncate leading-tight mt-0.5">
              {user?.email || ""}
            </p>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
        </button>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {menus
            .filter((menu) => !menu.roles || menu.roles.includes(user?.role))
            .map((menu) => {
              const Icon = menu.icon;
              const active = isActive(menu.path);
              return (
                <button
                  key={menu.id}
                  onClick={() => handleMenuClick(menu)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[11px] ${
                    active
                      ? "bg-white text-navy font-semibold shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{menu.label}</span>
                </button>
              );
            })}
        </nav>

        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] text-white/40 hover:text-white hover:bg-white/8 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-navy text-white rounded-lg shadow-lg hover:bg-navySoft transition-colors"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </>
  );
}