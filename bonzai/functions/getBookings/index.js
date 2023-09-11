const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')

async function getBookings() {
    const roomsFromDb = await db.scan({
        TableName: 'rooms-db'
    }).promise()
    
    return sendResponse(200, { success: true })
}

module.exports.handler = async (event) => {
    console.log(event)
    try {
        return await getBookings()
    } catch (error) {
        return sendResponse(400, error.message)
    }
};
