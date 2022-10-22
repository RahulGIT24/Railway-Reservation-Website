//! Imported Modules
const express = require("express");
const path = require("path");
const fs = require("fs");

//* Creating Variables
let oldSeats = fs.readFileSync("availableSeats.txt", "utf-8");
oldSeats = Number(oldSeats);
const date = new Date();
const dateString = date.toLocaleDateString();
const timeString = date.toLocaleTimeString();

//! Created an express app
const app = express();

//! Created a port
const port = 80;

//! Express Stuff
app.use("/static", express.static("static"));
app.use(express.urlencoded());

//! Pug Stuff
app.set("view engine", "pug"); //* Setting the template engine
app.set("views", path.join(__dirname, "views")); //* Setting the views directory

//! Endpoints
app.get("/home.pug", (req, res) => {
  res.status(200).render("home.pug");
});
app.get("/about.pug", (req, res) => {
  res.status(200).render("about.pug");
});
app.get("/booktickets.pug", (req, res) => {
  res.status(200).render("booktickets.pug");
});
app.get("/info.pug", (req, res) => {
  res.status(200).render("info.pug");
});
app.get("/canceltickets.pug", (req, res) => {
  res.status(200).render("canceltickets.pug");
});

app.post("/booktickets", (req, res) => {
  var num = Math.random().toString().substr(2, 6);
  let name = req.body.name;
  let phone = req.body.phone;
  let email = req.body.email;
  let address = req.body.address;
  let seats = req.body.seats;
  let info = `Name of Receipant - ${name}
Email of the receipant - ${email}
Address of the receipant - ${address}
Phone Number of the receipant - ${phone}
Seats booked by receipant - ${seats}
Date of Bokking - ${dateString}
Time of Bokking - ${timeString}
Unique ID - ${num}
`;

  if (seats <= oldSeats) {
    oldSeats = Number(oldSeats);
    seats = Number(seats);
    oldSeats = oldSeats - seats;
    oldSeats = String(oldSeats);
    seats = String(seats);
    fs.writeFileSync("availableSeats.txt", oldSeats);
    fs.writeFileSync(`Booked Seats/${num}.txt`, info);
    fs.writeFileSync(`Admin/${num}.txt`, seats);
    const UniqueID = {UniqueID:num};
    res.status(200).render("success.pug",UniqueID);
  } else if (seats > oldSeats) {
    res.status(200).render("warning.pug");
  } else {
    res.status(200).render("danger.pug");
  }
});

app.post("/info", (req, res) => {
  let number = req.body.number;
  let userName = req.body.text;
  
  fs.stat(`Booked Seats/${number}.txt`, function (err, stat) {
    if (err == null) {
      let file = fs.readFileSync(`Booked Seats/${number}.txt`, "utf-8");
      let file2 = fs.writeFileSync(`${userName}.txt`, file);
      const data = "Receipt Downloaded successfully";
      const data2 = { file: data };
      res.status(200).render("info.pug", data2);
    } else if (err.code === "ENOENT") {
      let file2 = "ID not existed. Try again...";
      const data = { file2: file2 };
      res.status(200).render("info.pug", data);
    } else {
      console.log("Some other error: ", err.code);
    }
  });
});

app.post("/canceltickets", (req, res) => {
  let number = req.body.number;
  let seat = req.body.seats;
  fs.stat(`Booked Seats/${number}.txt`, function (err, stat) {
    if (err == null) {
      seat = Number(seat);
      let bookedSeats = fs.readFileSync(`Admin/${number}.txt`, "utf-8");
      if (seat <= bookedSeats) {
        bookedSeats = Number(bookedSeats);
        oldSeats = Number(oldSeats);
        oldSeats = oldSeats + seat;
        oldSeats = String(oldSeats);
        fs.writeFileSync("availableSeats.txt", oldSeats);

        let final = bookedSeats - seat;
        final = String(final);
        bookedSeats = String(bookedSeats);
        let file = fs.readFileSync(`Booked Seats/${number}.txt`, "utf-8");
        file = file.replace(
          `Seats booked by receipant - ${bookedSeats}`,
          `Seats booked by receipant - ${final}`
        );
        let file2 = fs.writeFileSync(`Booked Seats/${number}.txt`, file);
        // console.log(file);

        fs.writeFileSync(`Admin/${number}.txt`, final);
        const a = `${seat} seat(s) cancelled successfully`;
        const data = { file: a };
        res.status(200).render("canceltickets.pug", data);
      } else {
        const a = "The seats you have entered are more than you booked";
        const data = { file: a };

        //! Download Here

        res.status(200).render("canceltickets.pug", data);
      }
    } else if (err.code === "ENOENT") {
      const a = "ID not existed!!!";
      const data = { file: a };
      res.status(200).render("canceltickets.pug", data);
    } else {
      console.log("Some other error: ", err.code);
    }
  });
});

app.get("/trainstatus.pug", (req, res) => {
  const remainSeats = { remainSeats: oldSeats };
  res.status(200).render("trainstatus.pug", remainSeats);
});

//! Straing the Server
app.listen(port, () => {
  console.log(`The port is started on port ${port}`);
});
