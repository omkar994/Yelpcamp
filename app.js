const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
//const {campgroundSchema, reviewSchema}=require('./schemas');
const Campground = require('./models/campground');
const Review=require('./models/review');
const campgrounds=require('./routes/campgrounds')
const reviews=require('./routes/reviews');
const  session = require('express-session');
const flash = require('connect-flash');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
    .then(() => {
        console.log("We are Connected!!!");
    })
    .catch((err) => {
        console.log("Oh connection err!!!");
        console.log(err);
    });
// const db=mongoose.connection;
// db.on("error", console.error.bind(console,"connection err"));
// db.once("open", ()=>{
//     console.log('DataBase CONNECTED');
// });


const { urlencoded } = require('express');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig={
    secret: 'thisshouldbeabetterscrret',
    resave: false,
    saveUninitilized: true,
    cookie:{
        httpOnly:true,
        expires: Date.now + 1000 * 60 * 60 *24,
        maxAge:1000 * 60 * 60 *24
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});


app.use('/campground', campgrounds);
app.use('/campground/:id/review/',reviews);

app.get('/makecampground', catchAsync(async (req, res) => {
    const camp = new Campground({ title: 'My Ground' });
    await camp.save();
    res.send(camp);
}));




app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found!!!', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something Went Wrong' } = err;
    if (!message) {
        message = "Something went wrong!!!";
    }
    res.status(statusCode).render('errors', { err });
});

app.listen(3000, () => {
    console.log('Listening on PORT 3000');
});
