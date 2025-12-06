const express = require("express")
const cors = require("cors")
const jwt = require('jsonwebtoken');

const app = express()

app.use(express.json())
app.use(cors())

const users = [{ id: "123", username: "testUsername", name: "testUser", password: "testPassword" }]
const blogs = [{ id: "345", title: "testTitle", content: "testContent", userId: "123" }]

const JWT_SECRET_KEY = "secret"

function generateRandomId(){
    return Math.floor(Math.random() * 10000)
}

function verifyToken(header){
    console.log({header})
    const authorizationHeader = header["authorization"]

    const token = authorizationHeader.split(" ")[1]
    const payload = jwt.verify(token,JWT_SECRET_KEY)
    console.log({users,payload})
    const foundUser = users.find((user)=>{return user.id === payload.userId})
    return foundUser
}

app.post("/signup", (req, res) => {
    const { username, password, name } = req.body
    if (!username || !password || !name) {
        return res.json({ error: "need username , password and name" })
    }
    // find if the user with provided username already exists
    const foundUser = users.find((user) => {
    return user.username === username
    })
    if(foundUser)return res.json({error:`a user with username ${username} already exists .`})
    
    const id = generateRandomId()
    users.push({id,username,password,name})
    return res.json("signed up successfully")

 
})
app.post("/signin", (req, res) => {
    const {username,password} = req.body
    if (!username || !password) {
        return res.json({ error: "need username and password both to signin" })
    }
    const foundUser = users.find((user)=>{return user.username === username && user.password === password })
    if(!foundUser)return res.json({ error: "incorrect username or password" })

    // sign a new token for the user
    var token = jwt.sign({ username:foundUser.username , userId:foundUser.id }, JWT_SECRET_KEY);
    return res.json({token})
})

app.get("/blogs", (req, res) => {
    if (!verifyToken(req.headers)){
        res.status(401).json({
            'msg': 'User is not authorized!'
        })
    }
    else{
        const allBlogs = blogs.map((eachBlog) => {
            return{
                userId: eachBlog.userId,
                title: eachBlog.title,
                content: eachBlog.content
            }
        })
        res.status(200).json({
            'blogsData': allBlogs
        })
    }
    
})

app.post("/create-blogs", (req, res) => {
    if(!verifyToken(req.headers)){
        res.status(401).json({
            'msg': 'User is not authorized!'
        })
    }
    else{
        const {userId, title, content} = req.body;
        const newBlog = {
            id: generateRandomId(),
            userId,
            title,
            content
        }
        blogs.push(newBlog)
        res.status(200).json({
            'updatedBlog': newBlog,
            'msg': 'New Blog added successfully!!'
        })
    }
})

app.get("/blogs/:id", (req, res) => {
    if(!verifyToken(req.headers)){
        res.status(401).json({
            'msg': 'User is not authorized!'
        })
    }
    else{
        const blogId = req.params.id;
        const blogExists = blogs.find((eachBlog) => eachBlog.id === blogId);
        if (blogExists){
                res.status(200).json({
                    'msg': 'Blog found!',
                    'blogData': blogExists
                })
            }
            else{
                res.status(401).json({
                    'msg': 'Blog not found!'
                })
            }
        }
    }
)

const port = 3000;

app.listen(port, () => {
    console.log(`Server started at port: ${port}`);
})