'use strict'

const express = require('express')
const mongoose = require('mongoose')
const shortid = require('shortid')
const router = express.Router()

const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: Date
})

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate()
  },
  username: String,
  exercises: [exerciseSchema]
})

const User = mongoose.model('user', userSchema)

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
    { new: true },
    (err, data) => {
      if (err || data.length === 0) return res.json({ error: 'user not found' })

      const { username, _id, exercises } = data
      const exercise = [...exercises].pop()

      res.json({
        _id,
        username,
        exercise
      })
    }
  )
})

router.get('/', (req, res) => {
})

module.exports = router