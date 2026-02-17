import React, { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';

const UserFeedback = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [category, setCategory] = useState('General');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const categories = ['General', 'Feature Request', 'Bug Report', 'UI/UX', 'Performance'];

    const handleSubmit = (e) => {
        e.preventDefault();

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login to submit feedback');
            return;
        }

        const newFeedback = {
            id: Date.now(),
            user: currentUser.name || 'Anonymous',
            email: currentUser.email,
            userId: currentUser.id,
            rating,
            category,
            message,
            status: 'unread',
            date: new Date().toISOString().split('T')[0],
            response: null
        };

        const existingFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        localStorage.setItem('feedbacks', JSON.stringify([...existingFeedbacks, newFeedback]));

        setIsSubmitted(true);
        // Reset form
        setRating(0);
        setMessage('');
        setCategory('General');
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in duration-300">
                <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
                <p className="text-gray-600 text-center mb-8">Your feedback has been submitted successfully. We appreciate your input!</p>
                <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Submit Another Feedback
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Share Your Feedback</h1>
                <p className="text-gray-600">Help us improve NoteGen AI by sharing your thoughts and experiences.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
                {/* Star Rating */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">How would you rate your experience?</label>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`p-1 transition-transform hover:scale-110`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    className={`w-10 h-10 ${(hover || rating) >= star
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">What is this feedback about?</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Input */}
                <div className="mb-8">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-3">Tell us more</label>
                    <textarea
                        id="message"
                        rows="5"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What's on your mind?..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!rating || !message.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all ${!rating || !message.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                >
                    <Send className="w-5 h-5" />
                    Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default UserFeedback;