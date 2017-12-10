var KiteConnect = require("kiteconnect").KiteConnect;


async function logic(req) {
  try {

    kc = new KiteConnect(process.env.ZERODHA_API_KEY);
    kc.requestAccessToken(process.env.ZERODHA_REQUEST_TOKEN, process.env.ZERODHA_API_SECRET).then((Response) => {
        global.kc = kc;
      })
      // Fetch equity margins.
      // You can have other api calls here.
    const margin = await kc.margins("equity");
    logger.info(margin);
  } catch (e) {
    throw e;
  };
}


function handler(req, res, next) {
  logic(req).then((data) => {
      res.json({
        success: true,
        data,
      });
    })
    .catch(err => next(err));
}
module.exports = handler;