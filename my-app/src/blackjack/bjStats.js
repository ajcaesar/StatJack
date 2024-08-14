const calculateDealerOdds = (dealerCards, deck) => {
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

    let counts = new Array(6).fill(0);
    let zeros = new Array(10).fill(0); // Index 0-9 for card values 1-10
    for (let card of deck) {
        zeros[conversion[card.value] - 1] += 1;
    }

    let cds = [];
    for (let cd of dealerCards) {
        cds = [...cds, conversion[cd.value]];
    }

    calcRecursive(cds, zeros, 1, counts, len);
  
    // const totalOutcomes = sumArr(counts);
        const totalOutcomes = 1;
     return counts.map(val => val / totalOutcomes);
};

function calcRecursive(dealerCards, arr, prob, probsArr, deckLen) {
    let sum = sumArr(dealerCards);
    
    // Handle ace being 1 or 11
    if (dealerCards.includes(1) && sum <= 11) {
        sum += 10; // Consider ace as 11
    }
    
    if (sum > 21) {
        probsArr[5] += prob; // Bust
        return;
      } else if (sum >= 17) {
        probsArr[sum - 17] += prob; // Store probability for 17-21
        return;
      }

    for (let i = 0; i < 10; i++) {
        if (arr[i] > 0) {
            let newArr = arr.slice(); // Copy array
            newArr[i] -= 1;
            let newProb = prob * (arr[i] / deckLen);
            calcRecursive(dealerCards.concat(i + 1), newArr, newProb, probsArr, deckLen - 1);
        }
    }
}

const sumArr = (arr) => {
    return arr.reduce((sum, num) => sum + num, 0);
};

export default calculateDealerOdds;