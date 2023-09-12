function dateDiff(first, second) {        
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

function getUnavailableRoomNumbersForDate(itemsFromDb, date) {
    
    const dateObjectDate = new Date(date)

    const roomNumbersAlreadyTaken = []
    itemsFromDb.forEach(room => {
        const roomDate = new Date(room.date)

        if (dateObjectDate.toLocaleDateString() === roomDate.toLocaleDateString()) {
            roomNumbersAlreadyTaken.push(room.roomNumber)
        }
    })
    return roomNumbersAlreadyTaken
}

function pickRoomNumbers(unavailableRooms, requestedAmtRooms) {
    const pickedNumbers = []
    for (let i = 1; i <= 20 && pickedNumbers.length < requestedAmtRooms; i++) {
        if (!unavailableRooms.includes(i)) {
            pickedNumbers.push(i)
        }
    }
    return pickedNumbers
}

function calcAmtRequestedBeds(roomTypes) {
    return roomTypes.reduce((acc, cur) => {
        if (cur === "enkel") {
            return acc + 1
        } else if (cur === "dubbel") {
            return acc + 2
        } else if (cur === "svit") {
            return acc + 3
        } else {
            return acc + 0
        }
    }, 0)
}

module.exports = { dateDiff, getUnavailableRoomNumbersForDate, pickRoomNumbers, calcAmtRequestedBeds }
