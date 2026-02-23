const User = require("../models/userModel");

// CREATE
exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) { res.status(400).json(err); }
};

// READ
exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

// UPDATE
exports.updateUser = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json(err); }
};

// DELETE
exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
};