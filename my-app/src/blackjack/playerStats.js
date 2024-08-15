const calculatePlayerOdds = (cards, deck, numTimes) => {
    // console.log(cards[0].value);
    // console.log(deck.length);
    const len = deck.length;
    const conversion = {
        'ace': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'jack': 10,
        'queen': 10,
        'king': 10
    };

    let hand1 = [];
    for (let card of cards) {
        hand1.push(conversion[card.value])
    }

    let zeros = new Array(10).fill(0); // Index 0-9 for card values 1-10
    let odds = new Array(22).fill(0); // Array to store odds for scores 1-21 and bust

    // Fill zeros array with the count of each card value in the deck
    for (let card of deck) {
        zeros[conversion[card.value] - 1] += 1;
    }
    // console.log('zeros: ' + zeros);

    // Start the recursive function to calculate odds
    recurFunc(hand1, zeros, odds, 1, 0, numTimes, len);
    // console.log(odds);

    return odds;
};

function recurFunc(hand, zeros, ods, prob, times, numTimes, length) {
    if (times >= numTimes || sumArr(hand) > 21) {
        let sum = sumArr(hand);
        if (hand.includes(1) && sum <= 11) {
            sum += 10; // Consider ace as 11 if it doesn't bust
        }
        if (sum <= 21) {
            ods[sum - 1] += prob;
            return; // Update odds for valid scores
        } else {
            ods[21] += prob;
            return; // Update odds for bust
        }
    }

    for (let i = 0; i < 10; i++) { // Index 0-9 for card values 1-10
        if (zeros[i] > 0) {
            let newHand = [...hand, i + 1];
            let newZeros = zeros.slice();
            let newProb = prob * (zeros[i] / length);

            newZeros[i] -= 1;
            recurFunc(newHand, newZeros, ods, newProb, times + 1, numTimes, length - 1);
        }
    }
}

const sumArr = (arr) => {
    return arr.reduce((sum, num) => sum + num, 0);
};

export default calculatePlayerOdds;
