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

  const fromDate = new Date(from)
  const toDate = new Date(to)

  if (!(fromDate instanceof Date) && from !== null || !(toDate instanceof Date) && to !== null)
    return res.json({ error: 'Invalid date(s) provided' })

  if (limit < 0 || limit > Number.MAX_SAFE_INTEGER)
    return res.json({ error: 'Invalid limit' })

  let user
  await User.find({ _id: userId }, (err, data) => {
    if (err) {
      res.json(err)
      return res.end()
    }

    user = data[0]
  })

  if (!user) return res.json({ error: 'User not found' })

  const exercises = user.exercises
    .filter(e => e.date >= fromDate)
    .filter(e => e.date <= toDate)
    .filter((e, i) => i <= limit || limit === 0)

  console.log(exercises)
  return res.json(exercises)

  // GET /api/exercise/log?{userId}[&from][&to][&limit]
  // { } = required, [ ] = optional

  // from, to = dates (yyyy-mm-dd); limit = number

  const expected_result = {
    _id: '',
    username: '',
    exercises: [
      { description: '', duration: '', date: '' }
    ]
  }
})

module.exports = router