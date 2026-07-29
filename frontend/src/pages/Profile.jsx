import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { FiUser, FiLock, FiMapPin, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { useEffect } from "react";

export default function Profile() {
  const { user, updateUserLocally } = useAuth();
  const [tab, setTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress());
  const [editingId, setEditingId] = useState(null);

  function emptyAddress() {
    return { label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "India", isDefault: false };
  }

  useEffect(() => {
    api.get("/users/profile").then((res) => setAddresses(res.data.user.addresses || []));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/users/profile", profileForm);
      updateUserLocally(data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/change-password", passwordForm);
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { data } = await api.put(`/users/addresses/${editingId}`, addressForm);
        setAddresses(data.addresses);
        toast.success("Address updated");
      } else {
        const { data } = await api.post("/users/addresses", addressForm);
        setAddresses(data.addresses);
        toast.success("Address added");
      }
      setAddressForm(emptyAddress());
      setEditingId(null);
    } catch (err) {
      toast.error("Could not save address");
    }
  };

  const deleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/users/addresses/${id}`);
      setAddresses(data.addresses);
      toast.success("Address removed");
    } catch (err) {
      toast.error("Could not delete address");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <FiUser /> },
    { id: "password", label: "Password", icon: <FiLock /> },
    { id: "addresses", label: "Addresses", icon: <FiMapPin /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Profile" }]} />
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-left ${
                tab === t.id ? "bg-primary-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
          {tab === "profile" && (
            <form onSubmit={saveProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input value={user?.email} disabled className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
              </div>
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm">Save Changes</button>
            </form>
          )}

          {tab === "password" && (
            <form onSubmit={changePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input type="password" required minLength={6} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
              </div>
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm">Update Password</button>
            </form>
          )}

          {tab === "addresses" && (
            <div>
              <div className="space-y-3 mb-6">
                {addresses.map((addr) => (
                  <div key={addr._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start">
                    <div className="text-sm">
                      <p className="font-medium">{addr.label} {addr.isDefault && <span className="text-xs text-primary-600">(Default)</span>}</p>
                      <p className="text-gray-500 mt-1">{addr.fullName}, {addr.phone}</p>
                      <p className="text-gray-500">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setAddressForm(addr); setEditingId(addr._id); }} className="text-gray-500 hover:text-primary-600"><FiEdit2 size={16} /></button>
                      <button onClick={() => deleteAddress(addr._id)} className="text-gray-500 hover:text-red-600"><FiTrash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && <p className="text-sm text-gray-500">No saved addresses yet.</p>}
              </div>

              <form onSubmit={saveAddress} className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-5">
                <p className="font-medium text-sm flex items-center gap-1"><FiPlus /> {editingId ? "Edit Address" : "Add New Address"}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input required placeholder="Full Name" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  <input required placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                </div>
                <input required placeholder="Address Line 1" value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                <div className="grid sm:grid-cols-3 gap-3">
                  <input required placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  <input required placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  <input required placeholder="Postal Code" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                  Set as default address
                </label>
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm">
                  {editingId ? "Update Address" : "Add Address"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
