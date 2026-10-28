import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Phone, User, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactAPI } from '@/apis';
import { getErrorMessage } from '@/types';
import type { ContactFormData } from '@/types/api.types';
import {
    validateName,
    validateEmail,
    validatePhoneNumber,
    normalizeAustralianPhone,
    validateMessage,
} from '@/utils/validation';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = (): boolean => {
        const firstNameError = validateName(formData.firstName, 'First name');
        const lastNameError = validateName(formData.lastName, 'Last name');
        const phoneError = validatePhoneNumber(formData.phoneNumber);
        const emailError = validateEmail(formData.email);
        const messageError = validateMessage(formData.description);

        if (firstNameError) {
            toast.error(firstNameError);
            return false;
        }
        if (lastNameError) {
            toast.error(lastNameError);
            return false;
        }
        if (phoneError) {
            toast.error(phoneError);
            return false;
        }
        if (emailError) {
            toast.error(emailError);
            return false;
        }
        if (messageError) {
            toast.error(messageError);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await contactAPI.submitContactForm({ ...formData, phoneNumber: normalizeAustralianPhone(formData.phoneNumber) });

            toast.success('Message sent successfully! We\'ll get back to you soon.');

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                phoneNumber: '',
                email: '',
                description: ''
            });

            // Optional: Redirect to home after a delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: unknown) {
            console.error('Error submitting form:', error);
            toast.error(getErrorMessage(error) || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 bg-gradient-to-b from-neutral-50 to-white">
            <div className="container-custom flex justify-center items-center min-h-screen py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-3xl bg-white p-8 md:p-12 rounded-2xl border border-neutral-200 shadow-lg"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
                        >
                            <MessageSquare className="text-primary" size={32} />
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-3">
                            Get in Touch
                        </h2>
                        <p className="text-neutral-600 text-lg">
                            Have a question or feedback? We'd love to hear from you!
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                                    <User size={16} className="text-primary" />
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="John"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                                    <User size={16} className="text-primary" />
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Doe"
                                />
                            </motion.div>
                        </div>

                        {/* Contact Fields */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                                <Phone size={16} className="text-primary" />
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="04XX XXX XXX"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                                <Mail size={16} className="text-primary" />
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="john.doe@example.com"
                            />
                        </motion.div>

                        {/* Message Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                                <MessageSquare size={16} className="text-primary" />
                                Your Message *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                rows={6}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Tell us how we can help you... (minimum 10 characters)"
                            />
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-primary text-white py-4 rounded-lg hover:bg-red-600 transition-all duration-300 font-semibold text-lg border border-primary shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Message
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Additional Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 pt-6 border-t border-neutral-200 text-center"
                    >
                        <p className="text-sm text-neutral-600">
                            We typically respond within 24 hours. For urgent matters, please call us directly.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
