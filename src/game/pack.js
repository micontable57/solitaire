import { Card } from "./card.js";
import { each } from "./utils.js";

/**
 * Pack class representing a full deck of 52 cards
 */
export function Pack(backgrounds = []) {
  this.cards = [];
  this.suits = ["hearts", "spades", "diamonds", "clubs"];
  this.backgrounds = backgrounds;

  var count = 0;
  each(
    this.suits,
    function (i, suit) {
      for (var j = 1; j < 14; j++) {
        const index = j - 1 + i * 13; // Índice único para cada carta, 0 a 51

        const bgSrc = this.backgrounds[index % this.backgrounds.length] || null;

        var card = new Card(j, suit, bgSrc);
        card.el.idx = count;
        this.cards.push(card);
        count++;
      }
    },
    this,
  );
}

Pack.prototype.shuffle = function () {
  var m = this.cards.length,
    t,
    i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = this.cards[m];
    this.cards[m] = this.cards[i];
    this.cards[i] = t;

    this.cards[i].el.idx = i;
    this.cards[m].el.idx = m;
  }
};
