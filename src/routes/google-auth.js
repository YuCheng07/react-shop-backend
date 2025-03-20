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
const BASE_URL = process.env.BASE_URL
const FRONTEND_URL = process.env.FRONTEND_URL
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET_KEY = process.env.GOOGLE_CLIENT_SECRET_KEY

router.get('/google/verify-token', async (req, res) => {
	const { code, state } = req.query

	const params = new URLSearchParams({
		code: code,
		client_id: GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET_KEY,
		redirect_uri: `${BASE_URL}/api/google/verify-token`,
		grant_type: 'authorization_code',
	})

	try {
		const response = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params.toString(),
		})
		const { access_token } = await response.json()
    console.log(access_token);
    
		if (access_token) {
			try {
				const response = await fetch(
					'https://www.googleapis.com/oauth2/v2/userinfo',
					{
						method: 'GET',
						headers: {
							Authorization: `Bearer ${access_token}`,
						},
					}
				)
        
        const userInfo = await response.json()
        console.log(userInfo);
        const { email, name } = userInfo
        try {
          const snapshot = await db
            .collection('users')
            .where('email', '==', email)
            .get()
    
          if (snapshot.empty) {
            const allUsers = await db.collection('users').get()
            const idArray = allUsers.docs.map((item) => item.data().id)
            const maxId = Math.max(...idArray, 0)
    
            const userData = {
              createdAt: Date.now().toString(),
              email: email,
              id: maxId + 1,
              name: name,
              password: '',
              role: 'user',
              line_id: '',
              login_type: 'google',
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
              res.redirect(`${FRONTEND_URL}/google-auth?token=${encodeURIComponent(token)}&status=success&message=${encodeURIComponent('帳號註冊成功')}`)
            } catch (error) {
              res.status(500).json({
                status: 'error',
                message: '帳號註冊失敗',
              })
              res.redirect(`${FRONTEND_URL}/google-auth?status=error&message=${encodeURIComponent('帳號註冊失敗')}`)
            }
          } else {
            const user = snapshot.docs[0].data()
            const payload = {
              id: user.id,
              name: user.name,
              role: user.role,
            }
            const token = createJWT(payload)
            res.redirect(`${FRONTEND_URL}/google-auth?token=${encodeURIComponent(token)}&status=success&message=${encodeURIComponent('登入成功')}`)
          }
        } catch (error) {
          res.redirect(`${FRONTEND_URL}/google-auth?status=error&message=${encodeURIComponent('帳號註冊失敗x8')}`)
        }
        
			} catch (error) {
        console.log(error);
        res.redirect(`${FRONTEND_URL}/google-auth?status=error&message=${encodeURIComponent('獲取使用者資訊失敗')}`)
      }
		}
	} catch (error) {
		console.log(error)
    res.redirect(`${FRONTEND_URL}/google-auth?status=error&message=${encodeURIComponent('獲取google token失敗')}`)
	}

	
})

module.exports = router
