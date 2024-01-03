import io, { Socket } from 'socket.io-client';
import WebSocket from 'ws';
import zlib from 'zlib';
let socketBingX;
let socketMEXC;
let socketKU;
const _price = new Map<string, {
  thresh: { amount_bid: number, price_bid: number, amount_ask: number, price_ask: number, updated_at: Date },
  top_ask: { amount: number; price: number }[],
  top_bid: { amount: number; price: number }[],
}>();

function onOpenBingX() {
  console.log("WebSocket connected");
  socketBingX.send(JSON.stringify(
    {
      // "dataType": "spot.depth2.MYRO_USDT.0.00001",
      // "dataType": "spot.depth2.GMX_USDT.0.01",
      // "dataType": "spot.depth2.ALGO_USDT.0.0001",
      // "dataType": "spot.depth2.DAO_USDT.0.001",
      // "dataType": "spot.depth2.INSUR_USDT.0.00001",
      "dataType": "spot.depth2.IRON_USDT.0.001",
      "data": {
        "depth": 5,
        "aggPrecision": "0.00001"
      },
      "id": "3c062bfa-a0d0-49fe-a8ab-e46889a77ee0",
      "reqType": "sub"
    }
  ));
}

function onOpenMEXC() {
  console.log("WebSocket MEXC connected");
  socketMEXC.send(JSON.stringify(
    {
      "method": "SUBSCRIPTION",
      "params": [
        // "spot@public.limit.depth.v3.api@MYROUSDT@5"
        // "spot@public.limit.depth.v3.api@GMXUSDT@5"
        // "spot@public.limit.depth.v3.api@ALGOUSDT@5"
        // "spot@public.limit.depth.v3.api@DAOUSDT@5"
        // "spot@public.limit.depth.v3.api@INSURUSDT@5"
        "spot@public.limit.depth.v3.api@IRONUSDT@5"
      ]
    }
  ));
}

function onOpenKU() {
  console.log("WebSocket KU connected");
  socketKU.send(JSON.stringify(
    {
      "id": 1545910660739, //The id should be an unique value
      "type": "subscribe",
      "topic": "/spotMarket/level2Depth5:BTC-USDT", //Topic needs to be subscribed. Some topics support to divisional subscribe the informations of multiple trading pairs through ",".
      "privateChannel": false, //Adopted the private channel or not. Set as false by default.
      "response": true //Whether the server needs to return the receipt information of this subscription or not. Set as false by default.
    }));
}



function onError(error) {
  console.log("WebSocket error:", error);
}

function onMessageKU(message) {
  let _message = JSON.parse(message)
  console.log("🚀 ~ file: price.ts:60 ~ onMessageKU ~ _message:", _message)
  // const asks = _message['d']?.asks;
  // const bids = _message['d']?.bids;
  // if (asks && asks.length && bids && bids.length) {
  //   const lastAsk = asks[asks.length - 1];
  //   const firstBid = bids[0];
  //   // console.log(`MEXC: BAN ${lastAsk.p} : ${lastAsk.v} ----- MUA: ${firstBid.p} : ${firstBid.v}`);
  //   _price.set('MEXC', {
  //     thresh: {
  //       amount_bid: Number(firstBid.v),
  //       price_bid: Number(firstBid.p),
  //       amount_ask: Number(lastAsk.v),
  //       price_ask: Number(lastAsk.p),
  //       updated_at: new Date(),
  //     },
  //     top_ask: asks.map(_ask => ({ amount: Number(_ask.v), price: Number(_ask.p) })),
  //     top_bid: bids.map(_bid => ({ amount: Number(_bid.v), price: Number(_bid.p) }))
  //   });
  //   snipe();
  // }
}


function onMessageMEXC(message) {
  let _message = JSON.parse(message)
  const asks = _message['d']?.asks;
  const bids = _message['d']?.bids;
  if (asks && asks.length && bids && bids.length) {
    const lastAsk = asks[asks.length - 1];
    const firstBid = bids[0];
    // console.log(`MEXC: BAN ${lastAsk.p} : ${lastAsk.v} ----- MUA: ${firstBid.p} : ${firstBid.v}`);
    _price.set('MEXC', {
      thresh: {
        amount_bid: Number(firstBid.v),
        price_bid: Number(firstBid.p),
        amount_ask: Number(lastAsk.v),
        price_ask: Number(lastAsk.p),
        updated_at: new Date(),
      },
      top_ask: asks.map(_ask => ({ amount: Number(_ask.v), price: Number(_ask.p) })),
      top_bid: bids.map(_bid => ({ amount: Number(_bid.v), price: Number(_bid.p) }))
    });
    snipe();
  }
}


function onMessageBingX(message) {
  const buf = Buffer.from(message);
  const decodedMsg = zlib.gunzipSync(buf).toString('utf-8');
  if (decodedMsg === "Ping") {
    socketBingX.send('Pong');
    console.log('Pong');
  } else {
    let _decodedMsg = JSON.parse(decodedMsg)
    const asks = _decodedMsg['data']?.asks;
    const bids = _decodedMsg['data']?.bids;
    if (asks && asks.length && bids && bids.length) {
      const lastAsk = asks[asks.length - 1];
      const firstBid = bids[0];
      // console.log(`BINGX: BAN ${lastAsk.price} : ${lastAsk.amount} ----- MUA: ${firstBid.price} : ${firstBid.amount}`);
      _price.set('BINGX', {
        thresh: {
          amount_bid: Number(firstBid.amount),
          price_bid: Number(firstBid.price),
          amount_ask: Number(lastAsk.amount),
          price_ask: Number(lastAsk.price),
          updated_at: new Date(),
        },
        top_ask: asks.map(_ask => ({ amount: Number(_ask.amount), price: Number(_ask.price) })),
        top_bid: bids.map(_bid => ({ amount: Number(_bid.amount), price: Number(_bid.price) }))
      });
      snipe();
    }
  }
}

const calculatePNL = (
  data: {
    _asks: { amount: number, price: number }[],
    _bids: { amount: number, price: number }[]
  }
) => {
  let { _asks, _bids } = data;
  _asks = _asks.sort((a, b) => a.price - b.price);
  _bids = _bids.sort((a, b) => b.price - a.price);
  console.log("🚀 ~ file: price.ts:103 ~ _asks, _bids:", _asks, _bids)
  let totalAsk = _asks.reduce((a, b) => a + b.amount, 0);
  let totalBid = _bids.reduce((a, b) => a + b.amount, 0);
  let totalBuyUSD = 0;
  let totalSellUSD = 0;
  if (totalAsk > totalBid) {
    totalSellUSD = _bids.reduce((a, b) => a + b.amount * b.price, 0);
    for (const _ask of _asks) {
      if (totalBid > _ask.amount) {
        totalBuyUSD += _ask.amount * _ask.price;
        totalBid -= _ask.amount;
      } else {
        if (totalBid > 0) {
          totalBuyUSD += totalBid * _ask.price;
        }
        break;
      }
    }
    console.log(`Buy ${totalBid} tokens: ${totalBuyUSD} USD, PNL: ${totalSellUSD - totalBuyUSD}, %PL: ${(totalSellUSD - totalBuyUSD) / totalBuyUSD}`);
  } else {
    totalBuyUSD = _asks.reduce((a, b) => a + b.amount * b.price, 0);
    for (const _bid of _bids) {
      if (totalAsk > _bid.amount) {
        totalSellUSD += _bid.amount * _bid.price;
        totalAsk -= _bid.amount;
      } else {
        if (totalAsk > 0) {
          totalSellUSD += totalAsk * _bid.price;
        }
        break;
      }
    }
    console.log(`Buy ${totalAsk} tokens: ${totalBuyUSD} USD, PNL: ${totalSellUSD - totalBuyUSD}, %PL: ${(totalSellUSD - totalBuyUSD) / totalBuyUSD}`);
  }

}

const snipe = () => {
  if (_price.get('BINGX')?.thresh?.price_ask && _price.get('MEXC')?.thresh?.price_ask) {
    const _rateBingToMexc = _price.get('MEXC').thresh?.price_bid / _price.get('BINGX').thresh?.price_ask;
    const _rateMexcToBing = _price.get('BINGX').thresh?.price_bid / _price.get('MEXC').thresh?.price_ask;
    console.log(`🚀 ~ BINGX->MEXC:${_rateBingToMexc} | MEXC->BINGX:${_rateMexcToBing}`);
    if (_rateBingToMexc > 1) {
      console.log(`RATE: ${_rateBingToMexc.toFixed(4)} ==> BINGX: ${_price.get('BINGX').thresh?.price_ask}*${_price.get('BINGX').thresh?.amount_ask} ---> MEXC: ${_price.get('MEXC').thresh?.price_bid}*${_price.get('MEXC').thresh?.amount_bid}`)
      let _asks = [];
      let _bids = [];
      // console.log("🚀 ~ file: price.ts:178 ~ setInterval ~ _price.get('MEXC').thresh:", _price.get('BINGX').top_ask, _price.get('MEXC').thresh, _price.get('MEXC').thresh?.price_bid, _price.get('MEXC').top_bid, _price.get('BINGX').thresh?.price_ask)
      for (const _ask of _price.get('BINGX').top_ask) {
        if (_ask.price < _price.get('MEXC').thresh?.price_bid) {
          _asks.push(_ask);
        }
      }
      for (const _bid of _price.get('MEXC').top_bid) {
        if (_bid.price > _price.get('BINGX').thresh?.price_ask) {
          _bids.push(_bid);
        }
      }
      calculatePNL({ _asks, _bids });
    }
    if (_rateMexcToBing > 1) {
      console.log(`RATE: ${_rateMexcToBing.toFixed(4)} ==> MEXC: ${_price.get('MEXC').thresh?.price_ask}*${_price.get('MEXC').thresh?.amount_ask} ---> BINGX: ${_price.get('BINGX').thresh?.price_bid}*${_price.get('BINGX').thresh?.amount_bid}`)
      let _asks = [];
      let _bids = [];
      // console.log("🚀 ~ file: price.ts:196 ~ setInterval ~ _price.get('MEXC').top_ask:", _price.get('MEXC').top_ask, _price.get('BINGX').thresh?.price_bid, _price.get('BINGX').top_bid, _price.get('MEXC').thresh?.price_ask)
      for (const _ask of _price.get('MEXC').top_ask) {
        if (_ask.price < _price.get('BINGX').thresh?.price_bid) {
          _asks.push(_ask);
        }
      }
      for (const _bid of _price.get('BINGX').top_bid) {
        if (_bid.price > _price.get('MEXC').thresh?.price_ask) {
          _bids.push(_bid);
        }
      }
      calculatePNL({ _asks, _bids });
    }
  }
}

function init() {


  // socket = new WebSocket('wss://open-api-swap.bingx.com/swap-market'); // Use your server's address
  socketBingX = new WebSocket('wss://ws-spot.we-api.com/market', {
    headers: {
      'Origin': 'https://bingx.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    }
  }); // Use your server's address
  socketBingX.on('open', onOpenBingX);
  socketBingX.on('message', onMessageBingX);
  socketBingX.on('error', onError);


  socketMEXC = new WebSocket('wss://wbs.mexc.com/ws', {
    headers: {
      'Origin': 'https://bingx.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    }
  }); // Use your server's address
  socketMEXC.on('open', onOpenMEXC);
  socketMEXC.on('message', onMessageMEXC);
  socketMEXC.on('error', onError);

  // socketKU = new WebSocket('wss://ws-api-spot.kucoin.com/?token=2neAiuYvAU5cbMXpmsXD5OJlewXCKryg8dSpDCgag8ZwbZpn3uIHi0A1AOtpCibAwoXOiOG0Q0EZZOdcWkXaM1jQDmh2BXhYvMOXHYIgkRLj4fMc1W_p_KqRyqznCVt1whuoNZhpWWGYAagTklu26cVcjJBqKFhV.jyexTyd6-2V4se8vzAPjMw==', {
  //   headers: {
  //     'Origin': 'https://bingx.com',
  //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  //   }
  // }); // Use your server's address
  // socketKU.on('open', onOpenKU);
  // socketKU.on('message', onMessageKU);
  // socketKU.on('error', onError);

  // setInterval(() => snipe(), 1000);
}
init();