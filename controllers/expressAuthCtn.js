const User = require('../models/expressAuth');

exports.signup = async (req, res) => {
    try {
        const { expressName, email, password, expressCode } = req.body;
        const user = await User.signup(email, password, expressName, expressCode);
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { expressName, email, password, expressCode } = req.body;
        const user = await User.login(email, password, expressName, expressCode);
        res.send(user);
    } catch (error) {
        res.status(401).send({ error: error.message });
    }
};
