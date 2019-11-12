const PORT = process.env.PORT || 3000;

const TOKEN_HOST = process.env.TOKEN_HOST || 'localhost';
const TOKEN_PORT = process.env.TOKEN_PORT || '3001';
const TOKEN_URL = 'http://' + TOKEN_HOST + ':' + TOKEN_PORT;

const REQ_COUNTER_HOST = process.env.REQ_COUNTER_HOST || 'localhost';
const REQ_COUNTER_PORT = process.env.REQ_COUNTER_PORT || '3002';
const REQ_COUNTER_URL = 'http://' + REQ_COUNTER_HOST + ':' + REQ_COUNTER_PORT;

const VERAZ_HOST = process.env.VERAZ_HOST || 'localhost';
const VERAZ_PORT = process.env.VERAZ_PORT || '3003';
const VERAZ_URL = 'http://' + VERAZ_HOST + ':' + VERAZ_PORT;

const gateway = require('fast-gateway');
const request = require('request');

// middleware validacion de token
var validarToken = function (req, res, next) {
    var options = {
        url: 'http://' + req.headers.host + '/validate'
        , headers: { 'Authorization': (req.headers.authorization || '') }
    };
    function callback(error, response, body) {
        if (error) {
            var err = new Error('Error de conexión al validador de usuario');
            err.code = 500;
            next(err);
        } else {
            var data = JSON.parse(body);
            if (response.statusCode == 200) {
                next();
            } else {                
                res.writeHead(response.statusCode, { 'Content-Type': 'application/json', 'charset': 'utf-8' });
                res.send({ error: data.error });
            };
        }
    }
    request(options, callback);
};

const server = gateway({
    middlewares: [
        require('cors')()
        , require('helmet')()
        , require('body-parser').json()
    ],

    routes: [
        {
            prefix: '/validate'
            , pathRegex: ''
            , prefixRewrite: '/validate'
            , target: TOKEN_URL
            , methods: ['GET']
            , docs: {
                name: "Token validator",
                endpoint: "/validate",
                description: "Validador del token para uso del sistema"
            }
        }
        , {
            prefix: '/veraz'
            , pathRegex: '/*'
            , target: VERAZ_URL
            , prefixRewrite: '/veraz'
            , methods: ['GET', 'POST', 'PATCH']
            , middlewares: [validarToken]
            , docs: {
                name: "Veraz",
                endpoint: "/veraz",
                description: "Base de datos de deudores"
            }
        }
        , {
            prefix: '/veraz'
            , pathRegex: ''
            , target: VERAZ_URL
            , prefixRewrite: '/veraz'
            , methods: ['GET', 'POST', 'PATCH']
            , middlewares: [validarToken]
            , docs: {
                name: "Veraz",
                endpoint: "/veraz",
                description: "Base de datos de deudores"
            }
        }
        , {
            prefix: '/count'
            , pathRegex: ''
            , target: REQ_COUNTER_URL
            , prefixRewrite: '/count'
            , methods: ['GET']
            , middlewares: [validarToken]
            , docs: {
                name: "Request counter"
                , endpoint: "/count"
                , method: 'GET'
                , description: "Contador de request"
            }
        }
        , {
            prefix: '/user'
            , pathRegex: '/*'
            , target: REQ_COUNTER_URL
            , prefixRewrite: '/user'
            , methods: ['GET', 'POST']
            , middlewares: [validarToken]
            , docs: {
                name: "Request counter, user management"
                , endpoint: '/user/:id'
                , methods: ['GET', 'POST']
                , description: "Contador de request"
            }
        }
        , {
            prefix: '/*'
            , hooks: {
                onRequest(req, res) {
                    res.writeHead(404, { 'Content-Type': 'application/json', 'charset': 'utf-8' });
                    res.send({ error: 'No implementado (GW)' });
                    console.log('URL error: ' + `${req.method} ${req.url}`);
                    return true;
                }
            }
            , docs: {
                name: "Path por defecto",
                endpoint: "/*",
                description: "Ruta por defecto para obtener un respuesta a un servicio no dado de alta"
            }
        }
    ]
})

server.start(PORT).then(server => {
    console.log(`API Gateway listening on ${PORT} port!`)
});