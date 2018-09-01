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
      if (err || data.length === 0) return res.json({ error: 'User not found' })

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

router.get('/log', async (req, res) => {
  const { userId, from = null, to = null, limit = 0 } = req.query

  if (userId === '')
    return res.json({ error: 'Missing userId' })

  const fromDate = from ? new Date(from) : null
  const toDate = to ? new Date(to) : null

  const datesAreValid =
    (
      fromDate instanceof Date && fromDate.toString() !== 'Invalid Date'
      || fromDate === null
    )
    && (
      toDate instanceof Date && toDate.toString() !== 'Invalid Date'
      || toDate === null
    )

  if (!datesAreValid)
    return res.json({ error: 'Invalid date(s) provided' })

  if (limit < 0 || limit > Number.MAX_SAFE_INTEGER)
    return res.json({ error: 'Invalid limit' })

  await User.find({ _id: userId }, (err, data) => {
    if (err) {
      res.json(err)
      return res.end()
    }

    const user = data[0]

    if (!user) {
      res.json({ error: 'User not found' })
      return res.end()
    }

    return res.json({
      _id: user._id,
      username: user.username,
      exercises: user.exercises
        .filter(e => fromDate ? new Date(e.date) >= fromDate : true)
        .filter(e => toDate ? new Date(e.date) <= toDate : true)
        .filter((e, i) => i < limit || limit === 0)
    })
  })

})

module.exports = router