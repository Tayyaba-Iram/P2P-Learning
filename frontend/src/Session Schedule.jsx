import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Session Schedule.css';

function SessionSchedule() {
    const [step, setStep] = useState(1); // 1: session info, 2: instructor info

    const [sessionDetails, setSessionDetails] = useState({
        topic: '',
        startTime: '',
        endTime: '',
        date: new Date(),
        paymentMethod: '',
        instructorName: '',
        instructorHolder: '',
        instructorNumber: '',
        senderName: '',
        senderTitle: '',
        senderNumber: '',
        amount: '',
        message: '',
        foodBrand: '',
        foodItem: '',
        foodBill: '',
    });

    const [agenda, setAgenda] = useState([]);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSessionDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        if (date < new Date()) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Date',
                text: 'Date must be today or a future date.',
                confirmButtonText: 'OK',
                timer: 3000,
            });
            return;
        }
        setSessionDetails((prev) => ({ ...prev, date }));
    };
    const handleNext = () => {
        if (step === 1) {
            const { topic, startTime, endTime } = sessionDetails;

            if (!topic || !startTime || !endTime) {
                setMessage('Please fill all the fields');
                return;
            }

            if (endTime <= startTime) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Time Selection',
                    text: 'End time must be after the start time.',
                    confirmButtonText: 'OK',
                    timer: 3000,
                });
                return;
            }

            setMessage('');
            setStep(2); // move to instructor info
        } else if (step === 2) {
            const { paymentMethod } = sessionDetails;

            if (!paymentMethod) {
                setMessage('Please select a payment method');
                return;
            }

            setMessage('');
            if (paymentMethod === 'cash') {
                setStep(3); // show cash step
            } else if (paymentMethod === 'food') {
                setStep(6); // go to food step directly
            }
        } else if (step === 3) {
            const { instructorName, instructorHolder, instructorNumber } = sessionDetails;

            if (!instructorName || !instructorHolder || !instructorNumber) {
                setMessage('Please provide all instructor details');
                return;
            }

            setMessage('');
            setStep(4); // move to sender info
        }

    };

    const handleAddSession = async () => {
        const formData = new FormData();
        formData.append('topic', sessionDetails.topic);
        formData.append('startTime', sessionDetails.startTime);
        formData.append('endTime', sessionDetails.endTime);
        formData.append('date', sessionDetails.date.toISOString());
        formData.append('paymentMethod', sessionDetails.paymentMethod);
        formData.append('instructorName', sessionDetails.instructorName);
        formData.append('instructorHolder', sessionDetails.instructorHolder);
        formData.append('instructorNumber', sessionDetails.instructorNumber);
        formData.append('senderName', sessionDetails.senderName);
        formData.append('senderTitle', sessionDetails.senderTitle);
        formData.append('senderNumber', sessionDetails.senderNumber);
        formData.append('amount', sessionDetails.amount);
        formData.append('message', sessionDetails.message);
        formData.append('foodBrand', sessionDetails.foodBrand);
        formData.append('foodItem', sessionDetails.foodItem);
        formData.append('file', sessionDetails.foodBill);
        formData.append('meetingLink', `https://meet.jit.si/${Math.floor(Math.random() * 10000)}`);

        try {
            const response = await axios.post('http://localhost:3001/api/sessions', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setAgenda((prev) => [...prev, response.data]);
            toast.success('Session added successfully');

            // Reset form after successful submission
            setSessionDetails({
                topic: '',
                startTime: '',
                endTime: '',
                date: '',
                paymentMethod: '',
                instructorName: '',
                instructorHolder: '',
                instructorNumber: '',
                senderName: '',
                senderTitle: '',
                senderNumber: '',
                amount: '',
                message: '',
                foodBrand: '',
                foodItem: '',
                foodBill: '',
            });

            setStep(1);
            setMessage('');
        } catch (error) {
            console.error('Error saving session:', error);
        }
    };

    const handleNextStep = () => {
        if (step === 2 && sessionDetails.paymentMethod === "cash") {
            setStep(3); // move from cash step 4 to cash step 5
        } else if (sessionDetails.paymentMethod === "food") {
            setStep(6); // move to food step directly
        } else {
            setStep((prev) => prev + 1); // move to next step in general
        }
    };
    const confirmpayment = () => {
        if (step === 5 && sessionDetails.paymentMethod === "cash") {
            setStep(7); // move from cash step 4 to cash step 5
        } else {
            setStep((prev) => prev + 1); // move to next step in general
        }
    };
    const confirmsession = () => {
        if (step === 5 && sessionDetails.paymentMethod === "cash") {
            setStep(8); // move from cash step 4 to cash step 5
        } else {
            setStep((prev) => prev + 1); // move to next step in general
        }
    };
    const confirmfood = () => {
        if (step === 6 && sessionDetails.paymentMethod === "food") {
            setStep(9); // move from cash step 4 to cash step 5
        } else { setStep((prev) => prev + 1); }// move to next step in general
    };

    const [loadingAccount, setLoadingAccount] = useState(false);
    const token = sessionStorage.getItem('token');
    useEffect(() => {
        const fetchAccount = async () => {
            setLoadingAccount(true);
            try {
                const response = await axios.get('http://localhost:3001/api/get-account', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Full Account Data:', response.data);
                const { holder, number } = response.data;
                console.log('Sender Title:', holder); // Log senderTitle
                console.log('Sender Number:', number);
                setSessionDetails(prev => ({
                    ...prev,
                    senderTitle: holder || '',
                    senderNumber: number || '',
                }));
            } catch (err) {
                console.error('Failed to fetch account:', err);
            } finally {
                setLoadingAccount(false);
            }
        };

        if (step === 4 && sessionDetails.paymentMethod === 'cash') {
            fetchAccount();
        }
    }, [step, sessionDetails.paymentMethod]);

    return (
        <div className="simple-session-scheduler">
            <h3>Schedule a New Session</h3>
            {message && <p style={{ color: 'red' }}>{message}</p>}

            {step === 1 && (
                <>
                    <div className="form-group">
                        <label>Topic</label>
                        <input
                            type="text"
                            name="topic"
                            value={sessionDetails.topic}
                            onChange={handleInputChange}
                            placeholder="Enter session topic"
                        />
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <DatePicker
                            selected={sessionDetails.date}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Time</label>
                        <input
                            type="time"
                            name="startTime"
                            value={sessionDetails.startTime}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>End Time</label>
                        <input
                            type="time"
                            name="endTime"
                            value={sessionDetails.endTime}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-actions">
                        <button className="schedule-btn" onClick={handleNext}>
                            Next
                        </button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div className="form-group">
                        <label>Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={sessionDetails.paymentMethod}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Payment Method</option>
                            <option value="cash">Payment via Cash</option>
                            <option value="food">Payment via Food</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button className="schedule-btn" onClick={handleNext}>
                            Next
                        </button>
                    </div>
                </>
            )}

            {step === 3 && sessionDetails.paymentMethod === "cash" && (
                <>
                    <div className="form-group">
                        <label>Instructor Name</label>
                        <input
                            type="text"
                            name="instructorName"
                            value={sessionDetails.instructorName}
                            onChange={handleInputChange}
                            placeholder="Enter instructor name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Instructor Title</label>
                        <input
                            type="text"
                            name="instructorHolder"
                            value={sessionDetails.instructorHolder}
                            onChange={handleInputChange}
                            placeholder="e.g., Assistant Professor"
                        />
                    </div>

                    <div className="form-group">
                        <label>Instructor Contact Number</label>
                        <input
                            type="text"
                            name="instructorNumber"
                            value={sessionDetails.instructorNumber}
                            onChange={handleInputChange}
                            placeholder="03XX-XXXXXXX"
                        />
                    </div>
                    <div className="form-actions">
                        <button className="schedule-btn" onClick={handleNext}>
                            Next
                        </button>
                    </div>

                </>
            )}
            {step === 4 && sessionDetails.paymentMethod === 'cash' && (
                <>
                    <div className="form-group">
                        <label>Receiver's Account Title</label>
                        <input
                            type="text"
                            name="senderTitle"
                            value={sessionDetails.senderTitle}
                            onChange={handleInputChange}
                            placeholder="e.g., Student, Admin"
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>Receiver's Account Number</label>
                        <input
                            type="text"
                            name="senderNumber"
                            value={sessionDetails.senderNumber}
                            onChange={handleInputChange}
                            placeholder="03XX-XXXXXXX"
                            readOnly
                        />
                    </div>

                    <div className="form-actions">
                        <button className="schedule-btn" onClick={handleNextStep} disabled={loadingAccount}>
                            {loadingAccount ? 'Loading...' : 'Next'}
                        </button>
                    </div>
                </>
            )}


            {step === 5 && sessionDetails.paymentMethod === "cash" && (
                <div className="step-container">
                    <h3 className="step-title">Enter Payment Amount</h3>
                    <div className="amount-box">
                        <label className="amount-label">Rs.</label>
                        <input
                            type="number"
                            className="amount-input"
                            placeholder="0"
                            value={sessionDetails.amount}
                            onChange={(e) =>
                                setSessionDetails({ ...sessionDetails, amount: e.target.value })
                            }
                        />
                    </div>
                    <div className="message-optional">
                        <label className="optional-label">💬 Add a Message (Optional)</label>
                        <input
                            type="text"
                            className="optional-input"
                            placeholder="Type your message..."
                            value={sessionDetails.message}
                            onChange={(e) =>
                                setSessionDetails({ ...sessionDetails, message: e.target.value })
                            }
                        />
                    </div>
                    <button className="schedule-btn" onClick={confirmpayment}>
                        Send Payment
                    </button>
                </div>
            )}
            {step === 7 && sessionDetails.paymentMethod === "cash" && (
                <div className="receipt">
                    <p style={{ color: 'green', fontWeight: 'bold' }}>Transaction Successful ✅</p>
                    <h4>Payment Receipt</h4>
                    <p><strong>Receiver's Account Title:</strong> {sessionDetails.senderTitle}</p>
                    <p><strong>Receiver's Account Number:</strong> {sessionDetails.senderNumber}</p>
                    <p><strong>Amount:</strong> Rs. {sessionDetails.amount}</p>

                    <div className="form-actions">
                        <button className="schedule-btn" onClick={confirmsession}>
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 6 && sessionDetails.paymentMethod === "food" && (
                <div className="step-container">
                    <h3 className="step-title">Food Payment Details</h3>

                    <div className="form-group">
                        <label>Food Brand Name</label>
                        <input
                            type="text"
                            name="foodBrand"
                            value={sessionDetails.foodBrand}
                            onChange={handleInputChange}
                            placeholder="e.g., McDonald's, KFC"
                        />
                    </div>

                    <div className="form-group">
                        <label>Food Item</label>
                        <input
                            type="text"
                            name="foodItem"
                            value={sessionDetails.foodItem}
                            onChange={handleInputChange}
                            placeholder="e.g., Zinger Burger, Pizza"
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Bill (optional)</label>
                        <input
                            type="file"
                            name="file"
                            onChange={(e) =>
                                setSessionDetails({ ...sessionDetails, foodBill: e.target.files[0] })
                            }
                        />
                    </div>

                    <button className="schedule-btn" onClick={confirmfood}>
                        Confirm & Submit
                    </button>
                </div>
            )}

            {step === 8 && (
                <div className="receipt">
                    <h4>Session Details</h4>
                    <p><strong>Topic:</strong> {sessionDetails.topic}</p>
                    <p><strong>Date:</strong> {sessionDetails.date ? new Date(sessionDetails.date).toLocaleDateString() : 'No date available'}</p>
                    <p><strong>Start Time:</strong> {sessionDetails.startTime}</p>
                    <p><strong>End Time:</strong> {sessionDetails.endTime}</p>
                    <h4>Instructor's Details</h4>
                    <p><strong>Instructor Name:</strong> {sessionDetails.instructorName}</p>
                    <p><strong>Instructor Account Ttile:</strong> {sessionDetails.instructorHolder}</p>
                    <p><strong>Instructor Account Number:</strong> {sessionDetails.instructorNumber}</p>
                    <h4>Receiver's Details</h4>
                    <p><strong>Receiver Title:</strong> {sessionDetails.senderTitle}</p>
                    <p><strong>Receiver Number:</strong> {sessionDetails.senderNumber}</p>
                    <h4>Sending Payment</h4>
                    <p><strong>Amount:</strong> Rs {sessionDetails.amount}</p>
                    <p style={{ color: 'green', fontWeight: 'bold' }}>Transaction Successful ✅</p>

                    <div className="form-actions">
                        <button className="schedule-btn" onClick={handleAddSession}>
                            Finish & Add Session
                        </button>
                    </div>
                </div>
            )}

            {step === 9 && sessionDetails.paymentMethod === "food" && (
                <div className="receipt">
                    <p style={{ color: 'green', fontWeight: 'bold' }}>Transaction Successful ✅</p>
                    <h4>Session Details</h4>
                    <p><strong>Topic:</strong> {sessionDetails.topic}</p>
                    <p><strong>Date:</strong> {sessionDetails.date ? new Date(sessionDetails.date).toLocaleDateString() : 'No date available'}</p>
                    <p><strong>Start Time:</strong> {sessionDetails.startTime}</p>
                    <p><strong>End Time:</strong> {sessionDetails.endTime}</p>
                    <h4>Food Details</h4>
                    <p><strong>Food Brand:</strong> {sessionDetails.foodBrand}</p>
                    <p><strong>Food Items:</strong> {sessionDetails.foodItem}</p>
                    <p><strong>Food Bill:</strong> {sessionDetails.foodBill.name}</p>

                    <div className="form-actions">
                        <button className="schedule-btn" onClick={handleAddSession}>
                            Finish & Add Session
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SessionSchedule;
