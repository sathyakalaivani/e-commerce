import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";

export default function AdminLayout() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
