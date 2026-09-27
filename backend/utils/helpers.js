class ApiError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const sendSuccess = (res, message, data = null, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

module.exports = { ApiError, asyncHandler, sendSuccess };
