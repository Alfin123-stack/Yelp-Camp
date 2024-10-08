const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// URL endpoint API
const url = "https://api.pexels.com/v1/search?query=nature";

// API key
const apiKey = "3MKMBziUeh8hNXz7Oz26MOcMQ97HdCXNmontnDPd6bMu1raEGpp05Pkf";

// Opsi untuk fetch dengan header Authorization
const options = {
  method: "GET",
  headers: {
    Authorization: apiKey,
  },
};

// // Fungsi untuk fetch data dari API
// async function fetchData() {
//   try {
//     const response = await fetch(url, options);
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     console.log(data.photos[0].src.medium);
//   } catch (error) {
//     console.error("There was a problem with the fetch operation:", error);
//   }
// }

// // Memanggil fungsi untuk fetch data
// fetchData();

function hello(name, origin = "Bandung") {
  // const result = ("hallo nama saya "+ name + "."+"saya tinggal di "+ origin)
  const result = `hallo nama saya ${name}. saya tinggal di ${origin}`;

  return result;
}

const rahmat = hello("Rahmat", "Semarang");
console.log(rahmat);

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const camp = new Campground({
      author: "66dd9e9234e21027ccac056e",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: data.photos[i].src.large,
          filename: `${Math.floor(Math.random() * 1000000)}.jpg`,
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
