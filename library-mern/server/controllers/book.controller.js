const asyncHandler = require("express-async-handler");
const Book = require("../models/book.model");
const User = require("../models/user.model");
const cloudinary = require('../config/cloudinaryConfig');
const { uploadSingleToCloudinary } = require('../middlewares/uploadFiles');

exports.createBook = [
    uploadSingleToCloudinary, // Middleware for image upload
    asyncHandler(async (req, res) => {
        try {
            const { title, description, publishedDate, price, rentalPrice, availableForPurchase, availableForRental } = req.body;

            const newBook = new Book({
                title,
                description,
                publishedDate,
                price,
                rentalPrice,
                availableForPurchase,
                availableForRental,
                author: req.user._id,
                image: req.uploadedImage ? { url: req.uploadedImage.url, public_id: req.uploadedImage.id } : null // Include uploaded image
            });

            await newBook.save();
            res.status(201).json(newBook);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
];

exports.getAllBooks = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 5, searchTerm = "" } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        let searchFilter = {};
        if (searchTerm) {
            searchFilter = {
                $or: [
                    { title: { $regex: searchTerm, $options: "i" } },
                    { description: { $regex: searchTerm, $options: "i" } },
                    {
                        author: {
                            $in: await User.find({ username: { $regex: searchTerm, $options: "i" } }).select("_id"),
                        },
                    },
                ],
            };
        }

        const books = await Book.find(searchFilter)
            .populate("author", "username")
            .skip(skip)
            .limit(limitNum);

        const totalBooks = await Book.countDocuments(searchFilter);

        res.status(200).json({
            books,
            totalBooks,
            currentPage: pageNum,
            totalPages: Math.ceil(totalBooks / limitNum),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

exports.getBookById = asyncHandler(async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate("author", "username")
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            })
            .populate({
                path: 'purchasers.user',
                select: 'username purchaseDate'
            })
            .populate({
                path: 'renters.user',
                select: 'username rentalDate rentalEndDate'
            });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

exports.updateBookById = [
    uploadSingleToCloudinary, // Middleware for image upload
    asyncHandler(async (req, res) => {
        try {
            const { title, description, publishedDate, price, rentalPrice, availableForPurchase, availableForRental } = req.body;
            const book = await Book.findById(req.params.id);

            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }

            if (req.user.role.includes('admin') || book.author.toString() === req.user._id.toString()) {
                const updateFields = {
                    title,
                    description,
                    publishedDate,
                    price,
                    rentalPrice,
                    availableForPurchase,
                    availableForRental,
                };

                // Add the new image if uploaded, and delete the old one from Cloudinary
                if (req.uploadedImage) {
                    if (book.image && book.image.public_id) {
                        await cloudinary.uploader.destroy(book.image.public_id);
                    }
                    updateFields.image = { url: req.uploadedImage.url, public_id: req.uploadedImage.id };
                }

                const updatedBook = await Book.findByIdAndUpdate(req.params.id, updateFields, { new: true });
                res.json(updatedBook);
            } else {
                res.status(403).json({ error: "Access denied" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
];

exports.deleteBookById = asyncHandler(async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (req.user.role.includes('admin') || book.author.toString() === req.user._id.toString()) {
            if (book.image && book.image.public_id) {
                // Delete the image from Cloudinary
                await cloudinary.uploader.destroy(book.image.public_id);
            }
            await Book.findByIdAndDelete(req.params.id);
            res.json({ message: "Book deleted successfully" });
        } else {
            res.status(403).json({ error: "Access denied" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getBookContent = asyncHandler(async (req, res) => {
    try {
        const { bookId, paymentId } = req.body;

        if (!bookId || !paymentId) {
            return res.status(400).json({ message: 'Book ID and Payment ID are required' });
        }

        const book = await Book.findById(bookId)
            .populate('purchasers.user', 'username')
            .populate('renters.user', 'username');

        if (!book) {
            console.log(`Book with ID ${bookId} not found.`);
            return res.status(404).json({ message: 'Book not found' });
        }

        console.log(`Book data: ${JSON.stringify(book)}`);
        console.log(`User ID: ${req.user._id}`);

        const userPurchased = book.purchasers.some(purchase =>
            purchase.user._id.equals(req.user._id) && purchase.paymentId === paymentId
        );
        console.log(`User purchased: ${userPurchased}`);

        const userRented = book.renters.some(rental =>
            rental.user._id.equals(req.user._id) && rental.paymentId === paymentId
        );
        console.log(`User rented: ${userRented}`);

        const isAdmin = req.user.role.includes('admin');
        console.log(`Is admin: ${isAdmin}`);

        if (isAdmin || userPurchased || userRented) {
            if (userRented) {
                const rental = book.renters.find(r => r.user._id.equals(req.user._id));
                const currentDate = new Date();

                if (currentDate > rental.rentalEndDate) {
                    return res.status(403).json({ message: 'Rental period has expired' });
                }
            }

            res.json({ message: 'Access granted', book });
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

exports.getOwnedBooks = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'ownedBooks.book',
                select: 'title price author description publishedDate availableForPurchase availableForRental createdAt updatedAt',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            })
            .populate({
                path: 'rentedBooks.book',
                select: 'title price rentalPrice author description publishedDate availableForPurchase availableForRental createdAt updatedAt',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if ((!user.ownedBooks || user.ownedBooks.length === 0) && (!user.rentedBooks || user.rentedBooks.length === 0)) {
            return res.status(404).json({ message: 'No purchased or rented books found for this user' });
        }

        const purchasedBooks = user.ownedBooks.map((entry) => ({
            bookId: entry.book._id,
            title: entry.book.title,
            price: entry.book.price,
            description: entry.book.description,
            author: entry.book.author.username,
            publishedDate: entry.book.publishedDate,
            availableForPurchase: entry.book.availableForPurchase,
            availableForRental: entry.book.availableForRental,
            purchaseDate: entry.purchaseDate,
            type: 'Purchased',
            paymentId: entry.paymentId,
            createdAt: entry.book.createdAt || null,  
            updatedAt: entry.book.updatedAt || null   
        }));

        const rentedBooks = user.rentedBooks.map((entry) => ({
            bookId: entry.book._id,
            title: entry.book.title,
            rentalPrice: entry.book.rentalPrice,
            description: entry.book.description,
            author: entry.book.author.username,
            publishedDate: entry.book.publishedDate,
            availableForPurchase: entry.book.availableForPurchase,
            availableForRental: entry.book.availableForRental,
            rentalDate: entry.rentalDate,
            rentalEndDate: entry.rentalEndDate,
            type: 'Rented',
            paymentId: entry.paymentId,
            createdAt: entry.book.createdAt || null,  
            updatedAt: entry.book.updatedAt || null   
        }));

        res.status(200).json({
            purchasedBooks,
            rentedBooks
        });
    } catch (error) {
        console.error('Error fetching purchased and rented books:', error.message);
        res.status(500).json({ error: error.message });
    }
});


exports.getBooksByAuthor = asyncHandler(async (req, res) => {
    try {
        const { authorId } = req.params;

        if (!authorId) {
            return res.status(400).json({ message: 'Author ID is required' });
        }

        const books = await Book.find({ author: authorId })
            .select('title description publishedDate price rentalPrice availableForPurchase availableForRental') 
            .populate('author', 'username')
            .populate({
                path: 'purchasers.user', 
                select: 'username' 
            })
            .populate({
                path: 'renters.user', 
                select: 'username'
            });

        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found for this author' });
        }

        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching books by author:', error.message);
        res.status(500).json({ error: error.message });
    }
});


exports.getCommentByBookId = asyncHandler(async (req, res) => {
    exports.getCommentsByBookId = asyncHandler(async (req, res) => {
        try {
            const book = await Book.findById(req.params.bookId)
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'author',
                        select: 'username'
                    }
                });

            if (!book || !book.comments.length) {
                return res.status(404).json({ message: 'No comments found for this book!' });
            }

            res.json(book.comments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
});
