const homeController = {
    getHome: function (req, res) {
        res.render('home', { 
            user: req.session.user 
        });
    }
}

module.exports = homeController;