const express = require('express')
const router = express.Router()
const db = require('../config/firebase')
const dotenv = require('dotenv')
const {
	createJWT,
	hashPassword,
	comparePassword,
} = require('../utils/auth_util')
dotenv.config()
const FRONTEND_URL = process.env.FRONTEND_URL
const LINE_CLIENT_ID = process.env.LINE_CLIENT_ID
const LINE_SECRET_KEY = process.env.LINE_SECRET_KEY

// LINE登入 使用授權code交換access token來獲取用戶資訊並新增用戶資料到資料庫 OR 有用戶資料的話直接登入
router.post('/login/line', async (req, res) => {
	const { code, state } = req.body
	const data = await fetchAccessToken(code, state)

	if (data) {
		const userInfo = await fetchUserInfo(data.access_token)
		const userName = userInfo.name
		const userId = userInfo.sub

		try {
			const snapshot = await db
				.collection('users')
				.where('line_id', '==', userId)
				.get()

			if (snapshot.empty) {
				const allUsers = await db.collection('users').get()
				const idArray = allUsers.docs.map((item) => item.data().id)
				const maxId = Math.max(...idArray, 0)

				const userData = {
					createdAt: Date.now().toString(),
					email: '',
					id: maxId + 1,
					name: userName,
					password: '',
					role: 'user',
					line_id: userId,
					login_type: 'line',
				}

				try {
					const newUser = await db.collection('users').add(userData)
					const newUserData = await newUser.get()

					const payload = {
						id: newUserData.data().id,
						name: newUserData.data().name,
						role: newUserData.data().role,
					}
					const token = createJWT(payload)
					res.status(200).json({
						status: 'success',
						message: '帳號註冊成功',
						data: { token: token },
					})
				} catch (error) {
					res.status(500).json({
						status: 'error',
						message: '帳號註冊失敗',
					})
				}
			} else {
				const user = snapshot.docs[0].data()
				const payload = {
					id: user.id,
					name: user.name,
					role: user.role,
				}
				const token = createJWT(payload)
				res.status(200).json({
					status: 'success',
					message: '登入成功',
					data: { token: token },
				})
			}
		} catch (error) {
			res.status(500).json({
				status: 'error',
				message: '帳號註冊失敗x8',
			})
		}
	} else {
		res.status(500).json({
			status: 'error',
			message: '獲取line token失敗',
		})
	}
})

// 與LINE交換TOKEN
const fetchAccessToken = async (code, state) => {
	const params = `grant_type=authorization_code&code=${code}&redirect_uri=${FRONTEND_URL}/line-auth&client_id=${LINE_CLIENT_ID}&client_secret=${LINE_SECRET_KEY}`
	try {
		const apiRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params,
		})

		if (apiRes.status === 200) {
			const data = await apiRes.json()
			return data
		}
	} catch (error) {
		console.log(error)
	}
}

// 獲取LINE用戶資訊
const fetchUserInfo = async (access_token) => {
	try {
		const apiRes = await fetch('https://api.line.me/oauth2/v2.1/userinfo', {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		})
		if (apiRes.status === 200) {
			const data = await apiRes.json()
			return data
		}
	} catch (error) {
		console.log(error)
	}
}

module.exports = router
