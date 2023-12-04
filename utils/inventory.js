import { v4 as uuid } from 'uuid'

const description = [
  "Unleash Endless Fun with AutoRoll!",
  "Does your furry friend need more play and less boredom? Meet AutoRoll, the ultimate automatic rolling pet ball designed to captivate your pet's natural hunting instincts and provide hours of entertainment.",
  "Dynamic and Unpredictable Movements: AutoRoll darts and dashes unpredictably, mimicking the movements of real prey. Its smart technology ensures that it can navigate around obstacles, avoid getting stuck in tight spots, and keep your pet guessing with every roll.",
  "Key Features:",
  "Smart Navigation System: AutoRoll is equipped with an advanced sensor array that prevents it from getting stuck, ensuring uninterrupted playtime.",
  "Durable and Safe Design: Crafted with high-quality, non-toxic materials, this ball is built to withstand the rough and tumble of playful paws and teeth.",
  "LED Light for Extra Excitement: The built-in LED light adds an extra layer of engagement, especially in low-light conditions, sparking your pet's curiosity.",
  "Rechargeable Battery: Say goodbye to constant battery replacements! AutoRoll comes with a USB rechargeable battery, offering hours of play on a single charge.",
  "Why AutoRoll?",
  "Stimulates Physical Activity: Keeps your pet agile, fit, and mentally stimulated.",
  "Perfect for Solo Play: Offers your pet a fun way to stay entertained even when you’re not at home.",
  "Interactive Bonding: Join in the fun by controlling AutoRoll’s movements with its remote feature, strengthening the bond between you and your pet.",
  "Easy to Use and Clean: Its smooth surface is easy to wipe clean, ensuring hygiene and safety for your pet.",
  "Package Includes:",
  "1 x AutoRoll Interactive pet Ball",
  "1 x USB Charging Cable",
  "Order AutoRoll Today! Give your pet the gift of endless play. Bring home AutoRoll and watch your friend leap, pounce, and play their way to joy and health. Get yours now and turn playtime into an extraordinary adventure!",
  "Interactive pet Toys Ball Stimulate Hunting Instinct Kitten Funny Chaser Roller Toy 360 Degree Rotating Smart Electric Ball USB Rechargeable"
].join('\n\n');

let inventory = [
  {
    categories: ['home'], name: 'AutoRoll Green Ball', variant_id: 47404880167233, price: '14.99', image: '/products/green.png', description: description
  },
  {
    categories: ['home'], name: 'AutoRoll Pink Ball', variant_id: 47404880200001, price: '14.99', image: '/products/pink.png', description: description
  },
  {
    categories: ['home'], name: 'AutoRoll Yellow Ball', variant_id: 47404880232769, price: '14.99', image: '/products/yellow.png', description: description
  },
]

inventory.map(i => {
  i.id = uuid()
  return i
})

export default inventory