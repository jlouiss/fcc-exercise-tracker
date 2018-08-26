'use strict'

const express = require('express')
const mongoose = require('mongoose')
const shortid = require('shortid')
const router = express.Router()

const User = mongoose.model('user', new mongoose.Schema({
  username: String,
  _id: {
    type: String,
    default: shortid.generate()
  }
}))

router.post('/new-user',
  async function checkUserAlreadyExists(req, res, next) {
    await User.find({ username: req.body.username }, (err, data) => {
      if (err) res.json(err)

      if (data.length === 0)
        next()
      else
        res.json({ error: 'username already exists' })
    })
  },
  async (req, res) => {
    await User.create({ username: req.body.username }, (err, data) => {
      const { username, _id } = data
      res.json({ username, _id })
    })
  }
)

router.post('/add', async (req, res) => {
  const { description, duration, date } = req.body
  const exercise = { description, duration, date }

  await User.findOneAndUpdate(
    { _id: req.body.userId },
    { $push: { exercises: exercise } },
    (err, data) => {
      if (err || data.length === 0) return res.json({ error: 'user not found' })
      else res.json(data)
    }
  )
})

router.get('/', (req, res) => {
})

module.exports = router