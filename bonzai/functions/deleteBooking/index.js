const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')
const moment = require('moment')
const { validateDeleteBody } = require('../../middleware/index')

async function deleteBooking(body) {
    const { bookingNr } = body

    const { Items } = await db.scan({
        TableName: 'rooms'
    }).promise()

    const bookingToDelete = Items.filter(item => item.bookingNr === bookingNr)
    if (bookingToDelete.length < 1) return sendResponse(404, { success: false, message: 'No booking with provided booking number could be found' } )
    const dateArr = []
    const diffArr = []
    const cancelDate = moment().format('YYYY-MM-DD')
    bookingToDelete.map((item) => {
        const datesInBooking = moment(item.date).format('YYYY-MM-DD')
        dateArr.push(datesInBooking)
    })
    dateArr.map((item) => {
        const checkDiff = moment(item).diff(cancelDate, 'days')
        if (checkDiff < 2) {
            diffArr.push(checkDiff)
        }
    })
    
    if (diffArr.length > 0) {
        return sendResponse(200, {success: false, message: 'less than two days until checkin'})
    }
    
    await Promise.all(bookingToDelete.map(item =>
        db.delete({
            TableName: 'rooms',
            Key: {
                id: item.id
            }
        }).promise()
    ))
    return sendResponse(200, { success: true, message: 'Booking successfully deleted' })
}

module.exports.handler = async (event) => {
    console.log(event)
    try {
        validateDeleteBody(JSON.parse(event.body))
        return await deleteBooking(JSON.parse(event.body))
    } catch (error) {
        return sendResponse(400, error.message)
    }
};
