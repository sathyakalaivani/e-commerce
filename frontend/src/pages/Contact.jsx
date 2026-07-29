import { useState } from "react";
import toast from "react-hot-toast";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="text-2xl font-bold mb-8">Get in Touch</h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex gap-3">
            <FiMapPin className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="font-medium">Our Office</p>
              <p className="text-sm text-gray-500">123 Commerce Street, Chennai, Tamil Nadu, India</p>
            </div>
          </div>
          <div className="flex gap-3">
            <FiPhone className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-sm text-gray-500">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex gap-3">
            <FiMail className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-500">support@shopmern.com</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <input required type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <textarea required rows={5} placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg">Send Message</button>
        </form>
      </div>
    </div>
  );
}
