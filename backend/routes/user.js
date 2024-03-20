const express = require('express');
const { userSignup, userSignin, updateBody } = require('../types');
const { User, Accounts } = require('../db');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authmiddleware } = require('../middleware');
const { JWT_SECRET } = require('../config');


//   router to sign up

console.log('User routes loaded');

router.post("/signup", async (req, res) => {
    try {
        const { username, password, firstName, lastName } = req.body; // Extract properties from req.body

        // Validate request body
        const signupResponse = userSignup.safeParse({
            username,
            password,
            firstName,
            lastName,
        });

        // Validations
        if (!signupResponse.success) {
            console.log(signupResponse);
            return res.status(400).send({
                success: false,
                message: "Invalid Credentials",
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ username }); // Find user by username

        // Existing user
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "Already registered. Please login.",
            });
        }

        // Create new user
        const user = await new User({
            username,
            password,
            firstName,
            lastName,
        }).save();

        const userId = user._id;

        await Accounts.create({
            userId,
            balance: 1 + Math.random() * 100000
        })

        const token = jwt.sign({
            userId
        }, JWT_SECRET);

        
        res.status(201).send({
            success: true,
            message: "User registered successfully",
            token : token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in registration",
            error: error.message,
        });
    }
});



// router to sign in

router.post('/signin', async (req, res) => {
    const success = userSignin.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: 'Invalid inputs'
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id,

        }, JWT_SECRET)

        res.json({
            token: token
        })
        return;
    }

    res.status(411).json({
        message: 'Error while loging in'
    })
});



// update user

router.put('/user', authmiddleware,  async (res, req) => {
    const success = updateBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: 'Invalid inputs'
        })
    }

    await User.findByIdAndUpdate({ _id: req.userId }, req.body);
    res.json({
        message: 'Updated successfully'
    })

});



// to search friends

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
module.exports = router;