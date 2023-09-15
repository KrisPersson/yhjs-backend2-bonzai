const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')
const { dateDiff } = require('../../utils')
const moment = require('moment')

async function getBookings() {
    const { Items } = await db.scan({
        TableName: 'rooms'
    }).promise()

    let bookings = {}
    let parsedBookings = []

    Items.forEach(item => {
        if (!bookings.hasOwnProperty(item.bookingNr)) {
            bookings[item.bookingNr] = []
        }
        bookings[item.bookingNr].push(item)
    })

    for (const booking in bookings) {

        let parsedBooking = {
            bookingNr: bookings[booking][0].bookingNr,
            checkIn: '',
            checkOut: '',
            numberOfGuests: bookings[booking][0].bookingGuests,
            numberOfRooms: 0,
            customerName: bookings[booking][0].customer.name
        }

        bookings[booking].forEach(item => {
            parsedBooking.checkIn = !parsedBooking.checkIn ? item.date : !moment(new Date(item.date)).isAfter(new Date(parsedBooking.checkIn)) ? item.date : parsedBooking.checkIn
            parsedBooking.checkOut = !parsedBooking.checkOut ? item.date : moment(new Date(item.date)).isAfter(new Date(parsedBooking.checkOut)) ? item.date : parsedBooking.checkOut
        })

        parsedBooking.checkOut = moment(parsedBooking.checkOut).add(1, 'day').format("YYYY-MM-DD")

        const numberOfNights = dateDiff(new Date(parsedBooking.checkIn), new Date(parsedBooking.checkOut))
        const numberOfItems = bookings[booking].length
        parsedBooking.numberOfRooms = numberOfItems / numberOfNights
        parsedBookings.push({...parsedBooking})
    }

    return sendResponse(200, { success: true, bookings: [...parsedBookings] })
}

module.exports.handler = async (event) => {
    console.log(event)
    try {
        return await getBookings()
    } catch (error) {
        return sendResponse(400, error.message)
    }
}