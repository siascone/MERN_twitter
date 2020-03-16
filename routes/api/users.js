const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const keys = require('../../config/keys');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

router.get("/test", (req, res) =>
  res.json({ msg: "This is the users route" })
); 

router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // res.send(req.user);
        res.json({
            id: req.user.id,
            handle: req.user.handle,
            email: req.user.email
        });
    }
);

router.post('/register', (req, res) => {
    //Check to make sure nobody has already registered with a duplicate email
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ handle: req.body.handle })
      .then(user => {
          if (user) {
              //Use the validations to send the error
              //Throw a 400 error if the email address already exists
              //errors.email = 'Email already exists';
              errors.handle = "User already exists";
              return res.status(400).json(errors);
          } else {
              //Otherwise create a new user
              const newUser = new User({
                  handle: req.body.handle,
                  email: req.body.email,
                  password: req.body.password
              });

              bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                      if (err) throw err;
                      newUser.password = hash;
                      newUser.save()
                        .then(user => {
                            const payload = { id: user.id, handle: user.handle };

                            jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });    
                            });
                        })
                        .catch(err => console.log(err));
                  });
              });
          }
      });
});

router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const handle = req.body.handle;
    const password = req.body.password;

    User.findOne({handle})
      .then(user => {
          if (!user) {
              //Use validations to send error
              //errors.email = 'User not found';
              errors.handle = 'This user does not exist';
              return res.status(404).json(errors);
          }

          bcrypt.compare(password, user.password)
            .then(isMatch => {
                if (isMatch) {
                    // res.json({msg: 'Success'});
                    const payload = {id: user.id, handle: user.handle };

                    jwt.sign(
                        payload,
                        keys.secretOrKey,
                        //Tell the key to expire in one hour
                        { expiresIn: 3600 },
                        (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            });
                        });
                } else {
                    //And here:
                    errors.password = 'Incorrect password';
                    return res.status(400).json(errors);
                }
            });
      });
});

module.exports = router;
