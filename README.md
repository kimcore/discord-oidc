# Discord-OIDC
This simply wraps Discord OAuth2 to OpenID Connect.
## Download
Clone this repo or [download as zip](https://github.com/kimcore/discord-oidc/archive/master.zip)
## Config
Edit config.js with your Client ID / Secret, Redirect URL, and Port / Host.
```js
const config = {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectURL: 'https://YOUR_GATEWAY.cloudflareaccess.com/cdn-cgi/access/callback',
    host: '127.0.0.1',
    port: 1214
}
```
## Run
Simply use `npm start` or `node server.js` to start.

I recommend using Apache2 / Nginx proxies to secure connections.
## Usage
For Cloudflare Access:

![](https://i.imgur.com/6EtG21Y.png)
