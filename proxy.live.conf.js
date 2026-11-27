// `npm run start:live` forwards /api to the live server instead of a local
// quackgo, so the local client plays on superquacken.com. The live server only
// accepts websockets from http://localhost:4200 (OriginPatterns in quackgo's
// server/wsserver.go), so keep ng serve on its default port.
export default {
  '/api': {
    target: 'https://superquacken.com',
    pathRewrite: { '^/api': '' },
    changeOrigin: true,
    ws: true,
  },
};
