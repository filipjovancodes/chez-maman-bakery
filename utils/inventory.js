import { v4 as uuid } from 'uuid'

const description = [
  "The greatest cookie",
  "Ever!"
].join('\n\n');

const vid = '/products/vid.mp4'

let inventory = [
  {
    categories: ['sourdough cookies'], 
    name: 'Cookie1', 
    variant_id: 47404880167233, 
    price: '14.99', 
    image: '/products/choco.png', 
    image_support: [],
    description: description,
  },
  {
    categories: ['sourdough cookies'], 
    name: 'Cookie2', 
    variant_id: 47404880200001, 
    price: '14.99', 
    image: '/products/plain.png', 
    image_support: [],
    description: description,
  },
  {
    categories: ['sourdough cookies'], 
    name: 'Cookie3', 
    variant_id: 47404880200002, 
    price: '14.99', 
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