// BookDetails.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { fetchBookById } from '@/features/books/bookThunks';
import { addComment } from '@/features/comments/commentThunks';
import { createCheckoutSession } from '@/features/payments/paymentThunks';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const BookDetails = () => {
    const { bookId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const stripe = useStripe();

    const { currentBook, loading: bookLoading, error: bookError } = useSelector((state) => state.books);
    const { sessionUrl, loading: paymentLoading, error: paymentError } = useSelector((state) => state.payments);

    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (bookId) {
            dispatch(fetchBookById(bookId));
        }
    }, [dispatch, bookId]);

    useEffect(() => {
        if (sessionUrl) {
            window.location.href = sessionUrl; 
        }
    }, [sessionUrl]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (newRating === 0) {
            return alert('Please provide a rating.');
        }
        const commentData = { description: newComment, rating: newRating };
        await dispatch(addComment({ bookId, commentData }));
        setNewComment('');
        setNewRating(0);
    };

    const handlePayment = async (type) => {
        console.log(`Initiating payment for bookId: ${bookId}, type: ${type}`);
        if (!stripe) {
            return alert('Stripe has not loaded yet.');
        }
        await dispatch(createCheckoutSession({ bookId, type }));
    };

    if (bookLoading) {
        return <div>Loading...</div>;
    }

    if (bookError) {
        return (
            <div>
                <h1>Error</h1>
                <p>{bookError}</p>
                <Button onClick={() => navigate('/')}>Go to Home</Button>
            </div>
        );
    }

    if (!currentBook) {
        return <div>Book not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 md:p-10 bg-background rounded-lg shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <img
                        src={currentBook.coverImage || "https://m.media-amazon.com/images/I/416V8IMmH7L._SX342_SY445_.jpg"}
                        alt="Book Cover"
                        width={400}
                        height={600}
                        className="rounded-lg w-full h-auto object-cover"
                    />
                </div>
                <div className="grid gap-6">
                    <h1 className="text-3xl font-bold">{currentBook.title}</h1>
                    <p className="text-muted-foreground">by {currentBook.author.username}</p>
                    <div className="prose max-w-none">
                        <p>{currentBook.description}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <div className="text-muted-foreground">Price</div>
                            <div className="text-2xl font-bold">${currentBook.price}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Rental Price</div>
                            <div className="text-2xl font-bold">${currentBook.rentalPrice}</div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button size="lg" onClick={() => handlePayment('purchase')} disabled={paymentLoading}>
                            {paymentLoading ? 'Processing...' : 'Buy'}
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => handlePayment('rental')} disabled={paymentLoading}>
                            {paymentLoading ? 'Processing...' : 'Rent'}
                        </Button>
                    </div>
                    {paymentError && <p className="text-red-500 mt-4">Error: {paymentError}</p>}
                </div>
            </div>
            <Separator className="my-8" />
            <div className="grid gap-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <div className="grid gap-4">
                    {currentBook.comments?.length > 0 ? (
                        currentBook.comments.map(comment => (
                            <div key={comment._id} className="flex items-start gap-4">
                                <Avatar className="w-10 h-10 border">
                                    <AvatarImage src={comment.author.avatar || "/placeholder-user.jpg"} alt={comment.author.username} />
                                    <AvatarFallback>{comment.author.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium">{comment.author.username}</div>
                                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} filled={i < comment.rating} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground">{comment.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet. Be the first to review this book!</p>
                    )}
                </div>
                <form onSubmit={handleCommentSubmit}>
                    <div className="flex items-center mb-2">
                        <span className="mr-2">Your Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                filled={star <= (hoverRating || newRating)}
                                onClick={() => setNewRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            />
                        ))}
                    </div>
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a review..."
                        rows={4}
                        required
                    />
                    <div className="flex justify-end mt-2">
                        <Button type="submit">Submit Review</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookDetails;
