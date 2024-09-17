import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/auth/Signup';
import Signin from './components/auth/Signin';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import ManageUser from './components/admin/ManageUser';
import ManageComments from './components/admin/ManageComments';
import ManageBooks from './components/admin/ManageBooks';
import Admin from './pages/Admin';
import BookDetails from './components/book/BookDetails';
import BookList from './components/book/BookList';
import BookManagement from './components/book/BookManagement';
import BookSearch from './components/book/BookSearch';
import BookUpload from './components/book/BookUpload';
import UserProfile from './components/profile/UserProfile';
import ProtectedRoute from './routes/ProtectedRoute';
import { CommentsProvider } from './context/CommentsContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import process from 'process';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
console.log(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function App() {
  return (
    <Elements stripe={stripePromise}>
    <Router>
      <Header />
      {/* Wrap the relevant routes with CommentsProvider outside the Routes */}
      <CommentsProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute element={Home} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/book-list" element={<ProtectedRoute element={BookList} />} />
          <Route path="/admin" element={<ProtectedRoute element={Admin} roles={['admin']} />} />

          {/* Admin routes */}
          <Route path="/admin/users" element={<ProtectedRoute element={ManageUser} roles={['admin']} />} />
          <Route path="/admin/comments" element={<ProtectedRoute element={ManageComments} roles={['admin']} />} />
          <Route path="/admin/books" element={<ProtectedRoute element={ManageBooks} roles={['admin']} />} />

          {/* Book routes */}
          <Route path="/book/:bookId" element={<ProtectedRoute element={BookDetails} />} />
          <Route path="/book-management" element={<ProtectedRoute element={BookManagement} roles={['admin']} />} />
          <Route path="/book-search" element={<ProtectedRoute element={BookSearch} />} />
          <Route path="/book-upload" element={<ProtectedRoute element={BookUpload} roles={['author', 'admin']} />} />

          {/* Profile and others */}
          <Route path="/profile" element={<ProtectedRoute element={UserProfile} />} />
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} /> {/* Unauthorized route */}
        </Routes>
      </CommentsProvider>
      <Footer />
    </Router>
    </Elements>
  );
}
