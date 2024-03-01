const mongoose = require('mongoose')

const student = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    section: {
        type: String,
    },
    posts: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    },
    projects: {
        type: Array,
        default: []
    },
    roles: {
        type: Array,
        default: ["student"]
    }
})

const post = new mongoose.Schema({
    title: {
        type: String,
        default: "Untitled"
    },
    content: {
        type: String,
        required: true
    },
    postedBy: {
        type: String,
        required: true
    },
    postedOn: {
        type: Date,
        default: new Date().toISOString()
    },
    comments: {
        type: Array,
        default: []
    },
    roles: {
        type: Array,
        default: ["student"]
    }

})

const faculty = new mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    designation:{
        type:String,
        required:true
    },
    education:{
        type:String,
        default:""
    },
    picture:{
        type:String,
        default:"https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg"
    },
    email:{
        type:String,
        default:""
    },
    specialization:{
        type:String,
        default:""
    },
    publications:{
        type:Array,
        default:[]
    },
    posts:{
        type:Array,
        default:[]
    },
    comments:{
        type:Array,
        default:[]
    },
    roles:{
        type:Array,
        default:["faculty"]
    },
    branch:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    joining_date:{
        type:Date,
        default: new Date().toISOString()
    },
    projects_guided:{
        type:String,
        default:""
    },
    publications_number:{
        type:Number,
        default:0
    }
})      

const comment = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    commentedBy: {
        type: String,
        required: true
    },
    commentedOn: {
        type: String,
        required: true
    }
})

const admins = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
})


module.exports = mongoose.model('Student', student);
module.exports = mongoose.model('Post', post);
module.exports = mongoose.model('Faculty', faculty);
module.exports = mongoose.model('Comment', comment);
module.exports = mongoose.model('Admins', admins);