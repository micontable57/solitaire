import { getBackgroundByIndex, isVideo } from "./backgrounds.js";
import { doc, getCardIndex } from "./utils.js";

/**
 * Card class representing a single playing card
 * @param {Number} value - Card value (1-13)
 * @param {String} suit - Card suit (hearts, diamonds, clubs, spades)
 */
export function Card(value, suit, index) {
  this.value = value;
  this.suit = suit;
  this.index = getCardIndex(value, suit);

  this.flipped = false;
  this.picture = this.value > 10;

  switch (this.suit) {
    case "hearts":
    case "diamonds":
      this.color = "red";
      break;
    case "clubs":
    case "spades":
      this.color = "black";
      break;
  }

  var cards = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

  var template = [
    "<div class='front'><div class='value'>",
    cards[this.value - 1],
    "</div><div class='value'>",
    cards[this.value - 1],
    "</div><div class='middle'>",
  ];

  if (!this.picture) {
    for (var i = 0; i < this.value; i++) {
      // template.push("<span></span>");
    }
  }

  template.push("</div></div><div class='rear'></div>");

  // Cria e adiciona o background (imagem ou vídeo)
  const bgSrc = getBackgroundByIndex(this.index);

  let bgElement;

  if (isVideo(bgSrc)) {
    // Cria elemento de vídeo
    bgElement = doc.createElement("video");
    bgElement.src = bgSrc;
    bgElement.autoplay = true;
    bgElement.loop = true;
    bgElement.muted = true;
    bgElement.playsInline = true;
    bgElement.className = "card-background card-background-video";
  } else {
    // Cria elemento de imagem
    bgElement = doc.createElement("img");
    bgElement.src = bgSrc;
    bgElement.className = "card-background card-background-image";
  }

  bgElement.style.cssText =
    "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;";

  var card = doc.createElement("div");
  card.setAttribute("data-card-index", this.index);
  card.className = `card ${this.suit} card-${
    this.picture ? cards[this.value - 1] : this.value
  }`;
  card.innerHTML = template.join("");

  if (this.picture) {
    card.classList.add("picture");
  }

  card.card = true;

  // Adiciona o elemento no .front
  const frontFace = card.querySelector(".front");
  frontFace.appendChild(bgElement);

  this.el = card;
}

Card.prototype.flip = function () {
  this.el.classList.toggle("flipped", !this.flipped);
  this.el.draggable = !this.flipped;
  this.flipped = !this.flipped;

  if (!this.flipped) {
    this.el.style.transform = "";
  }
};
