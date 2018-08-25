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

router.post('/add', (req, res) => {
})

router.get('/', (req, res) => {
})

module.exports = router