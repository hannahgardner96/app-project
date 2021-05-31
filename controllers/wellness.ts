// ===== DEPENDENCIES ===== //
// consulted someone with experience for TS formatting
import * as express from 'express' // JS: const router = express.Router()
import * as mongoose from 'mongoose' // JS: const mongoose = require("mongoose")
import * as methodOverride from 'method-override' // JS: const methodOverride = require('method-override')
import * as bcrypt from "bcrypt"

export const router = express.Router()

// type documentation for expess session https://github.com/DefinitelyTyped/DefinitelyTyped/blob/57e279fb29f06e2e6766118b585d0a3e940c45b3/types/express-session/index.d.ts#L203 used to declare additional properties that solved a type error when declaring req.session.user
declare module 'express-session' {
    interface SessionData { // 
        user: any; // mongoose has bad typescript support: https://thecodebarbarian.com/working-with-mongoose-in-typescript.html this solves the typescript error for req.session.user
    }
}

// ========== //
router.use(methodOverride('_method'))

// ===== VARIABLES ===== //
import {EmotionalWellness} from "../models/emotional-wellness"
import {NutritionalWellness} from "../models/nutritional-wellness"
import {PhysicalWellness} from "../models/physical-wellness"
import {SocialWellness} from "../models/social-wellness"
import {TotalWellness} from "../models/total-wellness"
import { resolveSoa } from 'dns'

// ===== ROUTES ===== // 
// login
router.get("/login", (req, res) => {
    res.render("login.ejs")
})

// login next
router.post("/login", (req, res) => {
    TotalWellness.find({username: req.body.username}, (error, user) => {
        if (error) {
            res.send(error)
        } else if (user.length === 0) { // want to check that find returns an array with a single element, not an empty array
            res.render("login-incorrect-username.ejs")
        } else  if (!bcrypt.compareSync(req.body.password, user[0].password)) { //find will always return an array so we want to find at [0] bc it is a singleton array
            res.render("login-incorrect-password.ejs")
        } else {
            req.session.user = user[0] // req.session.user attaches the variable user to the session information, express stores that for you
            res.redirect("/wellness")
        }
    })
})

// create account 
router.get("/createaccount", (req, res) => {
    res.render("create-account.ejs")
})

// create account post 
router.post("/createaccount", (req, res) => {
    TotalWellness.find({username: req.body.username}, (error, user) => {
        if (error) {
            res.send(error)
        } else if (user.length === 0) {
            const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync())
            req.body.password = password
            TotalWellness.create(req.body, (error, newUser) => {
                if (error) {
                    res.send(error)
                } else {
                    req.session.user = newUser // this assigns the "newUser" to a session
                    console.log(newUser)
                    res.redirect("/login")
                }
            })
        } else if (user) {
            res.render("create-account-username-exists.ejs")
        } 
    })
})


// home
router.get("/wellness", (req, res) => {
    TotalWellness.find({}, (error, wellness) => {
        if (error) {
            res.send(error)
        } else {
            res.render("home.ejs", {
                wellness: wellness
            })
        }
    })
})

// new emotional log
router.get("/wellness/newemotional", (req, res) => {
    TotalWellness.find({}, (error, wellness) => {
        if (error) {
            res.send(error)
        } else {
            res.render("new-emotional-log.ejs", {
                wellness: wellness
            })
        }
    })
})

// create
router.post("/wellness/newemotional", (req, res) => {
    EmotionalWellness.create(req.body, (error, log) => {
        if (error) {
            res.send(error)
        } else {
            console.log(log)
            res.redirect("/wellness")
        }
    })
})

// new physical log
router.get("/wellness/newphysical", (req, res) => {
    TotalWellness.find({}, (error, wellness) => {
        if (error) {
            res.send(error)
        } else {
            res.render("new-physical-log.ejs", {
                wellness: wellness
            })
        }
    })
})

// create
router.post("/wellness/newphysical", (req, res) => {
    PhysicalWellness.create(req.body, (error, log) => {
        if (error) {
            res.send(error)
        } else {
            console.log(log)
            res.redirect("/wellness")
        }
    })
})

// new nutritional log
router.get("/wellness/newnutritional", (req, res) => {
    TotalWellness.find({}, (error, wellness) => {
        if (error) {
            res.send(error)
        } else {
            res.render("new-nutritional-log.ejs", {
                wellness: wellness
            })
        }
    })
})

// create
router.post("/wellness/newnutritional", (req, res) => {
    NutritionalWellness.create(req.body, (error, log) => {
        if (error) {
            res.send(error)
        } else {
            console.log(log)
            res.redirect("/wellness")
        }
    })
})

// new social log
router.get("/wellness/newsocial", (req, res) => {
    TotalWellness.find({}, (error, wellness) => {
        if (error) {
            res.send(error)
        } else {
            res.render("new-social-log.ejs", {
                wellness: wellness
            })
        }
    })
})

// create
router.post("/wellness/newsocial", (req, res) => {
    SocialWellness.create(req.body, (error, log) => {
        if (error) {
            res.send(error)
        } else {
            console.log(log)
            res.redirect("/wellness")
        }
    })
})

// view emotional log trend
router.get("/wellness/emotionaltrend", (req, res) => {
    TotalWellness.find({username: req.session.user.username}, (error, wellnessData) => {
        if (error) {
            res.render(error)
        } else {
            res.render("view-emotional-trend.ejs", {
                wellnessData: wellnessData
            })
        }
    })
})

// view physical log trend
router.get("/wellness/physicaltrend", (req, res) => {
    PhysicalWellness.find({}, (error, wellnessData) => {
        if (error) {
            res.render(error)
        } else {
            res.render("view-physical-trend.ejs", {
                wellnessData: wellnessData
            })
        }
    })
})

// view nutritional log trend
router.get("/wellness/nutritionaltrend", (req, res) => {
    NutritionalWellness.find({}, (error, wellnessData) => {
        if (error) {
            res.render(error)
        } else {
            res.render("view-nutritional-trend.ejs", {
                wellnessData: wellnessData
            })
        }
    })
})

// view social log trend
router.get("/wellness/socialtrend", (req, res) => {
    SocialWellness.find({}, (error, wellnessData) => {
        if (error) {
            res.render(error)
        } else {
            res.render("view-social-trend.ejs", {
                wellnessData: wellnessData
            })
        }
    })
})

// edit emotional wellness log
router.get("/wellness/emotionaltrend/:id/edit", (req, res) => {
    EmotionalWellness.findById(req.params.id, null, null, (error, data) => {
        if (error) {
            res.send(error)
        } else {
            res.render("edit-emotional-log.ejs", {
                data: data
            })
        }
    })
})

// update
router.put("/wellness/emotionaltrend/:id", (req, res) => {
    EmotionalWellness.findByIdAndUpdate(req.params.id, req.body, {new: true}, (error, log) => {

        res.redirect("/wellness/emotionaltrend")
    })
})

// edit physical wellness log
router.get("/wellness/physicaltrend/:id/edit", (req, res) => {
    PhysicalWellness.findById(req.params.id, null, null, (error, data) => {
        if (error) {
            res.send(error)
        } else {
            res.render("edit-physical-log.ejs", {
                data: data
            })
        }
    })
})

// update
router.put("/wellness/physicaltrend/:id", (req, res) => {
    PhysicalWellness.findByIdAndUpdate(req.params.id, req.body, {new: true}, (error, log) => {
        res.redirect("/wellness/physicaltrend")
    })
})

// edit nutritional wellness log
router.get("/wellness/nutritionaltrend/:id/edit", (req, res) => {
    NutritionalWellness.findById(req.params.id, null, null, (error, data) => {
        if (error) {
            res.send(error)
        } else {
            res.render("edit-nutritional-log.ejs", {
                data: data
            })
        }
    })
})

// update
router.put("/wellness/nutritionaltrend/:id", (req, res) => {
    NutritionalWellness.findByIdAndUpdate(req.params.id, req.body, {new: true}, (error, log) => {
        res.redirect("/wellness/nutritionaltrend")
    })
})

// edit social wellness log
router.get("/wellness/socialtrend/:id/edit", (req, res) => {
    SocialWellness.findById(req.params.id, null, null, (error, data) => {
        if (error) {
            res.send(error)
        } else {
            res.render("edit-social-log.ejs", {
                data: data
            })
        }
    })
})


// update
router.put("/wellness/socialtrend/:id", (req, res) => {
    SocialWellness.findByIdAndUpdate(req.params.id, req.body, {new: true}, (error, log) => {
        res.redirect("/wellness/socialtrend")
    })
})

// delete emotional log
router.delete("/wellness/emotionaltrend/:id", (req, res) => {
    EmotionalWellness.findByIdAndRemove(req.params.id, null, (error, deleteSuccess) => { // adding null solved a type error produced by using the error parameter second when it wanted the option parameter second, consulted someone with experience
        if (error) {
            res.send(error)
        } else {
            res.redirect("/wellness/emotionaltrend")
        }
    })
})

// delete physical log
router.delete("/wellness/physicaltrend/:id", (req, res) => {
    PhysicalWellness.findByIdAndRemove(req.params.id, null, (error, deleteSuccess) => { // adding null solved a type error produced by using the error parameter second when it wanted the option parameter second
        if (error) {
            res.send(error)
        } else {
            res.redirect("/wellness/physicaltrend")
        }
    })
})

// delete nutritional log
router.delete("/wellness/nutritionaltrend/:id", (req, res) => {
    NutritionalWellness.findByIdAndRemove(req.params.id, null, (error, deleteSuccess) => { // adding null solved a type error produced by using the error parameter second when it wanted the option parameter second
        if (error) {
            res.send(error)
        } else {
            res.redirect("/wellness/nutritionaltrend")
        }
    })
})

// delete social log
router.delete("/wellness/socialtrend/:id", (req, res) => {
    SocialWellness.findByIdAndRemove(req.params.id, null, (error, deleteSuccess) => { // adding null solved a type error produced by using the error parameter second when it wanted the option parameter second
        if (error) {
            res.send(error)
        } else {
            res.redirect("/wellness/socialtrend")
        }
    })
})