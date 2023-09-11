const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')
const { v4: uuidv4 } = require('uuid');


async function postBooking(body) {
    const { task } = body
    const item = { id: uuidv4(), task: task, done: false}
    await db.put({
        TableName: 'todos-db',
        Item: {...item}
      }).promise()
    return sendResponse(200, { success: true, message: 'Booking created!', booking: {...item} })
}

module.exports.handler = async (event) => {
    console.log(event)
    try {
        return await postBooking(JSON.parse(event.body))
    } catch (error) {
        return sendResponse(400, error.message)
    }
};


