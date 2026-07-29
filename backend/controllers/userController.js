import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc Get logged in user's profile
// @route GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// @desc Update profile (name, phone, avatar)
// @route PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  res.status(200).json({ success: true, user });
});

// @desc Change password
// @route PUT /api/users/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: "Password updated successfully" });
});

// @desc Add address
// @route POST /api/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @desc Update address
// @route PUT /api/users/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return res.status(404).json({ success: false, message: "Address not found" });

  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  Object.assign(address, req.body);
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// @desc Delete address
// @route DELETE /api/users/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// ---------- ADMIN ----------

// @desc Get all users (admin)
// @route GET /api/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt");
  res.status(200).json({ success: true, count: users.length, users });
});

// @desc Delete user (admin)
// @route DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  await user.deleteOne();
  res.status(200).json({ success: true, message: "User deleted" });
});

// @desc Block/unblock user (admin)
// @route PUT /api/users/:id/block
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.status(200).json({ success: true, message: `User ${user.isBlocked ? "blocked" : "unblocked"}`, user });
});
