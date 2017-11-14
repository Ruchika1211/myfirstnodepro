var Users = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var multer = require("multer");
var fs = require('fs');
var randomstring = require("randomstring");
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "ruchika.s@infiny.in",
        pass: "iluvmadad"
    }
});
var helper = require('../services/helper.js');
//var base64Img = require('base64-img');
//var uploader = require('base64-image-upload');


exports.signup = (req, res) => {
    console.log(req.body);
    //user.device_id.push(device_id);
    Users.findOne({
        email: req.body.email
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (user) {
            return res.status(200).json({
                title: 'User already exist',
                error: "true",
                detail: err
            });
        }

        var userdata = new Users({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
            email: req.body.email,
            contact: req.body.contact,
            dob: req.body.dob,
            deviceToken: [req.body.deviceToken],
            imageUrl: "noImage",
            address: {
                postalCode: req.body.postalcode,
                address: req.body.address,
                city: req.body.city
            }
        });



        userdata.save((err, user) => {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }

            var data = {
                _id: user._id,
                email: user.email,
            }
            var token = jwt.sign({
                user: data
            }, 'pickup', {
                expiresIn: 7200
            });
            res.status(200).json({
                title: 'Saved user',
                error: "false",
                token: token,
                user: user
            });

        })



    });


}

exports.logoutUser = (req, res) => {

    var token = req.body.userToken;
    console.log(token);
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    console.log("decoded");
    // if (!decoded) {
    //     return res.status(200).json({
    //         title: 'Security issue',
    //         error: "true",
    //         detail: "User token mismatched"
    //     });
    // }
    Users.findOne({
        _id: decoded.user._id
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!user) {
            return res.status(200).json({
                title: 'No such user found',
                error: "false"
            });
        }

        
        var arrayofToken = user.deviceToken;
        var index = arrayofToken.indexOf(req.body.deviceToken);
        if (index > -1) {
            user.deviceToken.splice(index, 1);
        }
        user.isLoggedIn = false;
        user.save((err, data) => {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            res.status(200).json({
                message: 'Logout succesfull',
                error: "false"

            });

        })


    });




}



exports.signin = (req, res) => {
    console.log(req.body);
    Users.findOne({
        email: req.body.email
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!user) {
            return res.status(200).json({
                title: 'user not found',
                error: "true",
                detail: "invalid Login"
            });
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            console.log("err");
            console.log("user");
            return res.status(200).json({
                title: 'Invalid password',
                error: "true",
                detail: 'password does not match'

            });
        }
        var data = {
            _id: user._id,
            email: user.email,

        }

        var device_id = req.body.deviceToken;
        console.log(user.deviceToken);
        console.log(device_id);

        var valueexist = helper.checkIfduplicates(user.deviceToken, device_id);
        console.log(valueexist);
        if (valueexist) {
            console.log('do nothing');

            var token = jwt.sign({
                user: data
            }, 'pickup', {
                expiresIn: 7200
            });
            res.status(200).json({
                title: 'user found',
                error: "false",
                token: token,
                user: user
            });
        } else {

            user.deviceToken.push(device_id);
            user.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                    });
                }

                var token = jwt.sign({
                    user: data
                }, 'pickup', {
                    expiresIn: 7200
                });
                res.status(200).json({
                    title: 'user found',
                    error: "false",
                    token: token,
                    user: user
                });



            });

        }
    });

}

exports.forgotPassword = (req, res) => {

    var token = randomstring.generate({
        length: 7,
        charset: 'numeric'
    });
    // crypto.randomBytes(5, (err, buf) => {
    // if (err) {
    //   return res.status(500).json({
    //        title: 'Invalid string generated',
    //        error: err
    //    });
    // }
    // console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
    // token = buf.toString('hex');
    // });
    Users.findOne({
        email: req.body.email
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!user) {
            return res.status(200).json({
                title: 'user not found',
                error: "true",
                detail: 'invalid login'

            });
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }

            var mailOptions = {
                to: user.email,
                from: 'ruchika.s@infiny.in',
                subject: 'Pickcup Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Your token to reset your password is:\n\n' +
                    token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                    });
                }

                res.status(200).json({
                    title: 'RESET PASSSWORD',
                    error: "false",
                    detail: 'Reset email sent'

                });
            });




        });




    });
}

exports.verifyresetPasswordToken = (req, res) => {
    console.log(req.body);
    var token = req.body.token;
    Users.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!user) {
            return res.status(200).json({
                title: 'user not found',
                error: "true",
                detail: 'No user with such token or token has been expired'

            });
        }
        var UserSavedToken = user.resetPasswordToken
        if (!(UserSavedToken == req.body.token)) {
            return res.status(200).json({
                title: 'otp not matching',
                error: "true"

            });
        }

        res.status(200).json({
            title: 'Otp matched',
            error: "false",
            detail: 'correct otp'

        });

        // user.password = req.body.password;
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpires = undefined;
        // user.save(function(err) {
        //     if (err)
        //     {
        //         return res.status(500).json({
        //             title: 'An error occurred',
        //             error: "true",
        //             detail:err
        //         });
        //     }
        //     res.status(200).json({
        //         title: 'Password Reset Succesful',
        //         error: "false",
        //         detail:'Succesfully set your password'
        //
        //     });
        //
        //  });


    });

}

exports.resetPassword = (req, res) => {
    console.log(req.body);
    Users.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!user) {
            return res.status(200).json({
                title: 'user not found',
                error: "true",
                detail: 'invalid login'

            });
        }
        user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            res.status(200).json({
                title: 'Password Reset Succesful',
                error: "false",
                detail: 'Succesfully set your password'

            });

        });


    });

}

exports.editProfile = (req, res) => {
    var token = req.body.userToken;
    console.log(req.body);
    console.log('req.body>>>>>>>>>>>>.');
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    console.log('decoded');
   Users.findOne({
        "_id": decoded.user._id
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!user) {
            return res.status(200).json({
                title: 'user not found',
                error: "true",

            });
        }

        // var imgName='user._id' + '.png';
        //   // var fs = require("fs");
        // var image = req.body.userImage;
        //  var dir =  require('path').basename(__dirname) + '/upload/';


        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        user.contact= req.body.contact;
        user.dob = req.body.dob;

        user.address.postalCode = req.body.postalcode;
        user.address.address = req.body.address;
        user.address.city = req.body.city;
        var today = randomstring.generate(7);
        user.imageUrl = helper.url() + '/users/' + decoded.user._id;
        user.save((err, user) => {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            res.status(200).json({
                title: 'user updated Succesfully',
                error: "false",

                user: user
            });


        });


    });



    // });


}

exports.editAddCardDetails = (req, res) => {
    console.log(req.body);
    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    Users.findOne({
        _id: decoded.user._id
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!user) {
            return res.status(200).json({
                title: 'user not found',
                error: "true",
                detail: err
            });
        }

        user.cardDetails.card_number = req.body.card_number;
        user.cardDetails.expiryDate = new Date(req.body.expiryDate);
        user.cardDetails.cvv = req.body.cvv;

        user.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            res.status(200).json({
                title: 'card details saved succesfully',
                error: "false",



            });

        });


    });

}



exports.updateUserlastseen = (req, res) => {
      var token = req.body.userToken;
    console.log(req.body);
    console.log('req.body>>>>>>>>>>>>.');
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    console.log('decoded');
    //user.device_id.push(device_id);
    Users.findOne({
        "_id": decoded.user._id
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!user) {
            return res.status(500).json({
                title: 'User not found',
                error: "true",
              
            });
        }

        user.lastseen = new Date();



        user.save((err, user) => {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            res.status(200).json({
                message: 'lastseen updated',
                error: "false",
                
            });

        })



    });


}