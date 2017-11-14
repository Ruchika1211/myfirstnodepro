// var express = require('express');
// var router = express.Router();
// var User = require('../models/user');
// var bcrypt = require('bcrypt');
// var jwt = require('jsonwebtoken');
//
// router.post('/', function (req, res, next) {
//  var user = new User({
//  	firstName:req.body.firstName,
//     lastName: req.body.lastName,
//     password:bcrypt.hashSync(req.body.password,10),
//     email: req.body.email,
//   });
//
//  user.save((err,user)=>{
//
//  	if (err) {
//             return res.status(500).json({
//                 title: 'An error occurred',
//                 error: err
//             });
//         }
//         res.status(201).json({
//             message: 'Saved user',
//             obj: user
//         });
//
//  })
// });
//
// router.post('/signin', function (req, res, next) {
//     User.findOne({email:req.body.email},(err,user)=>{
//         if (err)
//         {
//             return res.status(500).json({
//                 title: 'An error occurred',
//                 error: err
//             });
//         }
//         if(!user)
//         {
//             return res.status(500).json({
//                 title: 'user not found',
//                 error: 'invalid login'
//             });
//         }
//         if(!bcrypt.compareSync(req.body.password,user.password))
//         {
//            return res.status(500).json({
//                 title: 'Invalid password',
//                 error: 'pssword not match'
//             });
//         }
//         var token = jwt.sign({user:user},'secret',{expiresIn:7200});
//         res.status(200).json({
//             title: 'userfound',
//             token: token,
//             userId:user._id
//         });
//
//     });
//
//
// });
//
// module.exports = router;
