const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')

async function deleteBooking(body) {
    const { bookingNr } = body
    await db.delete({
        TableName: 'rooms',
        Key: {
            bookingNr: bookingNr
        }
    }).promise()
    return sendResponse(200, { success: true })
}

module.exports.handler = async (event) => {
    console.log(event)
    try {
        return await deleteBooking(JSON.parse(event.body))
        
    } catch (error) {
        return sendResponse(400, error.message)
    }
};
