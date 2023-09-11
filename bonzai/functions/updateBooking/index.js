const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')

async function updateBooking(body) {
    const { bookingNr, guests, rooms, dates } = body
    await db.update({
      TableName: 'rooms-db',
      Key: { bookingNr },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: 'set done = :done',
      ExpressionAttributeValues: {
        ':done': done
      }
    }).promise()

    return sendResponse(200, { success: true })
  }

module.exports.handler = async (event) => {
    console.log(event)
    try {
        return await updateBooking(JSON.parse(event.body))
        
    } catch (error) {
        return sendResponse(400, error.message)
    }
};
