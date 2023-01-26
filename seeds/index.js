/**use for 最开始创建不同的camp 对象 并存到数据库中 独立于app.js,单独运行，**/
/********require part**************/
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');
/********mongoose connection part**************/
main()
.then(() => {console.log('mongoose success connected!')})
.catch(err => {
  console.log('mongoose something wrong:')
  console.log(err)});

async function main() {
  await mongoose.connect('mongodb://localhost:27017/YelpCamp');
}

/**用 cities and seedHelpers 随机组合，创建一些模拟的camp 和其 Location, 使用随机数进行array access,
先创建了50个**/
const sample = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async () => {
  await Campground.deleteMany({});
  for(let i = 0; i < 50; i++){
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20 + 20);
    const newCamp = new Campground({
      author: '62f875e244d0f698ad7f8c4a', //username: test
      geometry: { type: 'Point',
      coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae',
      price,
      image: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ]
    });
    await newCamp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
});
