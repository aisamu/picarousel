const express = require('express');
const router = express.Router();
const axios = require('axios');

const User = require('../models/User');

router.get('/', async (req, res) => {
    if(req.isAuthenticated()) {
        const userId = req.user.id;
        const userObject = await User.find({_id: userId});

        const API_KEY = process.env.PIXABAY_API_KEY;
        
       const photos =  userObject[0].favoritePhotos.map( async favoritePhoto => {
           const url = `https://pixabay.com/api/?key=${API_KEY}&id=${favoritePhoto}`;
               
           const response = await axios.get(url);
           const data = response.data;

            return data['hits'];
       })

       favoritedPhotosArray = await Promise.all(photos);

       res.render('profile', {title: "Profile", username: userObject[0].name, photos: favoritedPhotosArray, userId: userObject[0]._id});

    } else {
        res.redirect('/users/login');
    }
});

router.get('/:id', (req, res) => {
    const selectedIndex = req.params.id;
    
    try {
        return res.render('profileCarousel', { title: "Photo Carousel", selectedIndex: selectedIndex, photos: favoritedPhotosArray });
    } catch(e) {
        return res.redirect('/error/problem');
    };

})


router.post('/', async (req, res) => {       
    try {
        const photoId = req.body.id;
        const userId = req.user.id;
    
        User.findById(userId, (err, foundUser) => {
            if(err) {
                console.log(err);
            } else {
                if (foundUser.favoritePhotos.includes(photoId)) {
                    const newFavoritePhotos = foundUser.favoritePhotos.filter(photo => photo !== photoId);
                    foundUser.favoritePhotos = newFavoritePhotos;
                
                    foundUser.save(()=> {
                        console.log('successfully erased');
                    })
                } else {
                    foundUser.favoritePhotos.push(photoId);

                    foundUser.save(()=> {
                        console.log('successfully added');
                    })
                }
                    
            }
        });
    } catch(e) {
        console.log('id error');
    }
    
});

router.post('/delete/:id', (req, res) => {
    if(req.isAuthenticated()) {
        User.findByIdAndRemove({_id: req.params.id}, (err, result) => {
            if (err) {
                console.log(err);
                return res.redirect('/error/problem');
            } else {
                return res.redirect('/');
            }
        });
    } else {
        res.redirect('/users/login');
    }
})


module.exports = router;