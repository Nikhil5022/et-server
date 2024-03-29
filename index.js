const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 9000;
const schemas = require('./schemas.js');
const confidential = require('./confidential.js');
const queries = require('./queries.js');
const { json } = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
var { data } = require('jquery');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//MIDDLEWARES
app.use(express.json());
app.use(cors({
    origin: '*'
}));


app.post('/verifyAdmin', (req, res) => {
    const adminData = req.body;
    queries.verifyAdmin(adminData).then(response => {
        res.send(response);
    });
});



app.use('/verify', (req, res, next) => {
    try {

        let token = req.headers.authorization;

        if (token != null) {
            console.log(token);
            token = token.split(" ")[1];
            let student = jwt.verify(token, confidential.SECRET_KEY);
            console.log(student.id);
            res.send({ "UserID": student.id });
        }
        else {
            res.sendStatus(401).json({ message: "unauthorised user" });
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(201).json({ message: "Unauthorized user" });
    }
});




//GET Methods
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/getStudentById/:id', (req, res) => {
    id = req.params.id;
    queries.getStudentById(id).then(response => {
        res.send(response);
    });
});

app.get("/getStudentByRollNo/:rollno", (req, res) => {
    rollno = req.params.rollno;
    queries.getStudentByRollNo(rollno).then(response => {
        if (response.message == "Student Found") {
            res.status(200).send(response);
        }
        else if (response.message == "Student doesn't exist") {
            res.status(404).send(response);
        }
    }).catch(err => {
        console.log(err);
    });
});

app.get('/getCommentsOnPost/:postID', (req, res) => {
    postID = req.params.postID;
    queries.getCommentsOnPost(postID).then(response => {
        res.status(response.status).send(response);
    });
});

app.get("/getPostById/:postID", (req, res) => {
    postID = req.params.postID;
    queries.getPostById(postID).then(response => {
        res.status(response.status).send(response);
    });
});

app.get("/getFaculty", (req, res) => {
    queries.getFaculty().then(response => {
        res.status(200).send(response);
    });
});

app.get("/getPublication", (req, res)=>{
    queries.getPublication().then(response=>{
        res.status(200).send(response);
    });
});

app.get("/getWorkshop", (req, res)=>{
    queries.getWorkshop().then(response=>{
        res.status(200).send(response);
    });
});

app.get("/getFacultyById/:facultyID", (req, res) => {
    facultyID = req.params.facultyID;
    queries.getFacultyById(facultyID).then(response => {
        res.status(200).send(response);
    });
});

app.get("/getFacultyByRollNo/:rollno", (req, res) => {
    rollno = req.params.rollno;
    queries.getFacultyByRollNo(rollno).then(response => {
        res.status(200).send(response);
    });
});

app.get("/getPublicationByID/:id", (req, res)=>{
    id=req.params.id;
    queries.getPublicationByID(id).then(response=>{
        res.status(200).send(response);
    });
});






app.get("/verify", (req, res) => {
    res.send({ "User ID": req.userID , "User Name":req.userName});
});

app.get("/getAllPosts", (req, res) => {
    queries.getAllPosts().then(response => {
        res.status(response.status).send(response);
    });
});

app.get("/getCommentByID/:commentID", (req, res) => {
    commentID = req.params.commentID;
    queries.getCommentByID(commentID).then(response => {
        res.status(response.status).send(response);
    });
});

app.get("/getAllBugs", (req, res) => {
    queries.getAllBugs().then(response => {
        res.send(response)
    })
})

app.get("/getAllEvents", (req, res) => {
    queries.getAllEvents().then(response => {
        res.send(response)
    })
})

//POST Methods
app.post('/updateFaculty/:facultyID', (req, res) => {
    facultyID = req.params.facultyID;
    let data = req.body;
    queries.updateFaculty(facultyID, data).then(response => {
        res.send(response);
    });
});
app.post('/addStudent', (req, res) => {
    studentData = req.body;
    //console.log(studentData)
    queries.addStudent(studentData).then(response => {
        console.log(response);
        res.send({ "message": response });
    }).catch(err => {
        res.send(err);
    });
});

app.post('/addFaculty', (req, res) => {
    facultyData = req.body;

    queries.addFaculty(facultyData).then(response => {
        console.log(response);
        res.send({ "message": response });
    }).catch(err => {
        res.send(err);
    });
});

app.post('/addPublication', (req, res)=>{
    publicationData=req.body;

    queries.addPublication(publicationData).then(response=>{
        console.log(response);
        res.send({"message":response});
    }).catch(err=>{
        res.send(err);
    });
});

app.post('/addWorkshop', (req, res)=>{
    workshopData=req.body;

    queries.addWorkshop(workshopData).then(response=>{
        console.log(response);
        res.send({"message":response});

    }).catch(err=>{
        res.send(err);
    });


});

app.post('/addPost2', (req, res) => {
    postData = req.body;

    queries.addPost2(postData).then(response => {
        res.send(response);
    });
});

app.post('/loginUser', (req, res) => {
    const loginForm = req.body;

    queries.login(loginForm).then(resp => {
        res.status(resp.status).send(resp);
    });
});

app.post('/login',(req,res)=>{
    const loginForm = req.body;
    console.log(loginForm);
    queries.login2(loginForm).then(resp => {
        res.send(resp);
    });
});

app.post('/addEvent', (req, res) => {
    const eventData = req.body
    queries.addEvent(eventData).then(response => {
        res.send(response)
    })
})



//PUT Methods
app.post('/addComment/:postID', (req, res) => {
    const postID = req.params.postID;
    const comment = req.body;

    // Assuming 'postedBy' is a string representing the student's ObjectId
    // If it's not already an ObjectId, you need to convert it before passing it to addComment
    comment.postedBy = mongoose.Types.ObjectId(comment.postedBy);

    queries.addComment(postID, comment).then(response => {
        if (response.status) {
           res.send(response);
        } else {
            res.send(response);
        }
    }).catch(error => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.put("/addProject/:studentID", async (req, res) => {
    const studentID = req.params.studentID;
    const projectInfo = req.body;

    queries.addProject(studentID, projectInfo).then(response => {
        res.status(response.status).send(response);
    }).catch(error => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });

});

app.post('/addAttendance', (req, res) => {
    const attendance = req.body
    queries.attendance(attendance).then(response => {
        res.send(response)
    })
})

app.post('/reportBug', (req, res) => {
    const bug = req.body
    queries.reportBug(bug).then(response => {
        res.send(response)
    })
})

app.put('/resolveBug/:id', (req, res) => {
    const id = req.params.id
    queries.resolveBug(id).then(response => {
        res.send(response)
    })
})

app.put('/unresolveBug/:id', (req, res) => {
    const id = req.params.id
    queries.undoResolvedErrors(id).then(response => {
        res.send(response)
    })
})


//DELETE Methods
app.delete('/deletePost/:postID', (req, res) => {
    postID = req.params.postID;

    queries.deletePost(postID).then(response => {
        res.status(response.status).send(response);
    });
});

app.delete('/deleteComment/:commentID', (req, res) => {
    commentID = req.params.commentID;

    queries.deleteComment(commentID).then(response => {
        res.status(response.status).send(response);
    });
});

app.delete('/deleteProject/:rollno/:index', (req, res) => {
    rollno = req.params.rollno;
    index = req.params.index;
    queries.deleteProject(index, rollno).then(response => {
        res.send(response);
    });
});

app.delete('/deleteFaculty/:facultyID', (req, res) => {
    facultyID = req.params.facultyID;
    console.log(facultyID);
    queries.deleteFaculty(facultyID).then(response => {
        res.send(response);
    });
});


app.delete('/deleteFaculty/:facultyID', (req, res) => {
    facultyID = req.params.facultyID;
    data = req.body;
    queries.deleteFaculty(facultyID, data).then(response => {
        res.send(response);
    });
});

app.put('/updateFaculty/:facultyID', (req, res) => {
    facultyID = req.params.facultyID;
    data = req.body;
    queries.updateFaculty(facultyID, data).then(response => {
        res.send(response);
    });
});

app.delete('/deleteEvent/:eventID', (req, res) => {
    eventID = req.params.eventID
    queries.deleteEvent(eventID).then(response => {
        res.send(response)
    })
})

app.delete('/deleteBug/:id', (req, res) => {
    const id = req.params.id
    queries.deleteBug(id).then(response => {
        res.send(response)
    })
}) 

app.listen(port, () => {
    console.log('listening at port ' + port);
});

mongoose.connect(confidential.MONGOURI).then(() => {
    console.log("connected to database");
}).catch((e) => console.log(e));