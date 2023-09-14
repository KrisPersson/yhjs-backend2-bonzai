const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')
const moment = require('moment')

async function deleteBooking(body) {
    const { bookingNr } = body

    const { Items } = await db.scan({
        TableName: 'rooms'
    }).promise()

    const bookingToDelete = Items.filter(item => item.bookingNr === bookingNr)
    const dateArr = []
    const diffArr = []
    const cancelDate = moment().format('YYYY/MM/DD')
    bookingToDelete.map((item) => {
        const datesInBooking = moment(item.date).format('YYYY/MM/DD')
        dateArr.push(datesInBooking)
    })
    console.log(dateArr)
    dateArr.map((item) => {
        const checkDiff = moment(item).diff(cancelDate, 'days')
        if (checkDiff < 2) {
            diffArr.push(checkDiff)
        }
    })
    console.log(diffArr)
    
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
