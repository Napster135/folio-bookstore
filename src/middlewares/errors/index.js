import EErrors from "../../services/errors/enums.js";
export default (error, req, res, next) => {
    switch (error.code) {
        case EErrors.ROUTING_ERROR:
            res.status(404).json({ status: "error", error: error.name });
            break;
        case EErrors.INVALID_TYPES_ERROR:
            res.status(400).json({ status: "error", error: error.name });
            break;
        case EErrors.DATABASE_ERROR:
            res.status(503).json({ status: "error", error: error.name });
            break;
        default:
            res.status(500).json({ status: "error", error: "Internal server error" });
    }
}