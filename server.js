'use strict'

require('dotenv').config()

const app = require('./app')
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
