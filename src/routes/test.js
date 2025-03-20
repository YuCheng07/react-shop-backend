const db = require('../config/firebase')
const router = require('express').Router()
const productData = require('../mock/animeItem_mock.json')
const userData = require('../mock/user_mock.json')

router.post('/add-test-data', async (req, res) => {
  const result = await addData(userData)
  if(result){
    res.send('新增資料完成')
  }else{
    res.send('新增資料失敗')
  }
})

const addData = async (data) => {
  try {
    data.users.forEach(async (item, index) => {
      await db.collection('users').add(item)
    })
    console.log('新增資料完成')
    return true
  }catch (error) {
    console.log(error) 
    return false
  }
}

module.exports = router