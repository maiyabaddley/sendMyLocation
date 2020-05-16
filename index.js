var express = require('express')
var app = express()
var cors = require('cors')
const fs = require('fs')
var bodyParser = require('body-parser')
var Client = require('ftp')
var moment = require('moment')
var _ = require('lodash')
var mysql = require('mysql')
var uuid = require('uuid')
var fetch = require('node-fetch')

var pool = mysql.createPool({
  connectionLimit: 100,
  host: '127.0.0.1',
  user: 'testnetwork',
  password: 'test',
  database: 'testnetwork',
  port: 3307,
})

const baseIterator = (a) => {
  const ret = {}
  Object.keys(a).forEach((b) => {
    _.set(ret, b.replace(/_/g, '.'), a[b])
  })
  return ret
}

var conn

const query = (qry, iterator = baseIterator) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      connection.query(qry, function (error, results, fields) {
        if (error) {
          reject(error)
        } else {
          resolve(results.map(iterator))
        }
      })
    })
  })
}

var corsOptions = {
  origin: true,
  methods: ['GET'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const testConnection = ({ host, username, password, port = 21, path }) => {
  return new Promise((resolve, reject) => {
    var c = new Client()

    if (path) {
      c.on('ready', function () {
        c.listSafe(path, false, function (err, list) {
          console.log('path', path, err, list)
          if (err) {
            resolve({
              error:
                'Successfully connected to FTP Server but could not find path',
            })
            return
          }
          resolve({
            message: 'Successfully connected to FTP Server and found path',
            dir: list,
          })
          return
        })
      })
    } else {
      c.on('greeting', function (message) {
        resolve({ message: 'Successfully connected to FTP Server' })
      })
    }

    c.on('error', function (error) {
      resolve({
        error:
          'Not able to connect to the FTP Server, please check you connection information and retry',
      })
    })

    // connect to localhost:21 as anonymous
    c.connect({
      host: host,
      user: username,
      password: password,
      port,
    })
  })
}
app.use(cors())
app.use(bodyParser.json())

app.get('/api/tms_web_components/ftp_export', (req, res, next) => {
  const config = fs.readFileSync('./config.json')
  setTimeout(() => res.send(config), 1000)
})

app.post('/api/tms_web_components/ftp_export', (req, res, next) => {
  var config = fs.readFileSync('./config.json')
  config = { ...JSON.parse(config), ...req.body }

  testConnection(config.ftpConnectionInfo).then(({ message, error, dir }) => {
    if (message) {
      config.ftpConnectionInfo.lastSuccessfulConnection = moment().utc()
    } else if (error) {
      config.ftpConnectionInfo.lastSuccessfulConnection = null
    }

    fs.writeFileSync(
      './config.json',
      JSON.stringify(config, null, '  '),
      'utf8',
    )
    config = fs.readFileSync('./config.json')
    res.send({
      config: JSON.parse(config),
      connection: { message, error, dir },
    })
  })
})

app.post('/api/tms_web_components/ftp_export/test_ftp', (req, res, next) => {
  const { username, host, password, path, port = 21 } = req.body

  var config = JSON.parse(fs.readFileSync('./config.json'))
  testConnection(req.body).then(({ message, error, dir }) => {
    if (message) {
      config.ftpConnectionInfo.lastSuccessfulConnection = moment().utc()
    } else if (error) {
      config.ftpConnectionInfo.lastSuccessfulConnection = null
    }

    fs.writeFileSync(
      './config.json',
      JSON.stringify(config, null, '  '),
      'utf8',
    )
    res.send({ config: config, connection: { message, error, dir } })
  })
})

app.get(
  '/api/tms_web_components/field_value_options/:formName/:fieldName',
  (req, res, next) => {
    const { formName, fieldName } = req.params
    const values = {
      salvage: {
        dispatching_status: [
          {
            value: 'completed',
            label: 'Completed',
          },
          {
            value: 'dispatching',
            label: 'Dispatching',
          },
          {
            value: 'picking_up',
            label: 'Picking Up',
          },
        ],
      },
      standard: {
        dispatching_status: [
          {
            value: 'completed',
            label: 'Completed',
          },
          {
            value: 'dispatching',
            label: 'Dispatching',
          },
          {
            value: 'picking_up',
            label: 'Picking Up',
          },
        ],
      },
    }
    setTimeout(
      () => res.send(_.get(values, `${formName}.${fieldName}`, [])),
      1000,
    )
  },
)

app.get('/api/tms_web_components/ftp_export/history', (req, res, next) => {
  const { formName, fieldName } = req.params
  const values = [
    {
      timestamp: moment().utc(),
      initiator: 'Bob McGilicutty',
      rowCount: 142,
      successful: true,
      errorMessage: null,
    },
    {
      timestamp: moment('2020/01/22').utc(),
      initiator: 'Bob McGilicutty',
      rowCount: 190,
      successful: true,
      errorMessage: null,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 345,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 345,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 345,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 345,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 345,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 112,
      successful: true,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 456,
      successful: true,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 212,
      successful: true,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 125,
      successful: true,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 125,
      successful: true,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 125,
      successful: true,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 125,
      successful: true,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 125,
      successful: true,
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 123,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 368,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 322,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
    {
      timestamp: moment('2020/01/23').utc(),
      initiator: 'Billy Bob',
      rowCount: 322,
      successful: false,
      errorMessage: 'Could not find folder path',
    },
  ]
  setTimeout(() => res.send(values), 2000)
})

app.get('/api/tms_web_components/ftp_export/preview', (req, res, next) => {
  res.set({
    'Content-Disposition': 'attachment; filename=previewExport.txt',
  })
  setTimeout(() => res.send('preview text'), 3000)
})

app.get('/api/tms_web_components/ftp_export/send', (req, res, next) => {
  setTimeout(
    () =>
      res.send({
        successful: true,
        rowsExported: 142,
        errorMessage: null,
      }),
    1000,
  )
})

app.get('/api/dashboard/config', (req, res, next) => {
  const config = fs.readFileSync('./pref.json')
  setTimeout(() => res.send(JSON.parse(config)), 1500)
})

app.post('/api/dashboard/config', (req, res, next) => {
  const pref = fs.readFileSync('./pref.json')
  let config = { ...JSON.parse(pref), ...req.body }
  fs.writeFileSync('./pref.json', JSON.stringify(config, null, '  '), 'utf8')
  config = fs.readFileSync('./pref.json')
  res.send(JSON.parse(config))
})

app.get('/api/dashboard/groups/:groupBy', async (req, res, next) => {
  const { groupBy = 'branchNumber' } = req.params
  const results = await query(
    `SELECT COUNT(salvage.id) as count, ${groupBy} as value, partner.name as title FROM salvage JOIN partner ON partner.externalId = ${groupBy} GROUP BY ${groupBy}`,
    (a, i) => ({
      ...a,
      id: a.value,
    }),
  )
  res.send(results)
})

app.get('/api/dashboard/trucks', async (req, res, next) => {
  const results = await query(`SELECT node.title as title,
node.nid as id,
vin.vin_value,
tow_type_tax.name as towType,
vehicle.vehicle_make as vehicle_make,
vehicle.vehicle_model as vehicle_model,
year.vehicle_year_0_value as vehicle_year,
color_tax.name as vehicle_color,
license.license_plate_plate as licencePlate_id,
license.license_plate_state as licencePlate_state,
vehicle_type.company_vehicle_type_value as vehicleType,
loc.heading as location_heading,
loc.latitude as location_latitude,
loc.longitude as location_longitude,
loc.timestamp as location_lastUpdated,
loc.speed as location_speed
FROM node 
LEFT JOIN field_data_vin vin ON vin.entity_id = node.nid
LEFT JOIN field_data_vehicle vehicle ON vehicle.entity_id = node.nid
LEFT JOIN field_data_license_plate license ON license.entity_id = node.nid
LEFT JOIN field_data_vehicle_year_0 year ON year.entity_id = node.nid
LEFT JOIN field_data_company_vehicle_type vehicle_type ON vehicle_type.entity_id = node.nid
LEFT JOIN field_data_vehicle_color color ON color.entity_id = node.nid
LEFT JOIN field_data_tow_type tow_type ON tow_type.entity_id = node.nid
LEFT JOIN taxonomy_term_data tow_type_tax ON tow_type_tax.tid = tow_type.tow_type_tid
LEFT JOIN taxonomy_term_data color_tax ON color_tax.tid = color.vehicle_color_tid
LEFT JOIN mobile_location_recent loc ON loc.vehicle_nid = node.nid
WHERE type = 'company_vehicle';`)
  res.send(
    results.map((r) => {
      const d = {}
      Object.keys(r).forEach((key) => {
        const value = r[key]
        _.set(d, key.replace(/_/g, '.'), value)
      })
      return d
    }),
  )
})

app.get('/api/dashboard/drivers', async (req, res, next) => {
  const results = await query(`SELECT users.uid as uid, 
users.name as userName, 
users.mail as email, 
last_name.user_last_name_value as lastName, 
first_name.user_first_name_value as firstName,
cvu.end_timestamp = 0 as inTruck,
cvu.vehicle_nid as vehicleId
from users 
JOIN users_roles ON users.uid = users_roles.uid
JOIN role ON role.rid = users_roles.rid
LEFT JOIN company_vehicle_users cvu ON cvu.uid = users.uid
LEFT JOIN node trucks ON cvu.vehicle_nid = trucks.nid
LEFT JOIN field_data_user_first_name first_name ON users.uid = first_name.entity_id 
LEFT JOIN field_data_user_last_name last_name ON users.uid = last_name.entity_id 
WHERE role.name = 'Driver'
GROUP BY users.uid;`)
  res.send(results)
})

app.get('/api/dashboard/jobs', async (req, res, next) => {
  console.log(req.query)
  const { filter = 'branchNumber:210' } = req.query

  const [where, value] = filter.split(':')
  console.log(filter, where, value)

  const list = value
    .split(',')
    .map((v) => `'${v}'`)
    .join(',')

  let whereClause =
    value && value !== 'null' ? `${where} IN (${list})` : `${where} IS NULL`

  let qry = `SELECT * FROM salvage WHERE ${whereClause}`

  console.log('QUERY', qry)
  const results = await query(qry)
  res.send(results)
})

app.get('/api/dashboard/getDistances', async (req, res, next) => {
  const { anchor, locations, count = 0 } = req.query
  const destIndexes = _.range(1, count - 1).join(';')
  const anchorPath = encodeURIComponent(anchor)
  const locationsPath = encodeURIComponent(locations)
  const destIndexesQuery = encodeURIComponent(destIndexes)
  const url = `http://platform-osrm.omadi-prod.net/table/v1/driving/${anchor};${locations}?sources=0&destinations=${destIndexes}&annotations=distance`
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      const loc = locations.split(';')
      const ret = {}
      json.distances[0].forEach((distance, i) => {
        const lngLat = loc[i]
        ret[lngLat] = (distance * 0.000621371).toFixed(2)
      })
      res.send(ret)
    })
})

// http://platform-osrm.omadi-prod.net

app.listen(8080, (err, address) => {
  console.log(`Listening: 8080`)
})
