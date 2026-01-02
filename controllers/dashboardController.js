const Dashboard = require('../models/Dashboard');

// Create dashboard data
exports.createDashboard = async (req, res) => {
  try {
    const dashboard = new Dashboard(req.body);
    await dashboard.save();
    res.status(201).json(dashboard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get latest dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne().sort({ createdAt: -1 });
    if (!dashboard) return res.status(404).json({ error: 'No dashboard data found' });
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update dashboard data by ID
exports.updateDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dashboard) return res.status(404).json({ error: 'Dashboard data not found' });
    res.json(dashboard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete dashboard data by ID
exports.deleteDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findByIdAndDelete(req.params.id);
    if (!dashboard) return res.status(404).json({ error: 'Dashboard data not found' });
    res.json({ message: 'Dashboard data deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
