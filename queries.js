const schemas = require('./schemas.js')
const mongoose = require('mongoose')
const confidential = require('./confidential.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

mongoose.set("strictQuery", false);

const Student = mongoose.model("Student", schemas.student)
const Post = mongoose.model("Post", schemas.post)
const Faculty = mongoose.model("Faculty", schemas.faculty)
const Comment = mongoose.model("Comment", schemas.comment)
const Admins = mongoose.model("Admins", schemas.admins)
const Bugs = mongoose.model("Bugs", schemas.bugs)
const Events = mongoose.model("Events", schemas.Events)


async function addStudent(body) {
    const studentExists = await Student.findOne({ "id": body.rollno })


    console.log(studentExists)
    if (studentExists == null) {
        body.password = await bcrypt.hash(body.password, 10)
        const newStudent = new Student(body)
        await newStudent.save()
        return "Student Added"
    }
    else {
        return "Student already exists"
    }
}

async function addFaculty(body) {
    const facultyExists = await Faculty.findOne({ "id": body.id })


    console.log(facultyExists)
    if (facultyExists == null) {
        body.password = await bcrypt.hash(body.password, 10)
        const newFaculty = new Faculty(body)
        await newFaculty.save()
        return "Faculty Added"
    }
    else {
        return "Faculty already exists"
    }
}


async function getStudentByRollNo(rollno) {
    const student = await Student.findOne({ "id": rollno })
    if (student == null) {
        return { "message": "Student doesn't exist" }
    }
    else {
        return { "message": "Student Found", "Student_Data": student }
    }
}



async function addPost(body) {
    const studentExists = await Student.findOne({ "id": body.postedBy })
    if (studentExists == null) {
        return { "message": "Student doesn't exist", "status": 400 }
    }
    const newPost = new Post(body)
    studentExists.posts.push(newPost._id)
    await newPost.save()
    studentExists.save()
    return { "message": "Post created", "status": 201, "post added": newPost }

}

async function addPost2(body) {
    const studentExists = await Student.findOne({ "id": body.postedBy })
    if (studentExists == null) {
        return { "message": "Student doesn't exist", "status": 400 }
    }
    const newPost = new Post(body)
    studentExists.posts.push(newPost._id)
    await newPost.save()
    studentExists.save()
    return { "message": "Post created", "status": 201, "post added": newPost }
}

async function addComment(postID, commentBody) {
    const post = await Post.findById(postID)
    console.log(commentBody.postedBy)
    const student = await Student.findOne({ "_id": commentBody.postedBy })
    if (post == null) {
        return { "message": "Post doesn't exist", "Status": 400 }
    }
    else if (student == null) {
        return { "message": "Student doesn't exist", "Status": 400 }
    }
    else {
        //console.log("c:" +commentBody)
        body = { "content": commentBody.comment, "commentedBy": student.id, "commentedOn": postID }
        const comment = new Comment(body)
        post.comments.push(comment._id)
        student.comments.push(comment._id)
        //console.log(body)
        await post.save()
        await student.save()
        await comment.save()
        return { "message": "Comment added", "status": 201, "Comment": comment, "Post updated": post, "Student updated": student }
    }
}

async function getPostById(postID) {
    const post = await Post.findById(postID)
    console.log(post)
    if (post == null) {
        return { "message": "Post doesn't exist", "status": 404 }
    }
    else {
        return { "message": "Post found", "status": 201, "post": post }
    }
}

async function getCommentsOnPost(postID) {
    const post = await Post.findById(postID)

    if (post == null) {
        return { "message": "Post doesn't exist", "status": 404 }
    }
    else {
        return { "message": "Post found", "status": 201, "comments": post.comments }
    }
}

async function login(loginForm) {
    const student = await Student.findOne({ "id": loginForm.id.toUpperCase() })

    if (student == null) {
        return { "message": "Student doesn't exist", "status": 404 }
    }
    const matchPassword = await bcrypt.compare(loginForm.password, student.password)

    if (matchPassword) {
        const token = await jwt.sign({ id: student.id, password: student.password, roles: student.roles }, confidential.SECRET_KEY)
        return { "message": "User Logged In", "token": token, "status": 200 }
    }
    else {
        return { "message": "Wrong password", "status": 401 }
    }
}

async function login2(loginForm) {

    const student = await Student.findOne({ "id": loginForm.id.toUpperCase() })
    if (student == null) {
        return { "message": "Student doesn't exist", "status": 404 }
    }
    const matchPassword = await bcrypt.compare(loginForm.password, student.password)

    if (matchPassword) {
        const token = await jwt.sign({ id: student.id, password: student.password, roles: student.roles }, confidential.SECRET_KEY)
        return { "message": "User Logged In", "token": token, "status": 200 }
    }
    else {
        return { "message": "Wrong password", "status": 401 }
    }
}



async function getAllPosts() {
    const posts = await Post.find()

    return { "message": "Posts returned", "status": 201, "posts": posts }
}

async function getFaculty() {
    const facultyDetails = await Faculty.find();
    console.log(facultyDetails)
    return { "message": "Details returned", "status": 201, "details": facultyDetails }
}

async function deleteComment(commentID) {

    const comment = await Comment.findById(commentID)
    if (comment == null) {
        return { "message": "Comment doesn't exist", "status": 404 }
    }

    const student = await Student.findOne({ "id": comment.commentedBy })
    const post = await Post.findById(comment.commentedOn)

    index = student.comments.indexOf(commentID)
    await student.comments.splice(index, 1)
    index = post.comments.indexOf(commentID)
    await post.comments.splice(index, 1)

    await student.save()
    await post.save()
    await Comment.deleteOne({ "_id": commentID })

    return { "message": "Comment deleted", "status": 201 }

}

async function deletePost(postID) {
    try {
        //console.log("Deleting post "+postID)
        const post = await Post.findById(postID);
        if (!post) {
            return { "message": "Post doesn't exist", "status": 404 };
        }
        const rollno = post.postedBy;
        const user = await Student.findOne({ "id": rollno });
        if (!user) {
            return { "message": "User doesn't exist", "status": 404 };
        }
        const index = user.posts.indexOf(postID);
        user.posts.splice(index, 1);
        await user.save()

        for (let i = 0; i < post.comments.length; i++) {
            await deleteComment(post.comments[i])
        }


        await Post.deleteOne({ "_id": postID });

        return { "message": "Post deleted", "status": 201 };
    } catch (error) {
        console.error(error);
        return { "message": "An error occurred", "status": 500 };
    }
}


async function getFacultyById(facultyID) {
    const faculty = await Faculty.findById(facultyID)

    if (faculty != null) {
        return { "message": "Faculty found", "Faculty Data": faculty }
    }
    else {
        return { "message": "Faculty not found", "status": 404 }
    }
}

async function getCommentByID(commentID) {
    const commentExists = await Comment.findById(commentID)
    if (commentExists == null) {
        return { "message": "Comment doesn't exist", "status": 404 }
    }
    else {
        return { "message": "Comment found", "status": 201, "comment": commentExists }
    }
}

async function addProject(id, project) {
    const studentExists = await Student.findOne({ "id": id })
    if (studentExists == null) {
        return { "message": "Student doesn't exist", "status": 400 }
    }
    console.log(studentExists)
    console.log(studentExists.projects)
    studentExists.projects.push(project)
    await studentExists.save()
    return { "message": "Project added", "status": 201, "Project added": project }
}


async function deleteProject(index, id) {
    const studentExists = await Student.findOne({ "id": id })
    if (studentExists == null) {
        return { "message": "Student doesn't exist", "status": 400 }
    }
    console.log(studentExists)
    if (studentExists.projects.length == 1) {
        studentExists.projects = []
        await studentExists.save()
        return
    }
    studentExists.projects.splice(index, 1)
    await studentExists.save()
    return { "message": "Project deleted", "status": 201 }
}


async function verifyAdmin(data) {
    const admin = await Admins.findOne({ "email": data.email });
    if (!admin) {
        return { "message": "Admin doesn't exist", "status": 404 };
    }

    if (admin.password == data.password) {
        const token = jwt.sign({ email: admin.email }, 'cvretdepartmentadmin', { expiresIn: '1h' });
        return { "message": "Admin Logged In", "status": 200, token: token };
    } else {
        return { "message": "Incorrect password", "status": 401 };
    }
}


async function deleteFaculty(id) {
    const facultyExists = await Faculty.findOne({ "_id": id })
    console.log(facultyExists)
    if (facultyExists == null) {
        return { "message": "Faculty doesn't exist", "status": 400 }
    }
    await Faculty.deleteOne({ "_id": id })
    return { "message": "Faculty deleted", "status": 201 }
}


async function getStudentById(id) {
    const student = await Student.findById(id)
    if (student == null) {
        return { "message": "Student doesn't exist", "status": 404 }
    }
    else {
        return { "message": "Student Found", "Student_Data": student }
    }
}

async function getFacultyByRollNo(facultyID) {
    const faculty = await Faculty.find({ "id": facultyID })

    if (faculty != null) {
        return { "message": "Faculty found", "FacultyData": faculty }
    }
    else {
        return { "message": "Faculty not found", "status": 404 }
    }
}

async function updateFaculty(id, body) {
    let facultyExists = await Faculty.findOne({ "_id": id })
    console.log(facultyExists)
    if (facultyExists == null) {
        return { "message": "Faculty doesn't exist", "status": 400 }
    }
    await Faculty.updateOne({ "_id": id }, body)
    return { "message": "Faculty updated", "status": 201 }
}


async function attendance(body) {
    let notSentArray = [];

    if (!body || !Array.isArray(body)) {
        return { "message": "Attendance not provided or not in the correct format", "status": 400 };
    }

    for (const student of body) {
        if (!student || !student.id || !student.attendance) {
            // Invalid student object, skip it
            continue;
        }

        let studentExists = await Student.findOne({ "id": student.id });
        if (!studentExists) {
            notSentArray.push(student.id);
            continue; // Skip if student doesn't exist
        }

        studentExists.attendance.push(student.attendance);
        await studentExists.save();
    }

    return { "message": "Attendance updated", "status": 201, "notSent": notSentArray };
}


async function reportBug(body) {
    console.log(body)
    let id = await Student.findOne({ "id": body.id });
    if(id==null){
        return { "message": "Student doesn't exist", "status": 400 }
    }
    else{
        const bug=new Bugs(body)
        await bug.save()
        return { "message": "Bug reported", "status": 201 }
    }
}

async function getAllBugs(){
    const bugs = await Bugs.find()
    return { "message": "Bugs returned", "status": 201, "bugs": bugs }
}

async function resolveBug(id){
    const bug = await Bugs.findOne({
        "_id": id
    })
    if (bug == null) {
        return { "message": "Bug doesn't exist", "status": 404 }
    }
    else {
        bug.resolved = true
        await bug.save()
        return { "message": "Bug resolved", "status": 201 }
    }
}

async function addEvent(body) {
    const newEvent = new Events(body)
    await newEvent.save()
    return { "message": "Event Added", "status": 201 }
}

async function getAllEvents(){
    const events = await Events.find()
    return { "message": "Events returned", "status": 201, "events": events }
}

async function deleteEvent(id){
    const event = await Events.findOne({
        "_id": id
    })
    if (event == null) {
        return { "message": "Event doesn't exist", "status": 404 }
    }
    else {
        await Events.deleteOne({ "_id": id })
        return { "message": "Event deleted", "status": 201 }
    }
}

async function undoResolvedErrors(id){
    const bug = await Bugs.findOne({
        "_id": id
    })
    if (bug == null) {
        return { "message": "Bug doesn't exist", "status": 404 }
    }
    else {
        bug.resolved = false
        await bug.save()
        return { "message": "Bug resolved", "status": 201 }
    }
}




module.exports.getStudentById = getStudentById
module.exports.verifyAdmin = verifyAdmin
module.exports.addStudent = addStudent
module.exports.getStudentByRollNo = getStudentByRollNo
module.exports.addPost = addPost
module.exports.getPostById = getPostById
module.exports.getCommentsOnPost = getCommentsOnPost
module.exports.addComment = addComment
module.exports.getAllPosts = getAllPosts
module.exports.login = login
module.exports.addFaculty = addFaculty
module.exports.getFaculty = getFaculty
module.exports.getFacultyById = getFacultyById
module.exports.deletePost = deletePost
module.exports.getCommentByID = getCommentByID
module.exports.deleteComment = deleteComment
module.exports.addProject = addProject
module.exports.deleteProject = deleteProject
module.exports.deleteFaculty = deleteFaculty
module.exports.updateFaculty = updateFaculty
module.exports.login2 = login2
module.exports.addPost2 = addPost2
module.exports.getFacultyByRollNo = getFacultyByRollNo
module.exports.attendance = attendance
module.exports.reportBug = reportBug
module.exports.getAllBugs = getAllBugs
module.exports.resolveBug = resolveBug
module.exports.addEvent = addEvent
module.exports.getAllEvents = getAllEvents
module.exports.deleteEvent = deleteEvent
module.exports.undoResolvedErrors = undoResolvedErrors
