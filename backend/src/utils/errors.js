module.exports = function errorResponse(code, description) {
  return {
    error: { code, description }
  };
};
