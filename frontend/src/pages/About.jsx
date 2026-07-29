import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "About" }]} />
      <h1 className="text-3xl font-bold mb-4">About ShopMERN</h1>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
        ShopMERN is a modern e-commerce destination built to make online shopping simple, fast, and enjoyable.
        We curate quality products across electronics, fashion, home essentials, books, and fitness — all in
        one place.
      </p>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
        Our platform is built on the MERN stack (MongoDB, Express, React, Node.js), giving you a fast,
        reliable, and secure shopping experience from browsing to checkout.
      </p>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        We're committed to great customer service, fast shipping, and hassle-free returns. Thank you for
        shopping with us!
      </p>
    </div>
  );
}
