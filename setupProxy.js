const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://cbadmin.cubicbird.com/cbadmin/api/',
            changeOrigin: true,
        })
    );
};
