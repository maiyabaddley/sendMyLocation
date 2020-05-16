var express = require('express')
var router = express.Router()
var Pusher = require('pusher')
var twilio = require('twilio')

// Find your account sid and auth token in your Twilio account Console.
var client = new twilio(
  'AC62e77facd97a3433832aa535ce2ab9ce',
  '59863c956b2674721a8c2ff9719ababc',
)

// Send the text message.

/* GET home page. */
router.get('/sendlocation', function (req, res, next) {
  const {
    query: { to },
  } = req
  console.log('TO', to, req.query)
  client.messages.create({
    to,
    from: '+12073604695',
    body: 'https://maiyabaddley.github.io/sendlocation',
  })

  res.send({
    status: 'WOW',
  })
})

var pusher = new Pusher({
  appId: '1001976',
  key: 'c89ddfcb850d146a202a',
  secret: 'b4dc6883981a88f0f09a',
  cluster: 'us3',
  encrypted: true,
})

/* GET home page. */
router.get('/pushlocation', function (req, res, next) {
  const {
    query: { lat, lng },
  } = req

  pusher.trigger('location', 'latlng', { lat, lng })

  res.send({
    status: 'WOW',
  })
})

module.exports = router
