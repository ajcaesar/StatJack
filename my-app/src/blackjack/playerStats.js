const calculatePlayerOdds = (cards, deck) => {
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

}