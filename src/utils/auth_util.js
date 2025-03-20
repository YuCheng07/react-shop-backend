const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')

dotenv.config()
const SECRET_KEY = process.env.JWT_SECRET

// 生成JWT
const createJWT = (payload) => {
	return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' })
}


// 密碼加密
const hashPassword = async (password, saltRounds) => {
	return await bcrypt.hash(password, saltRounds)
}

// 與加密密碼比對
const comparePassword = async (password, hashPW) => {
	return bcrypt.compare(password, hashPW)
}

module.exports = {
	createJWT,
	hashPassword,
	comparePassword,
}
