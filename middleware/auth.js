// Blocks unauthenticated access to /admin/* (except /admin/login).
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  return res.redirect('/admin/login');
}

module.exports = { requireAdmin };
