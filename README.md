# StarsLeague Trading Bot - Phân Tích Chi Tiết

## 📋 Mục Lục
1. [Cơ Chế Đấu Giá (Auction Mechanics)](#cơ-chế-đấu-giá)
2. [Chiến Lược Kiếm Lời](#chiến-lược-kiếm-lời)
3. [Các Tối Ưu Tốc Độ](#các-tối-ưu-tốc-độ)

---

## Cơ Chế Đấu Giá (Auction Mechanics)

### 📊 **Cấu Trúc Pool**

Mỗi pool (chủ thể) có:
- `sharesSupply`: Tổng số shares đang lưu hành
- `value`: Tổng giá trị pool (tích lũy từ các giao dịch)
- `initialShares`: Số shares tối đa trong kỳ đấu giá ban đầu (max 30)
- `endTimeBid`: Thời điểm kết thúc đấu giá
- `sharesBalance`: Mapping address -> số shares sở hữu

### 🏁 **2 Giai Đoạn Giao Dịch**

#### **Giai đoạn 1: Initial Bidding (Đấu giá ban đầu)**
- Thời gian: `block.timestamp` <= `endTimeBid`
- Chức năng: [`_bidShares()`](StarsLeague.sol#L775)
- Cơ chế:
  - User gửi ETH với hàm `buyShares()` (không cần chỉ định giá)
  - Amount = `msg.value` (số ETH gửi)
  - Contract lưu vào `poolInitialTops[]` - danh sách top bidders (sắp xếp giảm dần theo amount)
  - Chỉ **top `initialShares` người** được giữ share
  - Nếu bạn bid và rơi vào top list, whoever gets pushed out sẽ được **refund toàn bộ**
  - Mỗi bid chỉ được **1 share** (dù giá bao nhiêu)
  - Giá thực tế phải >= `getPoolInitialBuyPriceAfterFee()`

**Ví dụ:**
```
initialShares = 10
Bid list: [10 ETH, 9.5 ETH, 9 ETH, ..., 1 ETH]
→ Người với 1 ETH (vị trí 10) bị đẩy ra → refund 1 ETH
→ Người với 9.8 ETH lên vị trí 10 → giữ được share
```

#### **Giai đoạn 2: Normal Trading (Sau đấu giá)**
- Thời gian: `block.timestamp` > `endTimeBid`
- Chức năng: [`_buyShares()`](StarsLeague.sol#L856) và [`sellShares()`](StarsLeague.sol#L302)
- Cơ chế:
  - Mua: Giá theo **bonding curve** (cubic polynomial)
    ```
    price = getPrice(supply, amount)
    supply = _getSupply(pool.sharesSupply, pool.value)
    ```
  - Bán: Giá theo bonding curve ngược
    ```
    price = getPrice(_supply - amount, amount)
    ```

### 💰 **Công Thức Tính Giá**

```solidity
function getPrice(uint256 supply, uint256 amount) pure returns (uint256) {
    // sum of cubes: 1³ + 2³ + ... + (supply-1)³
    uint256 sum1 = ((supply - 1) * (supply) * (2 * (supply - 1) + 1)) / 6;
    uint256 sum2 = ((supply + amount - 1) * (supply + amount) * (2 * (supply + amount - 1) + 1)) / 6;
    uint256 summation = sum2 - sum1;
    return (summation * PRICE_A) / PRICE_B;  // PRICE_A = 3 ether, PRICE_B = 4
}
```

**Giải thích:** Đây là tích phân của hàm giá `p(x) = (3/4) * x²`, tạo ra đường cong giá bậc ba.

### 📈 **Phí Giao Dịch**

Các phí tính từ `price`:
```solidity
protocolFeePercent = 3%
subjectFeePercent = 5%
referrerFeePercent = 1%
poolFeePercent = 1%
totalFees = 10%
```

Phí được tính theo công thức:
```solidity
maxTax = 1000
taxByPrice = PRICE_C / sqrt((price * PRICE_B * 10000) / PRICE_A)
if (taxByPrice > maxTax) taxByPrice = maxTax
// Giá càng cao → taxByPrice càng thấp (tối đa 1000 = 10%)
```

---

## Chiến Lược Kiếm Lời

### 🎯 **Mục Tiêu**

**Strategy**: Mua ở **cuối kỳ đấu giá** (last 21-23 giây) và bán ngay sau khi đấu giá kết thúc.

### 📊 **Tại Sao Lợi Nhuận?**

1. **Đảm bảo vị trí top**: Bid cao ở phút chót → đẩy người khác ra top list
2. **Refund mechanism**: Nếu bị đẩy ra → hoàn tiền 100%
3. **Bán ngay sau**: Khi đấu giá kết thúc, pool value đã tích lũy từ nhiều bids → giá bán > giá mua

**Ví dụ minh họa:**

```
Pool: Subject A, initialShares = 10

Trước khi bot bid:
Top 10: [2, 1.9, 1.8, ..., 1.1] ETH
→ Người cuối (1.1 ETH) sẽ bị refund nếu có người bid cao hơn

Bot bid: 2.5 ETH vào 21 giây cuối
→ Bot lên top, đẩy người 1.1 ETH ra → họ refund 1.1 ETH
→ Bot giữ được 1 share với giá 2.5 ETH

Sau khi đấu giá kết thúc:
Pool value = tổng tất cả bids (đã trừ phí)
→ getSellPrice() trả về giá cao hơn 2.5 ETH
→ Bán lời ~0.5-1 ETH (tùy phí và pool value)
```

### ⚡ **Yếu tố Thời Gian Quyết Định**

- **Bid quá sớm**: Bị người khác outbid → mất share nhưng không mất tiền (refund)
- **Bid quá muộn**: Không kịp vào block → mất cơ hội
- **Bán quá sớm**: Chưa đóng block đấu giá → giá trị pool chưa tối ưu
- **Bán quá muộn**: Có transaction conflict hoặc price drop

**Timing tối ưu từ code:**
```typescript
// Bid: 21,000 ms trước endBiddingTime
setTimeout(() => bidShare(...), endBiddingTime - currentTime - 21000)

// Sell: 5,000 ms sau endBiddingTime (v5) hoặc đợi block >= endBidBlock (v4)
setTimeout(() => sendSellTx(), _delay)
```

---

## Các Tối Ưu Tốc Độ

### 1. **Pre-signing Transactions** ✅

**Vị trí:** [`_buildAndSignSellTransaction()`](bot-trade.ts#L26-L51)

```typescript
const _buildAndSignSellTransaction = async (subAddress: string, nonce: number = 0) => {
  while (true) {
    try {
      const sellShares = await contract.populateTransaction.sellShares(subAddress, 1);
      const _data = { /* full tx data */ };
      const signedTrx = await wallet.signTransaction(_data);
      return signedTrx;  // Already signed!
    } catch (error) {
      // Retry every 30s
    }
  }
}
```

**Lợi ích:**
- Không mất thời gian signing tại thời điểm thực thi
- Có thể pre-build trước khi cần
- Retry logic đảm bảo luôn có signed tx sẵn sàng

---

### 2. **Nonce Pre-calculation** ✅

**Vị trí:** [`autoSellSharev4()`](bot-trade.ts#L101)

```typescript
const nonce = await wallet.getTransactionCount();
const signSellTrx = await _buildAndSignSellTransaction(subAddress, nonce + 1);
```

**Lợi ích:**
- Biết chính xác nonce sẽ dùng
- Tránh race condition với tx khác
- Có thể gửi ngay khi đúng thời điểm

---

### 3. **Precision Timing với setTimeout** ✅

**Vị trí:** [`autoTrade()`](bot-trade.ts#L53-L62), [`autoSellSharev4()`](bot-trade.ts#L64-86)

```typescript
// Bid exactly 21 seconds before auction ends
setTimeout(async () => {
  await bidShare(subjectAddress, 1, 1);
}, endBiddingTime - currentTime - 21000);

// Sell scheduled at specific delay
setTimeout(async () => {
  const hash = await chiliz_provider.sendTransaction(signSellTrx);
}, _delay);
```

**Lợi ích:**
- Không block event loop
- Chính xác đến milisecond
- CPU không bị busy-wait

---

### 4. **Block-based Synchronization** ✅

**Vị trí:** [`autoSellSharev4()`](bot-trade.ts#L104-122)

```typescript
setTimeout(async () => {
  let currBlock = await chiliz_provider.getBlockNumber();
  let _previos = Date.now();
  while (true) {
    if (Date.now() - _previos >= 1000) {
      if (currBlock >= endBidBlock) break;  // Sell immediately!
      currBlock = await chiliz_provider.getBlockNumber();
    }
  }
  const hash = await chiliz_provider.sendTransaction(signSellTrx);
}, _delay);
```

**Lợi ích:**
- Đảm bảo đấu giá đã kết thúc (block >= endBidBlock)
- Poll mỗi 1s → tiết kiệm RPC calls
- Gửi sell ngay lập tức khi đúng block

---

### 5. **Fixed Gas Parameters (No Gas Estimation)** ✅

**Vị trí:** [`_buildAndSignSellTransaction()`](bot-trade.ts#L36-41), [`bidShare()`](bot-trade.ts#L138)

```typescript
gasLimit: BigNumber.from(300000),  // Fixed, no estimateGas
gasPrice: BigNumber.from(2950000000000),  // 2.95 gwei hardcoded
// Similarly: buy uses 2.68 gwei
```

**Lợi ích:**
- **Quan trọng nhất**: Bỏ qua `estimateGas()` → tiết kiệm 100-300ms mỗi lần
- Gas limit đủ cho swap → không bị out of gas
- Không phụ thuộc vào RPC provider performance

**Rủi ro:** Gas price có thể thấp trong network congestion → tx stuck

---

### 6. **StaticJsonRpcProvider** ✅

**Vị trí:** [L:14](bot-trade.ts#L14)

```typescript
const chiliz_provider = new ethers.providers.StaticJsonRpcProvider(process.env.QUIKNODE_CHZ);
```

**Lợi ích:**
- Reuse connection, không reconnect
- Tối ưu cho read-only operations
- Không có auto-reconnect overhead

---

### 7. **Batch Buy Transactions (Fire-and-Forget)** ✅

**Vị trí:** [`bidShare()`](bot-trade.ts#L133-142)

```typescript
for (let i = 0; i < times; i++) {
  contract.connect(wallet).buyShares(subjectAddress, {
    value: _price,
    gasPrice: BigNumber.from(2680000000000),
    nonce: transactionCount + i
  });
  // NO await! Fire multiple txs simultaneously
}
```

**Lợi ích:**
- Gửi nhiều tx cùng lúc với nonce liên tiếp
- Tăng xác suất có ít nhất 1 tx thành công
- Không đợi response → tiết kiệm thời gian

---

### 8. **Retry Logic với Interval** ✅

**Vị trí:** [`_buildAndSignSellTransaction()`](bot-trade.ts#L28-31)

```typescript
let _previos = Date.now() - 30;
while (true) {
  try {
    if (Date.now() - _previos >= 30) {  // Retry every 30s
      // Build tx...
      return signedTrx;
    }
  } catch (error) {
    console.log("Build fail");
  }
}
```

**Lợi ích:**
- Không bị stuck nếu RPC lỗi
- Poll đều đặn, không spam RPC
- Đảm bảo có tx sẵn sàng

---

### 9. **Minimal RPC Calls** ✅

Bot chỉ gọi RPC khi thực sự cần:
- `getTransactionCount()`: 1 lần trước khi pre-sign
- `getBlockNumber()`: Poll mỗi 1s trong sell phase
- `getBiddingTime()`: 1 lần khi khởi chạy

**Không gọi:**
- `estimateGas()` ← Quan trọng!
- `getGasPrice()` ← Dùng hardcoded
- `call()` để validate ← Bỏ qua

---

### 10. **Hardcoded Constants** ✅

```typescript
const BOOST_MIN_PRICE = 1;
const CA = '0xFaD9Fb76EE13aBFe08F8B17d3898a19902b6f9FB';
const gasPrice: 2950000000000 (sell), 2680000000000 (buy)
const gasLimit: 300000
const chainId: 88888
```

**Lợi ích:**
- Không cần lookup config → instant access
- Tránh parsing/validation overhead
- Predictable behavior

---

**Ước tính tổng tiết kiệm: 500-1000ms** — Với bot arbitrage, **1 giây là cả thế giới**.

### Trade-off:
- **Speed vs Safety**: Không có gas estimation → có thể out-of-gas
- **Speed vs Adaptability**: Gas price cố định → thua cuộc khi network congestion
- **Speed vs Reliability**: Fire-and-forget → không biết tx có thành công

---

## 🚀 **Cải Tiến Tiềm Năng**

1. **Dynamic Gas Price**: Dùng `gasPrice` từ mempool scanner hoặc EIP-1559
2. **Flashbots/MEV**: Gửi private transaction tránh front-running
3. **Parallel Execution**: Chạy nhiều bot instance với different nonces
4. **Profit Tracking**: Log P&L mỗi trade để tối ưu strategy

---

*Version: 1.0 | Last Updated: 2026-04-19*
