const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')
const { pickRoomNumbers, getUnavailableRoomNumbersForDate, dateDiff, calcAmtRequestedBeds, calcTotalPrice } = require('../../utils')
const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const { validateUpdateBody } = require('../../middleware/index')

async function updateBooking(body) {

  const { bookingNr, bookingGuests, roomTypes, checkIn, checkOut } = body
  const requestedBeds = calcAmtRequestedBeds(roomTypes)

  if (bookingGuests > requestedBeds) {
    return sendResponse(200, {success: false, message: 'More guests than allowed based on requested rooms'})
  }

  const { Items } = await db.scan({
    TableName: 'rooms'
  }).promise()

  const thisBooking = Items.filter(item => item.bookingNr === bookingNr)

  if (thisBooking.length < 1) {
    return sendResponse(404, { success: false, message: 'No booked rooms with this booking number' })
  }
  const customer = {...thisBooking[0].customer}

  const currentEarliestDate = new Date(thisBooking.reduce((acc, cur) => {
    const curDate = new Date(cur.date)
    if (acc === '') {
      return curDate.getTime() 
    }
    const accDate = new Date(acc)
    return curDate.getTime() < accDate.getTime() ? curDate.getTime() : accDate.getTime()

  }, ''))
  const currentLatestDate = new Date(thisBooking.reduce((acc, cur) => {
    const curDate = new Date(cur.date)
    if (acc === '') {
      return curDate.getTime() 
    }
    const accDate = new Date(acc)
    return curDate.getTime() > accDate.getTime() ? curDate.getTime() : accDate.getTime()

  }, ''))

  const newRequestedCheckInDate = new Date(checkIn)
  const bookedCheckOutDate = new Date(currentLatestDate.toLocaleDateString())
  bookedCheckOutDate.setDate(bookedCheckOutDate.getDate() + 1)
  const newRequestedCheckOutDate = new Date(checkOut)

  const newBookedRooms = []
  const requestedNights = dateDiff(newRequestedCheckInDate, newRequestedCheckOutDate)

  const allRoomsExceptThisBooking = Items.filter(item => item.bookingNr !== bookingNr)

  for (let i = 0; i < requestedNights; i++) {
    const currentDate = new Date(newRequestedCheckInDate.toLocaleDateString())
    currentDate.setDate(currentDate.getDate() + i)

    const unavailableRooms = getUnavailableRoomNumbersForDate(allRoomsExceptThisBooking, currentDate.toLocaleDateString())

    if (unavailableRooms.length + roomTypes.length > 20) {
        return sendResponse(200, { success: false, message: `${currentDate} has less than ${roomTypes.length} rooms available` })
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

  await Promise.all(thisBooking.map(item => 
    db.delete({
        TableName: 'rooms',
        Key: {
          id: item.id
        }
    }).promise()
  ))

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
    checkInDate: moment(newRequestedCheckInDate).format("YYYY-MM-DD"),
    checkOutDate: moment(newRequestedCheckOutDate).format("YYYY-MM-DD"),
    customerName: customer.name
}

  return sendResponse(200, { success: true, updatedConfirmationInfo: {...response} })
}

module.exports.handler = async (event) => {
  console.log(event)
  try {
    validateUpdateBody(JSON.parse(event.body))
    return await updateBooking(JSON.parse(event.body))
      
  } catch (error) {
      return sendResponse(400, error.message)
  }
}
