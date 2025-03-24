const express = require('express')
const router = express.Router()
const db = require('../config/firebase')
const verifyToken = require('../middlewares/verifyToken')

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

router.post('/favorite', verifyToken, async (req, res) => {
	const userId = req.user.id

	try {
		const snapshot = await db
			.collection('users')
			.where('id', '==', userId)
			.get()
		const data = snapshot.docs.map((doc) => doc.data())
		const favoriteArr = data[0].favorite
		const productsSnapshot = await db.collection('products').get()
		const productsData = productsSnapshot.docs.map((doc) => doc.data())
		const favoriteItems = []
		for (let i = 0; i < favoriteArr.length; i++) {
			productsData.forEach((item) => {
				if (item.id === favoriteArr[i]) {
					favoriteItems.push(item)
				}
			})
		}

		res.status(200).json({
			status: 'success',
			message: '資料獲取成功',
			data: favoriteItems,
		})
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: '資料獲取失敗',
		})
	}
})

router.post('/favorite/:productId', verifyToken, async (req, res) => {
	const userId = req.user.id
	const productId = parseInt(req.params.productId)

	try {
		const snapshot = await db
			.collection('users')
			.where('id', '==', userId)
			.get()
		const data = snapshot.docs.map((doc) => doc.data())
		const favoriteArr = data[0].favorite

		const isAlready = favoriteArr.find((item) => item === productId)

		if (isAlready) {
			const newFavoriteArr = favoriteArr.filter((item) => item !== productId)
			await snapshot.docs[0].ref.update({
				favorite: newFavoriteArr,
			})
			res.status(200).json({
				status: 'success',
				message: '成功移除收藏',
			})
		} else {
			await snapshot.docs[0].ref.update({
				favorite: [...favoriteArr, productId],
			})

			res.status(200).json({
				status: 'success',
				message: '成功加入收藏',
			})
		}
		const productsSnapshot = await db.collection('products').get()
		const productsData = productsSnapshot.docs.map((doc) => doc.data())
		const favoriteItems = []
		for (let i = 0; i < favoriteArr.length; i++) {
			productsData.forEach((item) => {
				if (item.id === favoriteArr[i]) {
					favoriteItems.push(item)
				}
			})
		}
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: '操作失敗',
		})
	}
})

module.exports = router
