function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something bad happened but i dont know what...',
    });
}

module.exports = errorHandler;
