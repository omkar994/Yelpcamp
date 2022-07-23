const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const {campgroundSchema, reviewSchema}=require('./schemas');
const Campground = require('./models/campground');
const Review=require('./models/review');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
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

app.get('/', (req, res) => {
    res.render('home');
});

const validateCampground= (req, res, next)=>{  
    const{error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
};

const validateReview = (req, res, next)=>{
    const{error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
};

app.get('/makecampground', catchAsync(async (req, res) => {
    const camp = new Campground({ title: 'My Ground' });
    await camp.save();
    res.send(camp);
}));

app.get('/campground', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campground/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campground', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground){/**validation before JOI* */
    //     throw new ExpressError('Invalid Data', 400);
    // }

    const campground = await new Campground(req.body.campground).save();
    res.redirect(`/campground/${campground._id}`);
}));

app.get('/campground/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    //console.log(campground);
    res.render('campgrounds/show', { campground });
}));

app.get('/campground/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campground/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campground/${campground._id}`);
}));

app.delete('/campground/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}));

app.delete('/campground/:id/review/:reviewId',catchAsync(async(req, res)=>{
    const{id, reviewId}=req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campground/${id}`);
}));

app.post('/campground/:id/review', validateReview,catchAsync(async (req, res)=>{
    const campground=await Campground.findById(req.params.id);
    const review = await new Review(req.body.review).save();
    campground.reviews.push(review);
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
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
