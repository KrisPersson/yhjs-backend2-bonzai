const { sendResponse } = require('../../responses/index')
const { db } = require('../../services/db')

async function getBookings() {
    const { Items } = await db.scan({
        TableName: 'rooms'
    }).promise()

    let datesArray = [], filteredBookingArray = [], filtered = [], bookingGuests, bookingName, bookedRooms = 0;

    // Plockar ut alla bokningsnummer, och plockar ut datum ur databassvaret och "styckar upp" dem i checkIn och checkOut.
    for (const element of Items) {
        filtered = Items.filter((item) => {
            return item.bookingNr === element.bookingNr;
        });

        for (const item of filtered) {
            datesArray.push(item.date);
            bookingGuests = item.bookingGuests;
            bookedRooms += 1;
            bookingName = item.customer.name
        }

        // "Fullösning" - Av någon anledning jag inte orkade undersöka så dubbleras bookedRooms till de dubbla, så jag halverar helt sonika värdet
        bookedRooms /= 2;

        // Sorterar datumen i rätt ordning och sätter checkIn till första värdet i arrayen och checkOut till sista värdet i arrayen
        datesArray.sort();
        let checkIn = datesArray[0];
        let checkOut = datesArray[datesArray.length - 1]

        // Den array som skickas tillbaka till frontend
        filteredBookingArray.push({ bookingNr: element.bookingNr, checkIn: checkIn, checkOut: checkOut, bookedGuests: bookingGuests, bookedRooms: bookedRooms, bookingName: bookingName })

        datesArray = [];
        bookedRooms = 0;
    }

    // Filtrerar ut alla "rumsdubbletter" och pushar till filteredBookingArray.
    filteredBookingArray = filteredBookingArray.filter((obj, index) => {
        return index === filteredBookingArray.findIndex(o => obj.bookingNr === o.bookingNr);
    });

    return sendResponse(200, { success: true, message: 'Booked rooms', bookings: filteredBookingArray })
}

module.exports.handler = async (event) => {
    console.log(event)
    try {
        return await getBookings()
    } catch (error) {
        return sendResponse(400, error.message)
    }
};