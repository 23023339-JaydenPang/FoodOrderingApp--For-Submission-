const express = require('express');
const mysql = require('mysql2');
const app = express();

const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

// Create MySQL connectionnp
const connection = mysql.createConnection({
host: 'mysql-jayden.alwaysdata.net',
user: 'jayden',
password: 'Ineedwifi94',
database: 'jayden_foodorderapp'
});
connection.connect((err) => {
if (err) {
console.error('Error connecting to MySQL:', err);
return;
}
console.log('Connected to MySQL database');
});
// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));;
app.use(express.urlencoded({
    extended : false
}));    
// Define routes
// Example:
// app.get('/', (req, res) => 
// connection.query('SELECT * FROM TABLE', (error, results) => {
// if (error) throw error;
// res.render('index', { results }); // Render HTML page with data
// });
// });


//Define Routes
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM orders';
    //Fetch data from MySQL
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving orders');
        }
        // Render HTML page with data
        res.render('index', {orders: results});   
    });
});

app.get("/orderInfo/:id", (req, res) => {
    const orderId = req.params.id;
    const sql = 'SELECT * FROM orders WHERE orderId = ?';
    connection.query(sql, [orderId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving order by ID');
        }
        if (results.length >0){
            res.render('orderInfo', {order: results[0]});
        }else{
            res.status(404).send("order not found")
        }  
    });
});

app.get("/addOrder", (req, res) =>{
    res.render('addOrder');
});

app.post("/addOrder", upload.single("image"), (req, res) => {
    const {customerName, foodDescription, comments, price} = req.body;
    let image;
    if (req.file){
        image = req.file.filename;
    }else{
        image=null;
    }
    
    const sql = "INSERT INTO orders (customerName, foodDescription, comments, price, image) VALUES (?, ?, ?, ?, ?)";
    connection.query(sql, [customerName, foodDescription, comments, price, image], (error, results)=> {
        if (error){
            console.error("Err adding order", error);
            res.status(500).send("Error adding order");
        }else{
            res.redirect("/");
        }
    });
})

app.get("/editOrder/:id", (req,res) => {
    const orderId = req.params.id;
  
    const sql = "SELECT * FROM orders WHERE orderId = ?";
    connection.query(sql, [orderId], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving order");
        }
        if (results.length > 0){
            res.render("editOrder", {order: results[0]});
        } else{
            res.status(404).send("order not found");
        }
    })
})

app.post("/editOrder/:id", upload.single("image"), (req,res) => {
    const orderId = req.params.id;
    const {customerName, foodDescription, comments, price} = req.body;
    let image = req.body.currentImage; // retrive current image filename
    if (req.file) { //if new image is uploaded
        image = req.file.filename; // set image to be new image filename
    }else{
        image=null;
    }
   
    const sql = "UPDATE orders SET customerName=?, foodDescription=?, comments=?, price=?, image =? WHERE orderId=?";
    connection.query(sql, [customerName, foodDescription, comments, price, image, orderId], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving order");
        }else{
            res.redirect("/");
        }
    })
})

app.get("/deleteorder/:id", (req, res) => {
    const orderId = req.params.id;
  
    const sql = "DELETE FROM orders WHERE orderId = ?";
    connection.query(sql, [orderId], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error deleting order");
        } else{
            res.redirect("/");
        }
    }) ;  
});

// Search function
app.get('/search', (req, res) => {
    const searchQuery = req.query.query;
    const sql = 'SELECT * FROM orders WHERE customerName LIKE ? OR foodDescription LIKE ? ORDER BY customerName ASC, foodDescription ASC, price DESC';
    const query = `%${searchQuery}%`;
 
    connection.query(sql, [query, query], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving orders');
        }
        res.render('index', { orders: results });
    });
});
  



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


