import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { addBook } from "@/features/books/bookThunks";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookUpload() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        publishedDate: "",
        price: "",
        rentalPrice: "",
        availableForPurchase: false,
        availableForRental: false
    });

    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.books);

    const [user, setUser] = useState({ username: "", id: "" });

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser({ username: decodedToken.username, id: decodedToken.id });
            } catch (err) {
                console.error("Error decoding token:", err);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSelectChange = (id, value) => {
        setFormData({ ...formData, [id]: value === "true" });
    };

    const validateForm = () => {
        let errors = {};

        if (!formData.title) errors.title = "Title is required.";
        if (!formData.description) errors.description = "Description is required.";
        if (!formData.publishedDate) errors.publishedDate = "Published date is required.";

        if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
            errors.price = "Price must be a valid number.";
        }

        if (!formData.rentalPrice || isNaN(formData.rentalPrice) || formData.rentalPrice < 0) {
            errors.rentalPrice = "Rental price must be a valid number.";
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const bookData = {
            ...formData,
            price: parseFloat(formData.price),
            rentalPrice: parseFloat(formData.rentalPrice),
            author: user.username,
            authorId: user.id,
        };

        try {
            await dispatch(addBook(bookData)).unwrap();
            toast.success('Book uploaded successfully!');
            setFormData({
                title: "",
                description: "",
                publishedDate: "",
                price: "",
                rentalPrice: "",
                availableForPurchase: false,
                availableForRental: false
            });
        } catch (err) {
            console.error("Error uploading book:", err);
        }
    };

    return (
        <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <Card className="max-w-4xl mx-auto p-6 sm:p-8">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Upload a Book</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={handleSubmit}>
                            <div className="grid gap-1">
                                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter the book title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={errors.title ? "border-red-500" : ""}
                                />
                                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                            </div>

                            <div className="grid gap-1">
                                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide a brief description of the book"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={errors.description ? "border-red-500" : ""}
                                />
                                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1">
                                    <Label htmlFor="publishedDate" className="text-sm font-medium">Published Date</Label>
                                    <Input
                                        id="publishedDate"
                                        type="date"
                                        value={formData.publishedDate}
                                        onChange={handleChange}
                                        className={errors.publishedDate ? "border-red-500" : ""}
                                    />
                                    {errors.publishedDate && <p className="text-red-500 text-sm">{errors.publishedDate}</p>}
                                </div>

                                <div className="grid gap-1">
                                    <Label htmlFor="price" className="text-sm font-medium">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="Enter the book price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={errors.price ? "border-red-500" : ""}
                                    />
                                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1">
                                    <Label htmlFor="rentalPrice" className="text-sm font-medium">Rental Price</Label>
                                    <Input
                                        id="rentalPrice"
                                        type="number"
                                        placeholder="Enter the rental price"
                                        value={formData.rentalPrice}
                                        onChange={handleChange}
                                        className={errors.rentalPrice ? "border-red-500" : ""}
                                    />
                                    {errors.rentalPrice && <p className="text-red-500 text-sm">{errors.rentalPrice}</p>}
                                </div>

                                <div className="grid gap-1">
                                    <Label htmlFor="availableForPurchase" className="text-sm font-medium">Availability</Label>
                                    <Select
                                        id="availableForPurchase"
                                        onValueChange={(value) => handleSelectChange("availableForPurchase", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select availability" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Available for Purchase</SelectItem>
                                            <SelectItem value="false">Not Available for Purchase</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1">
                                    <Label htmlFor="availableForRental" className="text-sm font-medium">Rental Availability</Label>
                                    <Select
                                        id="availableForRental"
                                        onValueChange={(value) => handleSelectChange("availableForRental", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select rental availability" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Available for Rental</SelectItem>
                                            <SelectItem value="false">Not Available for Rental</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <CardFooter className="flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Uploading..." : "Upload Book"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
                <ToastContainer />
            </div>
        </section>
    );
}
