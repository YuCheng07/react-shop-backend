const express = require('express')
const router = express.Router()
const db = require('../config/firebase')
const dotenv = require('dotenv')
dotenv.config()
const crypto = require('crypto');
const NEWEBPAY_HASH_KEY = process.env.NEWEBPAY_HASH_KEY
const NEWEBPAY_HASH_IV = process.env.NEWEBPAY_HASH_IV
const NEWEBPAY_STORE_ID = process.env.NEWEBPAY_STORE_ID
const NEWEBPAY_API_URL = process.env.NEWEBPAY_API_URL
const NEWEBPAY_NOTIFY_URL = process.env.NEWEBPAY_NOTIFY_URL

router.post('/payment/create-order/newebpay', (req, res) => {
	const data = {
    priceTotal: 1500,
  }
  const timestamp = Math.round(new Date().getTime() / 1000)
	const tradeInfo = new URLSearchParams({
		MerchantID: NEWEBPAY_STORE_ID,
    RespondType: 'JSON',
    Timestamp: timestamp,
		Version: '2.0',
		MerchantOrderNo: timestamp,
		Amt: data.priceTotal,
		ItemDesc: '測試商品',
    TradeLimit: 180,
		NotifyURL: NEWEBPAY_NOTIFY_URL,
	}).toString()

  const aesEncryptTradeInfo = aesEncrypt(tradeInfo)
  const shaEncrypt = sha256Hash(aesEncryptTradeInfo)

	res.send(`
    <html>
      <body onload="document.forms[0].submit()">
        <form method="post" action="${NEWEBPAY_API_URL}">
          <input type="hidden" name="MerchantID" value="${NEWEBPAY_STORE_ID}">
          <input type="hidden" name="TradeInfo" value="${aesEncryptTradeInfo}">
          <input type="hidden" name="TradeSha" value="${shaEncrypt}">
          <input type="hidden" name="Version" value="2.0">
        </form>
      </body>
    </html>
  `);
})

router.get('/payment/return/newebpay', (req, res) => {
	console.log(req.body);
  res.send('OK');
})

// AES加密
function aesEncrypt(tradeInfo){
  const cipher = crypto.createCipheriv('aes-256-cbc', NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV)
  let encrypted = cipher.update(tradeInfo, 'utf8', 'hex')
  return encrypted + cipher.final('hex')
}

// SHA256加密
function sha256Hash(tradeInfo) {
  const data = `HashKey=${NEWEBPAY_HASH_KEY}&${tradeInfo}&HashIV=${NEWEBPAY_HASH_IV}`;
  const sha256Res = crypto.createHash('sha256').update(data).digest('hex').toUpperCase();
  return sha256Res
}


module.exports = router
