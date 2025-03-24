const express = require('express')
const router = express.Router()
const db = require('../config/firebase')
const verifyToken = require('../middlewares/verifyToken')

router.post('/orders', verifyToken, async (req, res) => {
	const userId = req.user.id
	try {
		const snapshot = await db.collection('orders').where('id', '==', userId).get()
		const data = snapshot.docs.map((doc) => doc.data())
		if(data){
			const list = data.map(item => {
				return {
					orderId: item.orderId,
					priceTotal: item.priceTotal,
					cartList: item.cartList,
				}
			})
			
			res.status(200).json({
				status: 'success',
				message: '資料獲取成功',
				data: list,
			})
		}else{
			res.status(200).json({
				status: 'success',
				message: '無訂單紀錄',
			})
		}
	} catch (error) {
    res.status(500).json({
			status: 'error',
			message: '資料獲取失敗',
		})
  }
})

module.exports = router
