const authMiddleware = (req, res, next) => {
    if (req.session?.user?.email) {
        next();
    } else {
        res.status(401).json({ status: "Unauthorized", message: "Debés iniciar sesión", code: 401 });
    }
};

const adminOnly = (req, res, next) => {
    if (req.session?.user?.role === "admin") {
        next();
    } else {
        res.status(403).json({ status: "Forbidden", message: "No tenés permisos para esta acción", code: 403 });
    }
};

const premiumOnly = (req, res, next) => {
    if (req.session?.user?.role === "premium") {
        next();
    } else {
        res.status(403).json({ status: "Forbidden", message: "No tenés permisos para esta acción", code: 403 });
    }
};

const premiumOrAdmin = (req, res, next) => {
    const role = req.session?.user?.role;
    if (role === "premium" || role === "admin") {
        next();
    } else {
        res.status(403).json({ status: "Forbidden", message: "No tenés permisos para esta acción", code: 403 });
    }
};

export { authMiddleware, adminOnly, premiumOnly, premiumOrAdmin };