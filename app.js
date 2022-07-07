const express=require('express');
const app=express();
const path=require('path');
const methodOverride=require('method-override');
const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(() => {
    console.log("We are Connected!!!");
})
.catch( (err) =>{
    console.log("Oh connection err!!!");
    console.log(err);
});
// const db=mongoose.connection;
// db.on("error", console.error.bind(console,"connection err"));
// db.once("open", ()=>{
//     console.log('DataBase CONNECTED');
// });

const Campground=require('./models/campground');
const { urlencoded } = require('express');

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/makecampground',async (req,res)=>{
    const camp=new Campground({title:'My Ground'});
    await camp.save();
    res.send(camp);
});

app.get('/campground',async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
});

app.get('/campground/new',(req, res)=>{
    res.render('campgrounds/new');
});

app.post('/campgrounds',async (req,res)=>{
    const campground=await new Campground(req.body.campground).save();
    res.redirect(`/campground/${campground._id}`);
});

app.get('/campground/:id',async (req, res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    res.render('campgrounds/show',{campground});
});

app.get('/campground/:id/edit',async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
});

app.put('/campground/:id',async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campground/${campground._id}`);
});

app.delete('/campground/:id', async (req, res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
});

app.listen(3000, ()=>{
    console.log('Listening on PORT 3000');
});
