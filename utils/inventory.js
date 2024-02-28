import { v4 as uuid } from 'uuid'

const description = [
  "The greatest cookie",
  "Ever!"
].join('\n\n');

const vid = '/products/vid.mp4'

let inventory = [
  {
    categories: ['soft cookies'], 
    name: '6pc Chocolate Chip', 
    variant_id: 47404880167233, 
    price: '20', 
    image: '/products/choco.png', 
    image_support: [],
    description: description,
  },
  {
    categories: ['soft cookies'], 
    name: '6pc Cookie2', 
    variant_id: 47404880200001, 
    price: '20', 
    image: '/products/plain.png', 
    image_support: [],
    description: description,
  },
  {
    categories: ['soft cookies'], 
    name: '6pc Cookie3', 
    variant_id: 47404880200002, 
    price: '20', 
    image: '/products/white.png',
    image_support: [],
    description: description,
  },
  {
    categories: ['soft cookies'], 
    name: '12pc Chocolate Chip', 
    variant_id: 47404880167233, 
    price: '35', 
    image: '/products/choco.png', 
    image_support: [],
    description: description,
  },
  {
    categories: ['soft cookies'], 
    name: '12pc Cookie2', 
    variant_id: 47404880200001, 
    price: '35', 
    image: '/products/plain.png', 
    image_support: [],
    description: description,
  },
  {
    categories: ['soft cookies'], 
    name: '12pc Cookie3', 
    variant_id: 47404880200002, 
    price: '35', 
    image: '/products/white.png',
    image_support: [],
    description: description,
  },
]

inventory.map(i => {
  i.id = uuid()
  return i
})

export default inventory