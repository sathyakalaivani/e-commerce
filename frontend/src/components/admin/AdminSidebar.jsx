import { NavLink } from "react-router-dom";
import { FiGrid, FiBox, FiTag, FiShoppingBag, FiUsers, FiStar, FiArrowLeft } from "react-icons/fi";

const links = [
  { to: "/admin", label: "Dashboard", icon: <FiGrid />, end: true },
  { to: "/admin/products", label: "Products", icon: <FiBox /> },
  { to: "/admin/categories", label: "Categories", icon: <FiTag /> },
  { to: "/admin/orders", label: "Orders", icon: <FiShoppingBag /> },
  { to: "/admin/users", label: "Users", icon: <FiUsers /> },
  { to: "/admin/reviews", label: "Reviews", icon: <FiStar /> },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 min-h-screen p-4 hidden md:block">
      <h2 className="font-extrabold text-lg text-primary-600 mb-6 px-2">Admin Panel</h2>
      <nav className="space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive ? "bg-primary-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`
            }
          >
            {l.icon} {l.label}
          </NavLink>
        ))}
        <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 mt-4">
          <FiArrowLeft /> Back to Store
        </NavLink>
      </nav>
    </aside>
  );
}
