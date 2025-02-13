const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = adminAuth;
