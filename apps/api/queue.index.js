const path = require('path')

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
})
require('@babel/register')
require('./src/queue')
