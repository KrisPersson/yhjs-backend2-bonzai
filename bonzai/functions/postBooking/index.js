const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')
const { v4: uuidv4 } = require('uuid')
const { pickRoomNumbers, getUnavailableRoomNumbersForDate, dateDiff, calcAmtRequestedBeds, calcTotalPrice } = require('../../utils')
const moment = require('moment')


async function postBooking(body) {
    const { bookingGuests, roomTypes, checkIn, checkOut, customer } = body

    const requestedBeds = calcAmtRequestedBeds(roomTypes)

    if (bookingGuests > requestedBeds) {
        return sendResponse(200, {success: false, message: 'More guests than allowed based on requested rooms'})
    }

    const allBookedRoomsFromDb = await db.scan({
        TableName: 'rooms'
    }).promise()

    const dateCheckIn = new Date(checkIn)
    const dateCheckOut = new Date(checkOut)
    const requestedNights = dateDiff(dateCheckIn, dateCheckOut)

    const newBookedRooms = []
    const bookingNr = uuidv4()

    for (let i = 0; i < requestedNights; i++) {
        const currentDate = new Date(checkIn)
        currentDate.setDate(currentDate.getDate() + i)

        const unavailableRooms = getUnavailableRoomNumbersForDate(allBookedRoomsFromDb.Items, currentDate.toLocaleDateString())

        if (unavailableRooms.length >= 20) {
            return sendResponse(200, { success: false, message: `${moment(currentDate).format("YYYY-MM-DD")} is already fully booked` })
        } else if (unavailableRooms.length + roomTypes.length > 20) {
            return sendResponse(200, { success: false, message: `${moment(currentDate).format("YYYY-MM-DD")} has less than ${roomTypes.length} rooms available` })
        }
        const chosenRoomNumbers = pickRoomNumbers(unavailableRooms, roomTypes.length)

        roomTypes.forEach((room, i) => {

            newBookedRooms.push({
                id: uuidv4(),
                bookingNr: bookingNr,
                date: moment(currentDate).format("YYYY-MM-DD"),
                roomNumber: chosenRoomNumbers[i],
                roomType: room,
                customer: {...customer},
                bookingGuests: bookingGuests,
                price: room === 'enkel' ? 500 : room === 'dubbel' ? 1000 : 1500
            })
        })
    }

    const newBookedRoomsInRequestFormat = newBookedRooms.map(item => {
        return { PutRequest: { Item: {...item}} }
    })

    await db.batchWrite({
        RequestItems: {
            "rooms": [...newBookedRoomsInRequestFormat]
      }
    } ).promise()

    const response = {
        bookingNr,
        numberOfGuests: bookingGuests,
        numberOfRooms: roomTypes.length,
        priceTotal: calcTotalPrice(roomTypes) * requestedNights,
        checkInDate: moment(dateCheckIn).format("YYYY-MM-DD"),
        checkOutDate: moment(dateCheckOut).format("YYYY-MM-DD"),
        customerName: customer.name
    }

    return sendResponse(200, { 
        success: true, 
        message: 'Booking created!', 
        confirmationInfo: {...response} 
    })
}

module.exports.handler = async (event) => {
    console.log(event)
    try {
        return await postBooking(JSON.parse(event.body))
    } catch (error) {
        return sendResponse(400, error.message)
    }   
};
