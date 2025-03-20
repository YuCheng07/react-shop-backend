const express = require('express')
const router = express.Router()
const db = require('../config/firebase')
const { createJWT, hashPassword, comparePassword } = require('../utils/auth_util')

router.post('/signup', async (req, res) => {
	const { email, password } = req.body
	try {
		const snapshot = await db
			.collection('users')
			.where('email', '==', email)
			.get()
		if (snapshot.empty) {
			const allUsers = await db.collection('users').get()
			const idArray = allUsers.docs.map((item) => item.data().id)
			const maxId = Math.max(...idArray, 0)
			const hashPW = await hashPassword(password, 10)

			const userData = {
				createdAt: Date.now().toString(),
				email: email,
				id: maxId + 1,
				name: '',
				password: hashPW,
				role: 'user',
        login_type: 'origin'
			}

			const newUser = await db.collection('users').add(userData)
			if (newUser.id) {
				res.status(200).json({
					status: 'success',
					message: '帳號註冊成功',
				})
			} else {
				res.status(500).json({
					status: 'error',
					message: '帳號註冊失敗',
				})
			}
		} else {
			res.status(200).json({
				status: 'error',
				message: '此信箱已註冊過',
			})
		}
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: '帳號註冊失敗x8',
		})
	}
})

router.post('/login', async (req, res) => {
	const { email, password } = req.body
	try {
		const snapshot = await db
			.collection('users')
			.where('email', '==', email)
			.get()
		if (!snapshot.empty) {
			const user = snapshot.docs[0].data()
			const isCorrect = await comparePassword(password, user.password)
      const payload = {
        id: user.id,
        name: user.name,
        role: user.role,
      }
      const token = createJWT(payload)
      
			if (isCorrect) {
				res.status(200).json({
					status: 'success',
					message: '登入成功',
          data: { token: token }
				})
			} else {
				res.status(200).json({
					status: 'error',
					message: '密碼錯誤',
				})
			}
		} else {
			res.status(200).json({
				status: 'error',
				message: '無此帳號',
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
