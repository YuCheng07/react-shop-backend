const express = require('express')
const router = express.Router()
const db = require('../config/firebase')
const verifyToken = require('../middlewares/verifyToken')

router.get('/users', async (req, res) => {
	try {
		const snapshot = await db.collection('users').get()
		const data = snapshot.docs.map((doc) => doc.data())
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

module.exports = router
