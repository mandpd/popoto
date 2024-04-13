import logger from "../logger/logger"

/**
 * runner module.
 * @module runner
 */

var runner = {}

runner.createSession = function () {
  if (runner.DRIVER !== undefined) {
    return runner.DRIVER.session({ defaultAccessMode: "READ" })
  } else {
    throw new Error("popoto.runner.DRIVER must be defined")
  }
}
runner.run = function (statements) {
  logger.info("STATEMENTS:" + JSON.stringify(statements))
  try {
    return Promise.all(
      statements.statements.map(async function (s) {
        const response = await fetch("http://localhost:3001/oastapi/dev/njq", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: s.statement,
            parameters: s.parameters,
          }),
        })

        const data = await response.json()
        console.log(`query data: ${JSON.stringify(data)}`)

        return data
      })
    )
  } catch (error) {
    console.error(`Error: ${error}`)
  }
}

// runner.run = function (statements) {
//   logger.info("STATEMENTS:" + JSON.stringify(statements))
//   var session = runner.createSession()

//   return session
//     .readTransaction(function (transaction) {
//       return Promise.all(
//         statements.statements.map(function (s) {
//           return transaction.run({
//             text: s.statement,
//             parameters: s.parameters,
//           })
//         })
//       )
//     })
//     .finally(function () {
//       session.close()
//     })
// }

runner.toObject = function (results) {
  return results.map(function (rs) {
    return rs.records.map(function (r) {
      const obj = {}
      r.keys.forEach((key, i) => {
        obj[key] = key === "count" ? r._fields[i].low : r._fields[i] //  returns bigint values high and low - hi is the high 32 bits and lo is the low 32 bits. Can usually take just the lo value
      })
      return obj
    })
  })
}

// runner.toObject = function (results) {
//   console.log(`results: ${JSON.stringify(results)}`)
//   return results.map(function (rs) {
//     return rs.records.map(function (r) {
//       return r.toObject()
//     })
//   })
// }

export default runner
