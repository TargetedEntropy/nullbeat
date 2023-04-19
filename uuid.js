
const dash = require('add-dashes-to-uuid')
const MojangAPI = require('mojang-api')

function uuid (username, callback) {

  const date = new Date()
  MojangAPI.uuidAt(username, date, function (err, res) {
    if (err) console.log(`err: ${err}`)
    else var dashuuid = dash(res.id)
    callback(dashuuid)
  })
}

uuid("usernamegoeshere", (id) => {
  console.log(id)
})