import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap gap-1">
      <Link to="/" className="hover:text-primary-600">Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <FiChevronRight size={14} />
          {item.to ? (
            <Link to={item.to} className="hover:text-primary-600">{item.label}</Link>
          ) : (
            <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
