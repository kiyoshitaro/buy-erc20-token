import io, { Socket } from 'socket.io-client';
import WebSocket from 'ws';
import zlib from 'zlib';
let socketBingX;
let socketMEXC;
const _price = new Map<string, { amount_bid: number, price_bid: number, amount_ask: number, price_ask: number }>();

function onOpenBingX() {
  console.log("WebSocket connected");
  socketBingX.send(JSON.stringify(
    {
      "dataType": "spot.depth2.MYRO_USDT.0.00001",
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
        "spot@public.limit.depth.v3.api@MYROUSDT@5"
      ]
    }
  ));
}


function onError(error) {
  console.log("WebSocket error:", error);
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
      amount_bid: firstBid.v,
      price_bid: firstBid.p,
      amount_ask: lastAsk.v,
      price_ask: lastAsk.p
    });
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
        amount_bid: firstBid.amount,
        price_bid: firstBid.price,
        amount_ask: lastAsk.amount,
        price_ask: lastAsk.price
      });
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

  setInterval(() => {
    if (_price.get('BINGX')?.price_ask && _price.get('MEXC')?.price_ask) {
      const _rate = _price.get('BINGX').price_ask / _price.get('MEXC').price_ask
      if (0.98 > _rate || _rate > 1.02) {
        console.log(`Rate: ${_rate}, BINGX: ${_price.get('BINGX').price_ask}*${_price.get('BINGX').amount_ask}, MEXC: ${_price.get('MEXC').price_ask}*${_price.get('MEXC').amount_ask}`)
      }
    }
  }, 1000);
}
init();