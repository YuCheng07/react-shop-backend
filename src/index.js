const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')

app.use(express.json());
app.use(cors())

app.use('/api', require('./routes/products'))
app.use('/api', require('./routes/users'))
app.use('/api', require('./routes/auth'))
app.use('/api', require('./routes/line-auth'))
app.use('/api', require('./routes/google-auth'))
app.use('/api', require('./routes/payment'))
// app.use('/api', require('./routes/test'))

app.listen(port,  () => {
	console.log('Server is up on port ' + port)
})
