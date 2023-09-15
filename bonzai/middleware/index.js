const validator = require('validator')
const moment = require('moment')

function validatePostBody(body) {
    const { bookingGuests, roomTypes, checkIn, checkOut, customer } = body

    if (!bookingGuests || bookingGuests < 1 || typeof bookingGuests !== "number") {
        throw new Error('Wrong input. bookingGuests is required to be a number above 0')
    }
    const validRoomTypes = ['enkel', 'dubbel', 'svit']
    if (!roomTypes || roomTypes.length < 1 || !roomTypes.every(room => typeof room === 'string') || !roomTypes.every(room => validRoomTypes.includes(room)) ) {
        throw new Error('Wrong input. roomTypes must have at least one entry, and entries must all be strings, and be either "enkel", "dubbel", or "svit"')
    }
    const dateCheckIn = new Date(checkIn)
    if (!checkIn || typeof checkIn !== "string" || dateCheckIn.toLocaleDateString() === 'Invalid Date') {
        throw new Error('Wrong input. checkIn is required to be of type string and be a valid date format')
    }
    const dateCheckOut = new Date(checkOut)
    if (!checkOut || typeof checkOut !== "string" || dateCheckOut.toLocaleDateString() === 'Invalid Date') {
        throw new Error('Wrong input. checkOut is required to be of type string and be a valid date format')
    }
    if (moment(dateCheckIn).isAfter(dateCheckOut)) {
        throw new Error('Check-out date must be a later date than check-in date')
    }
    const todaysDate = new Date()
    if (moment(todaysDate).isAfter(dateCheckIn)) {
        throw new Error('Requested Check-in date has already passed')
    }
    if (!customer.name || !customer.email || typeof customer.name !== 'string' || typeof customer.email !== 'string') {
        throw new Error('Customer must be an object with the properties "name" and "email" which must both be strings')
    }
    if (!validator.isEmail(customer.email)) {
        throw new Error('Email must be in email-format')
    }
    
}

function validateUpdateBody(body) {
    const { bookingGuests, roomTypes, checkIn, checkOut, bookingNr } = body

    if (!bookingNr || typeof bookingNr !== 'string') {
        throw new Error('Wrong input. bookingNr is required and must be a string')
    }
    if (!bookingGuests || bookingGuests < 1 || typeof bookingGuests !== "number") {
        throw new Error('Wrong input. bookingGuests is required to be a number above 0')
    }
    const validRoomTypes = ['enkel', 'dubbel', 'svit']
    if (!roomTypes || roomTypes.length < 1 || !roomTypes.every(room => typeof room === 'string') || !roomTypes.every(room => validRoomTypes.includes(room)) ) {
        throw new Error('Wrong input. roomTypes must have at least one entry, and entries must all be strings, and be either "enkel", "dubbel", or "svit"')
    }
    const dateCheckIn = new Date(checkIn)
    if (!checkIn || typeof checkIn !== "string" || dateCheckIn.toLocaleDateString() === 'Invalid Date') {
        throw new Error('Wrong input. checkIn is required to be of type string and be a valid date format')
    }
    const dateCheckOut = new Date(checkOut)
    if (!checkOut || typeof checkOut !== "string" || dateCheckOut.toLocaleDateString() === 'Invalid Date') {
        throw new Error('Wrong input. checkOut is required to be of type string and be a valid date format')
    }
    if (moment(dateCheckIn).isAfter(dateCheckOut)) {
        throw new Error('Check-out date must be a later date than check-in date')
    }
    const todaysDate = new Date()
    if (moment(todaysDate).isAfter(dateCheckIn)) {
        throw new Error('Requested Check-in date has already passed')
    }
}

function validateDeleteBody(body) {
    const { bookingNr } = body
    if (!bookingNr || typeof bookingNr !== 'string') {
        throw new Error('Wrong input. bookingNr is required and must be a string')
    }
}

module.exports = { validatePostBody, validateUpdateBody, validateDeleteBody }
