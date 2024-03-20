const express = require('express');
const { authmiddleware } = require('../middleware');
const { Accounts } = require('../db');
const { default: mongoose } = require('mongoose');
const router = express.Router();


router.get('/balance', authmiddleware, async (req, res) => {
    try {
        const account = await Accounts.findOne({
            userId: req.userId
        });

        if (!account) {
            return res.status(404).json({
                message: 'Account not found'
            });
        }

        res.status(200).json({
            balance: account.balance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/transfer', authmiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const {amount, to} = req.body;

    //fetch accounts within the transactions

    const account = await Accounts.findOne({userId: req.userId}).session(session);


    // insufficient balance
    if(!account || amount > account.balance){
        await session.abortTransaction();
        return res.status(400).json({
            message: ' Insifficient balance'
        });
    }


    const toAccount = await Accounts.findOne({userId: to}).session(session);
    
    // account not found
    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message: 'Invalid account'
        });
    }


    // perform transaction
    await Accounts.updateOne({userId: req.userId}, {$inc: {balance: -amount}}).session(session);
    await Accounts.updateOne({userId: to}, {$inc: {balance: amount}}).session(session);

    // commit the transaction

    await session.commitTransaction();
    res.json({
        message:"Transfer successful"
    });

});


module.exports = router;