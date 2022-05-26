const express = require('express')
const cors = require('cors');
const mongoose = require('mongoose')
const User = require('./models/User.models')
const Landmark = require('./models/Landmark.models')
const Staff = require('./models/Staff.models')
const Event = require('./models/Event.models')
const Order = require('./models/Order.models')
const Payment = require('./models/Payment.models')
const Meeting = require('./models/Meeting.models')
const app = express()
const bodyParser = require('body-parser')
const { body, validationResult, check } = require('express-validator');
const crypto = require('crypto');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.post(
    '/register',
    body('email')
        .isEmail()
        .withMessage('Некорректный e-mail')
        .custom(value => {
            return User.findOne({ email: value }).then(user => {
                if (user) {
                    return Promise.reject('Данный e-mail уже используется');
                }
            });
        }),
    body('password').isLength({ min: 5 })
        .withMessage('Некорректный пароль, минимальная длина 5 символов'),
    (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = +new Date()
        const salt = `${req.body.password}-23d]k.L<gp-A-)ua`
        const password = crypto.createHash('md5').update(salt).digest('hex')

        User.create({
            id: userId,
            email: req.body.email,
            password: password,
            isAdmin: false
        }).then(user => res.status(200).json({ user, errors: [] }));
    },
);

app.post(
    '/login',
    body('email')
        .isEmail()
        .withMessage('Некорректный e-mail'),
    body('password').isLength({ min: 5 })
        .withMessage('Некорректный пароль, минимальная длина 5 символов'),
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findOne({ email: req.body.email })

        if (user) {
            const salt = `${req.body.password}-23d]k.L<gp-A-)ua`
            const password = crypto.createHash('md5').update(salt).digest('hex')

            if (user.password === password) {
                const date = +new Date()
                const salt = `${req.body.password}-${date}`
                user.lastLogin = date
                user.token = crypto.createHash('md5').update(salt).digest('hex')
                await user.save()
                return res.status(200).json({ user, errors: [] });
            } else {
                return res.status(400).json({ errors: [
                        {
                            "value": req.body.password,
                            "msg": "Неверный пароль",
                            "param": "password",
                            "location": "body"
                        },
                    ] });
            }
        } else {
            return res.status(400).json({ errors: [
                    {
                        "value": req.body.password,
                        "msg": "Неверный пароль",
                        "param": "password",
                        "location": "body"
                    },
                ] });
        }

    }
);

app.get(
    '/staff/list',
    async (req, res) => {
        const staff = await Staff.find()
        return res.status(200).json({ staff });
    }
);

app.post(
    '/staff/add',
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const landmarkId = +new Date()

        console.log(req.body)

        Staff.create({
            id: landmarkId,
            name: req.body.name,
            position: req.body.position,
            address: req.body.address,
            phone: req.body.phone,
            birthday: req.body.birthday
        }).then(staff => res.status(200).json({ staff, errors: [] }));

    },
);

app.post(
    '/staff/edit',
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const staff = await Staff.findOne({ id: req.body.id })

        staff.name = req.body.name
        staff.position = req.body.position
        staff.address = req.body.address
        staff.phone = req.body.phone
        staff.birthday = req.body.birthday
        await staff.save()

        return res.status(200).json({staff, errors: []})
    },
);

app.get(
    '/event/list',
    async (req, res) => {
        const events = await Event.find()
        return res.status(200).json({ events });
    }
);

app.post(
    '/event/add',
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const landmarkId = +new Date()

        console.log(req.body)

        Event.create({
            id: landmarkId,
            name: req.body.name,
            date: req.body.date,
            address: req.body.address,
            price: req.body.price,
        }).then(event => res.status(200).json({ event, errors: [] }));

    },
);

app.post(
    '/event/edit',
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const event = await Event.findOne({ id: req.body.id })

        event.name = req.body.name
        event.date = req.body.date
        event.address = req.body.address
        event.price = req.body.price
        await event.save()

        return res.status(200).json({event, errors: []})
    },
);

app.get(
    '/payment/list',
    async (req, res) => {
        const payment = await Payment.find()
        return res.status(200).json({ payment });
    }
);

app.post(
    '/payment/add',
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const landmarkId = +new Date()


        Payment.create({
            id: landmarkId,
            name: req.body.name,
            price: req.body.price
        }).then(payment => res.status(200).json({ payment, errors: [] }));

    },
);

app.post(
    '/payment/edit',
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const payment = await Payment.findOne({ id: req.body.id })

        payment.name = req.body.name
        payment.price = req.body.price
        await payment.save()

        return res.status(200).json({payment, errors: []})
    },
);

app.get(
    '/meeting/list',
    async (req, res) => {
        const meeting = await Meeting.find()
        return res.status(200).json({ meeting });
    }
);

app.post(
    '/meeting/add',
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const landmarkId = +new Date()


        Meeting.create({
            id: landmarkId,
            date: req.body.date,
            address: req.body.address,
            members: req.body.members,
            accept: req.body.accept,
            name: req.body.name
        }).then(meeting => res.status(200).json({ meeting, errors: [] }));

    },
);

app.post(
    '/meeting/edit',
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const meeting = await Meeting.findOne({ id: req.body.id })

        meeting.name = req.body.name
        meeting.accept = req.body.accept
        meeting.members = req.body.members
        meeting.address = req.body.address
        meeting.date = req.body.date
        await meeting.save()

        return res.status(200).json({meeting, errors: []})
    },
);

async function start() {
    try {
        await mongoose.connect('mongodb://u3tghrhrft3sd0t2gfmd:ywNDIhz8F8Ls2fX2YX2j@butxl3wknct42vv-mongodb.services.clever-cloud.com:27017/butxl3wknct42vv?compressors=zlib', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }) .then(() => console.log("Database connected!"))
            .catch(err => console.log(err));

        app.listen(process.env.PORT || 5000)
    } catch (e) {
        console.log(e)
        // process.exit(1)
    }
}

start()

