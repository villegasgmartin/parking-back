function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
}

function calculateRoundedHours(startTime, endTime) {
    const startMilliseconds = parseTime(startTime);
    const endMilliseconds = parseTime(endTime);

    let diffMilliseconds = endMilliseconds - startMilliseconds;

    // Convertir la diferencia a minutos
    let diffMinutes = diffMilliseconds / (1000 * 60);

    // Convertir minutos a horas y minutos
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    // Redondear hacia arriba si pasa de los 15 minutos
    let roundedHours = hours;
    if (minutes > 15) {
        roundedHours += 1;
    }

    return roundedHours;
}

module.exports = calculateRoundedHours;