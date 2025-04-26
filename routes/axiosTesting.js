const axios = require("axios");
const express = require("express");
const router = express.Router();

router.get('/joke', async (req, res) => {
    try {
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');

        console.log("data incomming:", response)

        const { id, ...jokeWithoutId } = response.data;
        // const apiResponse = {
        //     "Session": response?.data?.type,
        // }

        res.status(200).json(jokeWithoutId);
    } catch (error) {
        console.error('Error fetching joke:', error.message);
        res.status(500).json({ error: 'Failed to fetch joke' });
    }
});

router.post('/registerUserAxios', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {

        const response = await axios.post('http://localhost:5000/api/users/register', {
            "name": name,
            "email": email,
            "password": password
        })
        console.log(response.status);
        res.status(200).json(response.data);

    } catch (error) {
        console.error('Error registring users:', error.response.data);
        res.status(500).json({ error: error.response.data.message });
    }
});


module.exports = router;
