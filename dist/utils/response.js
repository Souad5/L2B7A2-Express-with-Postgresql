const sendResponse = (res, statusCode, success, message, data, errors) => {
    res.status(statusCode).json({
        success,
        message,
        data,
        errors,
    });
};
export default sendResponse;
//# sourceMappingURL=response.js.map