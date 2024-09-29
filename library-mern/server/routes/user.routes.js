// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingleToCloudinary } = require('../middlewares/uploadFiles');

router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

router.post('/', authenticate, authorize(['admin']), uploadSingleToCloudinary, userController.createUser); 

router.get('/:id', authenticate, (req, res, next) => {
    if (req.user.role.includes('admin') || req.user._id.toString() === req.params.id) {
        return next();
    } else {
        return res.status(403).json({ message: "Unauthorized access" });
    }
}, userController.getUserById);

router.put('/:id', authenticate, (req, res, next) => {
    if (req.user.role.includes('admin') || req.user._id.toString() === req.params.id) {
        return uploadSingleToCloudinary(req, res, next);
    } else {
        return res.status(403).json({ message: "Unauthorized access" });
    }
}, userController.updateUser);

router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);

module.exports = router;
