const express = require('express')
const router = express.Router()

const db = require('../config/firebase')

router.get('/products', async (req, res) => {
	try {
		const result = await getData()
		const data = result.docs.map((doc) => doc.data())
		res.status(200).json({
			status: 'success',
			message: '資料獲取成功',
			data: data,
		})
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: '資料獲取失敗',
		})
	}
})

// 從資料庫獲取商品資料
const getData = async () => {
	const result = await db.collection('products').get()
	return result
}

// const time = new Date().toISOString()

// console.log("現在時間" + time);
// console.log("現在時間" + time.toLocaleString());

// console.log("現在時間" + Date.now());
// console.log("現在時間" + Date.now());
// console.log("現在時間" + Date.now());
// console.log("現在時間" + new Date());

module.exports = router
