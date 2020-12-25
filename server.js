const {clientId, clientSecret, redirectURL, port, host} = require('./config')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fetch = require('node-fetch')
const jwk = require('json-web-key')
const jwt = require('jsonwebtoken')
const fs = require('fs')
let key, publicKey
if (!fs.existsSync('./jwtRS256.key') || !fs.existsSync('./jwtRS256.key.pub')) {
    console.log('Key pair not found, generating one now...')
    const crypto = require('crypto')
    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    })
    key = keyPair.privateKey
    publicKey = keyPair.publicKey
} else {
    key = fs.readFileSync('./jwtRS256.key', 'utf8')
    publicKey = fs.readFileSync('./jwtRS256.key.pub', 'utf8')
}

const app = express()
app.set('trust proxy', true)
app.use(cors())
app.use(helmet.hidePoweredBy())
app.use(express.urlencoded({
    extended: false
}))

app.get('/authorize', async (request, response) => {
    const params = new URLSearchParams({
        'client_id': clientId,
        'client_secret': clientSecret,
        'redirect_uri': redirectURL,
        'response_type': 'code',
        'scope': 'identify email',
        'state': request.query['state']
    }).toString()
    response.redirect('https://discord.com/oauth2/authorize?' + params)
})

app.post('/token', async (request, response) => {
    const code = request.body['code']
    const params = new URLSearchParams({
        'client_id': clientId,
        'client_secret': clientSecret,
        'redirect_uri': redirectURL,
        'code': code,
        'grant_type': 'authorization_code',
        'scope': 'identify email'
    }).toString()
    const r = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: params,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(res => res.json()).catch(() => null)
    if (r == null) return response.sendStatus(400)
    const userInfo = await fetch('https://discord.com/api/users/@me', {
        headers: {
            'Authorization': 'Bearer ' + r['access_token']
        }
    }).then(res => res.json()).catch(() => {
    })
    if (!userInfo['verified']) return response.sendStatus(400)
    const idToken = jwt.sign({
        iss: 'https://cloudflare.com',
        aud: clientId,
        email: userInfo['email']
    }, key, {
        expiresIn: '1h',
        algorithm: 'RS256',
        keyid: 'jwtRS256'
    })
    response.json({
        ...r,
        scope: 'identify email',
        id_token: idToken
    })
})

app.get('/jwks.json', async (request, response) => {
    response.json({
        keys: [{
            alg: 'RS256',
            kid: 'jwtRS256',
            ...jwk.fromPEM(publicKey).toJSON()
        }]
    })
})

app.listen(port, host, async () => {
    console.log('Discord OIDC Wraper started...')
})
