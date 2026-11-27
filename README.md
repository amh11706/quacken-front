# quacken-front

Web client for Super Quacken / Global Cadesim, built with Angular. It talks to
the [quackgo](https://github.com/amh11706/quackgo) game server over HTTP and a
websocket.

## Setup

You need Node 22 or 24, and a local quackgo server to connect to. Clone this
repo next to quackgo and follow
[quackgo's README](https://github.com/amh11706/quackgo#setup) to get the
server running first. Then:

```sh
cd quacken-front
npm install
npm start
```

Open http://localhost:4200. The dev server proxies `/api` to
`localhost:$QUACKGO_PORT` (default 8090), the same variable quackgo listens on,
so the two match without extra setup. See [proxy.conf.js](proxy.conf.js).

### Against the live server

To work on the client without running quackgo, serve it against
superquacken.com:

```sh
npm run start:live
```

This uses [proxy.live.conf.js](proxy.live.conf.js) in place of the local proxy,
so you play on the live server with your real account. Keep it on port 4200:
that's the only local address the live server accepts connections from. The
server also refuses clients older than its own version, so pull before
starting if it says you're out of date.

Production builds talk to superquacken.com directly
([environment.prod.ts](src/environments/environment.prod.ts)).

## Checks

```sh
npm run lint
npm run build
```

Unit and end-to-end tests are not set up: `npm test` and `npm run e2e` don't
currently work.

## Deploying

The `deploy*`, `bump` and `release:front` scripts push to the production
servers and need the maintainer's credentials. Contributors don't need them.

## License

[Apache License 2.0](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) to
contribute.
