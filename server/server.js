require("dotenv").config();
const express = require("express");
const db = require("./db");
const cors = require("cors");

const morgan = require("morgan");
// const pg = require("pg")

const app = express();

app.use(cors());
app.use(express.json());

// Get all cars
app.get("/api/v1/cars", async (req, res) => {
	try {

		// const results = await db.query("SELECT * FROM cars");
		const carsRatingsData = await db.query("SELECT * FROM cars LEFT JOIN (SELECT car_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY car_id) reviews ON cars.id = reviews.car_id;");
		
		console.log(carsRatingsData)

		res.status(200).json({
			status: "success",
			results: carsRatingsData.rows.length,
			data: {
				cars: carsRatingsData.rows,
			},
		});
	} catch (err) {
		console.log(err);
	}
});

// get a car
app.get("/api/v1/cars/:id", async (req, res) => {
	console.log(req.params.id);	

	try {

		const car = await db.query(`SELECT * FROM cars LEFT JOIN (SELECT car_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY car_id) reviews ON cars.id = reviews.car_id WHERE id = $1`, [req.params.id]);
		const reviews = await db.query(`SELECT * FROM reviews WHERE car_id = $1`, [req.params.id]);

		res.status(200).json({
			status: "success",
			data: {
				car: car.rows[0],
				reviews: reviews.rows,
			},
		});
	} catch (err) {
		console.log(err);
	}
});

// Create a car
app.post("/api/v1/cars", async (req, res) => {
	console.log(req);
	
	try {
		const results = await db.query("INSERT INTO cars (make, model, price_range) values ($1, $2, $3) returning *", [req.body.make, req.body.model, req.body.price_range]);
		console.log(results);
		res.status(201).json({
			status: "success",
			data: {
				car: results.rows[0],
			},
		});
	} catch (err) {
		console.log(err);
	}
});

// update cars
app.put("/api/v1/cars/:id", async (req, res) => {
	try {
		const results = await db.query("UPDATE cars SET make = $1, model = $2, price_range = $3 WHERE id = $4 RETURNING *", 
						[req.body.make, req.body.model, req.body.price_range, req.params.id]);
		res.status(200).json({
			status: "success",
			data: {
				cars: results.rows[0],
			}
		})
	} catch (err) {
		console.log(err);
	}
	console.log(req.params.id);
	console.log(req.body);
});

// delete a car
app.delete("/api/v1/cars/:id", async (req, res) => {
	try {
		const results = db.query("DELETE FROM cars WHERE id = $1", [req.params.id]);
		res.status(204).json({
			status: "success",
		});
	} catch (err) {
		console.log(err);
	}
});

app.post("/api/v1/cars/:id/addReview", async (req, res) => {
	try {
		const newReview = await db.query("INSERT INTO reviews (car_id, name, review, rating) values ($1, $2, $3, $4) RETURNING *", [req.params.id, req.body.name, req.body.review, req.body.rating]);
		res.status(201).json({
			status: "success",
			data: {
				review: newReview.rows[0],
			}
		});
	} catch (err) {

		console.log(err, "serverside error potentially");
	}
})

const port = process.env.PORT || 3001;
app.listen(port, () => {
	console.log("server is up and listening on port 3001");
});
