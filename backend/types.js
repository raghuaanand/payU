const zod = require('zod');

const userSignup = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
});

const userSignin = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})
module.exports = {
    userSignup: userSignup,
    userSignin: userSignin,
    updateBody: updateBody
}