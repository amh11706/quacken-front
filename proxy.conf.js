// `ng serve` forwards /api to the local quackgo server. QUACKGO_PORT and its
// default must match quackgo's dev listener (server/server.go).
const port = process.env.QUACKGO_PORT || '8090';

export default {
  '/api': {
    target: `http://localhost:${port}`,
    pathRewrite: { '^/api': '' },
    ws: true,
  },
};
