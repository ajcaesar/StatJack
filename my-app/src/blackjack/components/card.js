import React from 'react';
import backCardSrc from './svg_playing_cards/backs/castle.svg';
import spades_ace from './svg_playing_cards/fronts/spades_ace.svg'
import spades_2 from './svg_playing_cards/fronts/spades_2.svg'
import spades_3 from './svg_playing_cards/fronts/spades_3.svg'
import spades_4 from './svg_playing_cards/fronts/spades_4.svg'
import spades_5 from './svg_playing_cards/fronts/spades_5.svg'
import spades_6 from './svg_playing_cards/fronts/spades_6.svg'
import spades_7 from './svg_playing_cards/fronts/spades_7.svg'
import spades_8 from './svg_playing_cards/fronts/spades_8.svg'
import spades_9 from './svg_playing_cards/fronts/spades_9.svg'
import spades_10 from './svg_playing_cards/fronts/spades_10.svg'
import spades_jack from './svg_playing_cards/fronts/spades_jack.svg'
import spades_queen from './svg_playing_cards/fronts/spades_queen.svg'
import spades_king from './svg_playing_cards/fronts/spades_king.svg'
import hearts_ace from './svg_playing_cards/fronts/hearts_ace.svg'
import hearts_2 from './svg_playing_cards/fronts/hearts_2.svg'
import hearts_3 from './svg_playing_cards/fronts/hearts_3.svg'
import hearts_4 from './svg_playing_cards/fronts/hearts_4.svg'
import hearts_5 from './svg_playing_cards/fronts/hearts_5.svg'
import hearts_6 from './svg_playing_cards/fronts/hearts_6.svg'
import hearts_7 from './svg_playing_cards/fronts/hearts_7.svg'
import hearts_8 from './svg_playing_cards/fronts/hearts_8.svg'
import hearts_9 from './svg_playing_cards/fronts/hearts_9.svg'
import hearts_10 from './svg_playing_cards/fronts/hearts_10.svg'
import hearts_jack from './svg_playing_cards/fronts/hearts_jack.svg'
import hearts_queen from './svg_playing_cards/fronts/hearts_queen.svg'
import hearts_king from './svg_playing_cards/fronts/hearts_king.svg'
import diamonds_ace from './svg_playing_cards/fronts/diamonds_ace.svg'
import diamonds_2 from './svg_playing_cards/fronts/diamonds_2.svg'
import diamonds_3 from './svg_playing_cards/fronts/diamonds_3.svg'
import diamonds_4 from './svg_playing_cards/fronts/diamonds_4.svg'
import diamonds_5 from './svg_playing_cards/fronts/diamonds_5.svg'
import diamonds_6 from './svg_playing_cards/fronts/diamonds_6.svg'
import diamonds_7 from './svg_playing_cards/fronts/diamonds_7.svg'
import diamonds_8 from './svg_playing_cards/fronts/diamonds_8.svg'
import diamonds_9 from './svg_playing_cards/fronts/diamonds_9.svg'
import diamonds_10 from './svg_playing_cards/fronts/diamonds_10.svg'
import diamonds_jack from './svg_playing_cards/fronts/diamonds_jack.svg'
import diamonds_queen from './svg_playing_cards/fronts/diamonds_queen.svg'
import diamonds_king from './svg_playing_cards/fronts/diamonds_king.svg'
import clubs_ace from './svg_playing_cards/fronts/clubs_ace.svg'
import clubs_2 from './svg_playing_cards/fronts/clubs_2.svg'
import clubs_3 from './svg_playing_cards/fronts/clubs_3.svg'
import clubs_4 from './svg_playing_cards/fronts/clubs_4.svg'
import clubs_5 from './svg_playing_cards/fronts/clubs_5.svg'
import clubs_6 from './svg_playing_cards/fronts/clubs_6.svg'
import clubs_7 from './svg_playing_cards/fronts/clubs_7.svg'
import clubs_8 from './svg_playing_cards/fronts/clubs_8.svg'
import clubs_9 from './svg_playing_cards/fronts/clubs_9.svg'
import clubs_10 from './svg_playing_cards/fronts/clubs_10.svg'
import clubs_jack from './svg_playing_cards/fronts/clubs_jack.svg'
import clubs_queen from './svg_playing_cards/fronts/clubs_queen.svg'
import clubs_king from './svg_playing_cards/fronts/clubs_king.svg'


// const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
// const values = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

// Import all front card images
// const frontCards = {};
// suits.forEach(suit => {
//   values.forEach(value => {
//     frontCards[`${suit}_${value}`] = require(`./svg_playing_cards/fronts/${suit}_${value}.svg`);
//   });
// });

const cardImages = {
    spades: {
      ace: spades_ace,
      2: spades_2,
      3: spades_3,
      4: spades_4,
      5: spades_5,
      6: spades_6,
      7: spades_7,
      8: spades_8,
      9: spades_9,
      10: spades_10,
      jack: spades_jack,
      queen: spades_queen,
      king: spades_king
    },
    hearts: {
      ace: hearts_ace,
      2: hearts_2,
      3: hearts_3,
      4: hearts_4,
      5: hearts_5,
      6: hearts_6,
      7: hearts_7,
      8: hearts_8,
      9: hearts_9,
      10: hearts_10,
      jack: hearts_jack,
      queen: hearts_queen,
      king: hearts_king
    },
    diamonds: {
      ace: diamonds_ace,
      2: diamonds_2,
      3: diamonds_3,
      4: diamonds_4,
      5: diamonds_5,
      6: diamonds_6,
      7: diamonds_7,
      8: diamonds_8,
      9: diamonds_9,
      10: diamonds_10,
      jack: diamonds_jack,
      queen: diamonds_queen,
      king: diamonds_king
    },
    clubs: {
      ace: clubs_ace,
      2: clubs_2,
      3: clubs_3,
      4: clubs_4,
      5: clubs_5,
      6: clubs_6,
      7: clubs_7,
      8: clubs_8,
      9: clubs_9,
      10: clubs_10,
      jack: clubs_jack,
      queen: clubs_queen,
      king: clubs_king
    }
  };

  function Card({ side, suit, value }) {
    let card, cardPath;

    if (side === "front") {
        card = `${suit}_${value}`;
        // Use the value as is, without parsing
        cardPath = cardImages[suit][value];
    } else {
        card = "back of card";
        cardPath = backCardSrc;
    }

    return (
        <div className="card">
            <img src={cardPath} alt={card} />
        </div>
    );
}

export default Card;