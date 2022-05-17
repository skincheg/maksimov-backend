const express = require('express')
const cors = require('cors');
const mongoose = require('mongoose')
const User = require('./models/User.models')
const Landmark = require('./models/Landmark.models')
const Order = require('./models/Order.models')
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
    body('name')
        .isAlpha('ru-RU', {ignore: ' '})
        .withMessage('Некорректное имя, может состоять только из русских букв'),
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
            name: req.body.name,
            email: req.body.email,
            password: password,
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
        }

    }
);

app.get(
    '/landmarks/list',
    async (req, res) => {
        const landmarks = await Landmark.find()
        return res.status(200).json({ landmarks });
    }
);

const handleError = (err, res) => {
    res
        .status(500)
        .contentType("text/plain")
        .end("Oops! Something went wrong!");
};

const upload = multer({
    dest: "./uploads"
});

app.post(
    '/landmarks/add',
    body('name')
        .matches(/^[А-Яа-я0-9,: \-\.]+$/i)
        .withMessage('Некорректное название, может состоять только из букв и цифр'),
    body('description')
        .matches(/^[А-Яа-я0-9,: \-\.]+$/i)
        .withMessage('Некорректное описание, может состоять только из букв и цифр'),
    body('address')
        .matches(/^[А-Яа-я0-9,: \-\.]+$/i)
        .withMessage('Некорректный адрес, может состоять только из букв и цифр'),
    body('price')
        .matches(/^[0-9]+$/i)
        .withMessage('Некорректная цена, может состоять только из цифр'),
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const landmarkId = +new Date()

        console.log(req.body)

        Landmark.create({
            id: landmarkId,
            name: req.body.name,
            description: req.body.description,
            address: req.body.address,
            price: req.body.price,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        }).then(landmark => res.status(200).json({ landmark, errors: [] }));

    },
);

app.post(
    '/landmarks/buy',
    body('landmarkId')
        .matches(/^[0-9]+$/i)
        .withMessage('Некорректный идентификатор, может состоять только из цифр'),
    body('date')
        .matches(/^[А-Яа-я0-9,: \-\.]+$/i)
        .withMessage('Некорректная дата, может состоять только из букв и цифр'),
    body('price')
        .matches(/^[0-9]+$/i)
        .withMessage('Некорректная цена, может состоять только из цифр'),
    body('userId')
        .matches(/^[0-9]+$/i)
        .withMessage('Некорректная цена, может состоять только из цифр'),
    async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const orderId = +new Date()

        Order.create({
            id: orderId,
            landmarkId: req.body.name,
            price: req.body.price,
            date: req.body.date,
            userId: req.body.userId,
            count: req.body.count
        }).then(order => res.status(200).json({ order, errors: [] }));

    },
);

app.get(
    '/landmarks/order/list',
    async (req, res) => {
        const orders = await Order.find({ userId: req.query.userId })
        return res.status(200).json({ orders });
    }
);

app.post(
    "/landmarks/uploadImage",
    upload.single("image" /* name attribute of <file> element in your form */),
    async (req, res) => {
        const tempPath = req.file.path
        const name = `${req.body.id}-${+new Date()}.png`
        const targetPath = path.join(__dirname, `./uploads/${name}`)

        const landmarkly = await Landmark.findOne({ id: req.body.id })
        landmarkly.images.push(name)
        await landmarkly.save()

        if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpeg" || path.extname(req.file.originalname).toLowerCase() === ".jpg") {
            fs.rename(tempPath, targetPath, err => {
                if (err) return handleError(err, res);

                res
                    .status(200)
                    .contentType("text/plain")
                    .end("File uploaded!");
            });
        } else {
            fs.unlink(tempPath, err => {
                if (err) return handleError(err, res);

                res
                    .status(403)
                    .contentType("text/plain")
                    .end("Only .png files are allowed!");
            });
        }
    }
);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, `./uploads/${req.query.id}`));
});

async function start() {
    try {
        await mongoose.connect('mongodb://uvkwptlufqg3nirdxvfb:l4YW6lC6yD3VxOmyx2T0@bb6mg4aot6wkw3i-mongodb.services.clever-cloud.com:27017/bb6mg4aot6wkw3i?compressors=zlib', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }) .then(() => console.log("Database connected!"))
            .catch(err => console.log(err));

        app.listen(process.env.PORT || 3000)
    } catch (e) {
        console.log(e)
        // process.exit(1)
    }
}

start()

