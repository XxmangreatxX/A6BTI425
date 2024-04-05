require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,ExtractJwt = require('passport-jwt').ExtractJwt;
const userService = require('./user-service');
const app = express();
const PORT = process.env.PORT || 8080;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await userService.findUserById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.post("/api/user/register", async (req, res) => {
    try {
        const message = await userService.registerUser(req.body);
        res.json({ message });
    } catch (error) {
        res.status(422).json({ message: error.toString() });
    }
});

app.post("/api/user/login", async (req, res) => {
    try {
        const { user, token } = await userService.checkUser(req.body);
        res.json({ message: "login successful", token });
    } catch (error) {
        res.status(422).json({ message: error.toString() });
    }
});

const authMiddleware = passport.authenticate('jwt', { session: false })
app.get("/api/user/favourites", authMiddleware, async (req, res) => {
    try {
        const data = await userService.getFavourites(req.user._id);
        res.json(data);
    } catch (error) {
        res.status(422).json({ error: error.toString() });
    }
});

app.put("/api/user/favourites/:id", authMiddleware, async (req, res) => {
    try {
        const data = await userService.addFavourite(req.user._id, req.params.id);
        res.json(data);
    } catch (error) {
        res.status(422).json({ error: error.toString() });
    }
});

app.delete("/api/user/favourites/:id", authMiddleware, async (req, res) => {
    try {
        const data = await userService.removeFavourite(req.user._id, req.params.id);
        res.json(data);
    } catch (error) {
        res.status(422).json({ error: error.toString() });
    }
});

app.get("/api/user/history", authMiddleware, async (req, res) => {
    try {
        const data = await userService.getHistory(req.user._id);
        res.json(data);
    } catch (error) {
        res.status(422).json({ error: error.toString() });
    }
});

app.put("/api/user/history/:id", authMiddleware, async (req, res) => {
    try {
        const data = await userService.addHistory(req.user._id, req.params.id);
        res.json(data);
    } catch (error) {
        res.status(422).json({ error: error.toString() });
    }
});

app.delete("/api/user/history/:id", authMiddleware, async (req, res) => {
    try {
        const data = await userService.removeHistory(req.user._id, req.params.id);
        res.json(data);
    } catch (error) {
        res.status(422).json({ error: error.toString() });
    }
});

userService.connect().then(() => {
    app.listen(PORT, () => { console.log(`API listening on: ${PORT}`); });
}).catch((err) => {
    console.error("Unable to start the server:", err);
    process.exit(1);
});
