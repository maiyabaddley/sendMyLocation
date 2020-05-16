var express = require('express')
var twilio = require('twilio')

// Find your account sid and auth token in your Twilio account Console.
var client = new twilio(
  'AC62e77facd97a3433832aa535ce2ab9ce',
  '59863c956b2674721a8c2ff9719ababc',
)

// Send the text message.
client.messages.create({
  to: '+18016447540',
  from: '+12073604695',
  body: 'It worked!',
})
