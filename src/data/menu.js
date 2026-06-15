// The Cafe Country Road - Full Menu
// Transcribed from the cafe's printed menu. Prices in INR.
// Each category has an emoji icon used in the UI.

export const CAFE = {
  name: 'The Cafe Country Road',
  tagline: 'A cup of coffee and a road full of memories — only at The Cafe Country Road.',
  upiId: 'gpay-11250510730@okbizaxis',
  payee: 'The Cafe Country Road'
}

export const MENU = [
  {
    id: 'maggi', name: 'Maggi', icon: '🍜',
    items: [
      { id: 'm1', name: 'Golden Corn Maggi', price: 99 },
      { id: 'm2', name: 'Masala Maggi', price: 100 },
      { id: 'm3', name: 'Desi Tadka Maggi', price: 120 },
      { id: 'm4', name: 'Veg Cheese Maggi', price: 120 },
      { id: 'm5', name: 'Paneer Maggi', price: 120 },
      { id: 'm6', name: 'CCR Special Maggi', price: 150 }
    ]
  },
  {
    id: 'sandwich', name: 'Sandwich', icon: '🥪',
    items: [
      { id: 's1', name: 'Fresh Veg', price: 99 },
      { id: 's2', name: 'Veg Cheese', price: 120 },
      { id: 's3', name: 'Cheese Chilli Garlic', price: 140 },
      { id: 's4', name: 'Mumbaiya Masala', price: 140 },
      { id: 's5', name: 'Tandoori Paneer Tikka', price: 150 },
      { id: 's6', name: 'Chocolate', price: 160 },
      { id: 's7', name: 'CCR Special', price: 200 }
    ]
  },
  {
    id: 'juices', name: 'Juices', icon: '🧃',
    items: [
      { id: 'j1', name: 'Freezed Coconut', price: 80 },
      { id: 'j2', name: 'Banana Sap', price: 90 },
      { id: 'j3', name: 'Orange Juice', price: 100 },
      { id: 'j4', name: 'Pineapple Juice', price: 100 },
      { id: 'j5', name: 'Pomegranate Juice', price: 120 }
    ]
  },
  {
    id: 'smoothie', name: 'Smoothie', icon: '🥤',
    items: [
      { id: 'sm1', name: 'Honey Banana', price: 99 },
      { id: 'sm2', name: 'Strawberry', price: 120 },
      { id: 'sm3', name: 'Kiwi', price: 120 },
      { id: 'sm4', name: 'Chocolate', price: 120 }
    ]
  },
  {
    id: 'quickbites', name: 'Quick Bites', icon: '🍟',
    items: [
      { id: 'qb1', name: 'Masala Fries', price: 99 },
      { id: 'qb2', name: 'Peri Peri Fries', price: 140 },
      { id: 'qb3', name: 'Mayo with Cheese', price: 160 },
      { id: 'qb4', name: 'CCR Special Fries', price: 180 }
    ]
  },
  {
    id: 'rolls', name: 'Rolls', icon: '🌯',
    items: [
      { id: 'r1', name: 'Spring Rolls', price: 120 },
      { id: 'r2', name: 'Cheese Corn Rolls', price: 150 }
    ]
  },
  {
    id: 'shakes', name: 'Shakes', icon: '🥛',
    items: [
      { id: 'sh1', name: 'Vanilla Shake', price: 80 },
      { id: 'sh2', name: 'Chocolate Shake', price: 100 },
      { id: 'sh3', name: 'Chocolate Caramel', price: 120 },
      { id: 'sh4', name: 'Strawberry Shake', price: 100 },
      { id: 'sh5', name: 'Butter Scotch Shake', price: 100 },
      { id: 'sh6', name: 'Oreo Shake', price: 100 },
      { id: 'sh7', name: 'Chocolate Hazelnut', price: 120 },
      { id: 'sh8', name: 'CCR Special Shake', price: 140 }
    ]
  },
  {
    id: 'mocktails', name: 'Mocktails', icon: '🍹',
    items: [
      { id: 'mo1', name: 'Blue Lagoon', price: 90 },
      { id: 'mo2', name: 'Pan Mojito', price: 99 },
      { id: 'mo3', name: 'Virgin Mojito', price: 99 },
      { id: 'mo4', name: 'Spicy Mango', price: 110 },
      { id: 'mo5', name: 'Spicy Lemonade', price: 110 },
      { id: 'mo6', name: 'Chilli Guava', price: 120 },
      { id: 'mo7', name: 'Pina Colada', price: 120 }
    ]
  },
  {
    id: 'coldcoffee', name: 'Cold Coffee', icon: '🧋',
    items: [
      { id: 'cc1', name: 'Plain Coffee', price: 80 },
      { id: 'cc2', name: 'Mint Cold Coffee', price: 100 },
      { id: 'cc3', name: 'Cold Coffee (Ice Cream)', price: 120 },
      { id: 'cc4', name: 'Cold Coffee with Brownie', price: 150 },
      { id: 'cc5', name: 'Hazelnut Cold Coffee', price: 150 },
      { id: 'cc6', name: 'Irish Cold Coffee', price: 150 },
      { id: 'cc7', name: 'Caramel Cold Coffee', price: 150 }
    ]
  },
  {
    id: 'pizza', name: 'Pizza', icon: '🍕',
    items: [
      { id: 'p1', name: 'Maregherita', price: 120 },
      { id: 'p2', name: 'Classic Fresh', price: 150 },
      { id: 'p3', name: 'Veg Chilli Garlic', price: 160 },
      { id: 'p4', name: 'Golden Corn', price: 180 },
      { id: 'p5', name: 'Tandoori Paneer', price: 200 },
      { id: 'p6', name: 'Tikka Fusion', price: 250 }
    ]
  },
  {
    id: 'burger', name: 'Burger', icon: '🍔',
    items: [
      { id: 'b1', name: 'Veg Delight', price: 80 },
      { id: 'b2', name: 'Veg Cheese', price: 99 },
      { id: 'b3', name: 'Tandoori Paneer', price: 120 },
      { id: 'b4', name: 'CCR Loaded', price: 150 }
    ]
  },
  {
    id: 'pasta', name: 'Pasta', icon: '🍝',
    items: [
      { id: 'pa1', name: 'Red Pasta', price: 180 },
      { id: 'pa2', name: 'White Pasta', price: 200 },
      { id: 'pa3', name: 'Basil Pesto Pasta', price: 250 },
      { id: 'pa4', name: 'Pink Pasta', price: 250 },
      { id: 'pa5', name: 'Macaroni Pasta', price: 280 }
    ]
  },
  {
    id: 'icetea', name: 'Ice Tea', icon: '🧊',
    items: [
      { id: 'it1', name: 'Classic Lemon', price: 90 },
      { id: 'it2', name: 'Fresh Lemon Mint', price: 120 },
      { id: 'it3', name: 'Honey Lemon Ginger', price: 140 }
    ]
  },
  {
    id: 'icecream', name: 'Ice Cream', icon: '🍨',
    items: [
      { id: 'ic1', name: 'Vanilla', price: 50 },
      { id: 'ic2', name: 'Strawberry', price: 50 },
      { id: 'ic3', name: 'Butter Scotch', price: 50 },
      { id: 'ic4', name: 'Chocolate', price: 60 },
      { id: 'ic5', name: 'American Nuts', price: 70 }
    ]
  },
  {
    id: 'coffee', name: 'Coffee', icon: '☕',
    items: [
      { id: 'co1', name: 'Kulad', price: 45 },
      { id: 'co2', name: 'Plain Hot', price: 60 },
      { id: 'co3', name: 'Hot Chocolate', price: 80 },
      { id: 'co4', name: 'Hot Chocolate Nutella', price: 100 },
      { id: 'co5', name: 'Cappuccino', price: 100 },
      { id: 'co6', name: 'Hazelnut', price: 100 },
      { id: 'co7', name: 'Irish', price: 100 }
    ]
  },
  {
    id: 'tea', name: 'Tea', icon: '🍵',
    items: [
      { id: 't1', name: 'Kulhad Tea', price: 40 },
      { id: 't2', name: 'Lemon Tea', price: 40 },
      { id: 't3', name: 'Green Tea', price: 40 },
      { id: 't4', name: 'CCR Special Tea', price: 50 }
    ]
  },
  {
    id: 'toast', name: 'Toast', icon: '🍞',
    items: [
      { id: 'to1', name: 'Butter Jam', price: 50 },
      { id: 'to2', name: 'Honey', price: 50 },
      { id: 'to3', name: 'Nutella', price: 80 },
      { id: 'to4', name: 'Peanut Butter', price: 70 },
      { id: 'to5', name: 'CCR Special', price: 100 }
    ]
  },
  {
    id: 'dessert', name: 'Dessert', icon: '🍰',
    items: [
      { id: 'd1', name: 'Plain Brownie', price: 120 },
      { id: 'd2', name: 'Brownie (Ice Cream)', price: 140 },
      { id: 'd3', name: 'Nutella Brownie', price: 150 },
      { id: 'd4', name: 'Sizzling Brownie', price: 180 }
    ]
  },
  {
    id: 'bread', name: 'Bread', icon: '🥖',
    items: [
      { id: 'br1', name: 'Cheese Garlic Bread', price: 100 },
      { id: 'br2', name: 'CCR Loaded', price: 120 }
    ]
  }
]

export const ALL_ITEMS = MENU.flatMap(c =>
  c.items.map(i => ({ ...i, category: c.name, categoryId: c.id, icon: c.icon }))
)
