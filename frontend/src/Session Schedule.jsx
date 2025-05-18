import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaPen } from "react-icons/fa";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Session Schedule.css';
import Select from 'react-select';

function SessionSchedule() {
    const [step, setStep] = useState(1); 

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
        receiver: '',
        foodBrand: '',
        foodItem: '',
        foodBill: '',
    });
    const navigate = useNavigate();
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
            const { topic, date, startTime, endTime } = sessionDetails;

            if (!topic || !date || !startTime || !endTime) {
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
            setStep(2); 
        } else if (step === 2) {
            const { paymentMethod } = sessionDetails;

            if (!paymentMethod) {
                setMessage('Please select a payment method');
                return;
            }

            setMessage('');
            if (paymentMethod === 'cash') {
                setStep(3); 
            } else if (paymentMethod === 'food') {
                setStep(6);
            }
        } else if (step === 3) {
            const { instructorName, instructorHolder, instructorNumber } = sessionDetails;

            if (!instructorName || !instructorHolder || !instructorNumber) {
                setMessage('Please provide all instructor details');
                return;
            }

            setMessage('');
            setStep(4); 
        }

    };
    const handleAddSession = async () => {
        console.log("Session date before submission:", sessionDetails.date);

        const localDate = new Date(sessionDetails.date);
        localDate.setHours(0, 0, 0, 0);
        const formattedDate = localDate.toLocaleDateString('en-CA');

        const formData = new FormData();
        formData.append('topic', sessionDetails.topic);
        formData.append('startTime', sessionDetails.startTime);
        formData.append('endTime', sessionDetails.endTime);
        formData.append('date', formattedDate);
        formData.append('paymentMethod', sessionDetails.paymentMethod);
        formData.append('instructorName', sessionDetails.instructorName);
        formData.append('instructorHolder', sessionDetails.instructorHolder);
        formData.append('instructorNumber', sessionDetails.instructorNumber);
        formData.append('senderName', sessionDetails.senderName);
        formData.append('senderTitle', sessionDetails.senderTitle);
        formData.append('senderNumber', sessionDetails.senderNumber);
        formData.append('amount', sessionDetails.amount);
        formData.append('receiver', sessionDetails.receiver); 
        formData.append('foodBrand', sessionDetails.foodBrand);
        formData.append('foodItem', sessionDetails.foodItem);
        formData.append('file', sessionDetails.foodBill);
        formData.append('meetingLink', `https://meet.jit.si/${Math.floor(Math.random() * 10000)}`);

        try {
            const token = sessionStorage.getItem('token');
            console.log('Token from sessionStorage:', token);
            const response = await axios.post('http://localhost:3001/api/sessions', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setAgenda((prev) => [...prev, response.data]);
            toast.success('Session added successfully');

            setSessionDetails({
                topic: '',
                startTime: '',
                endTime: '',
                paymentMethod: '',
                instructorName: '',
                instructorHolder: '',
                instructorNumber: '',
                senderName: '',
                senderTitle: '',
                senderNumber: '',
                amount: '',
                receiver: '', 
                foodBrand: '',
                foodItem: '',
                foodBill: ''
            });

            navigate('/');
            setMessage('');
        } catch (error) {
            console.error('Error saving session:', error);
        }
    };


    const handleNextStep = () => {
        if (step === 2 && sessionDetails.paymentMethod === "cash") {
            setStep(3); 
        } else if (sessionDetails.paymentMethod === "food") {
            setStep(6); 
        } else {
            setStep((prev) => prev + 1); 
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setMessage('');
            setStep(step - 1);
        }
    };
    const handleBackup = () => {
        if (step > 1) {
            setMessage('');
            setStep(step - 4);
        }
    };

    const confirmpayment = () => {
        if (step === 5 && sessionDetails.paymentMethod === "cash") {
            const { amount } = sessionDetails;
            if (!amount) {
                setMessage('Please enter amount');
                return;
            }
            setMessage('');
            setStep(7); 
        } else {
            setStep((prev) => prev + 1); 
        }
    };
    const confirmsession = () => {
        if (step === 5 && sessionDetails.paymentMethod === "cash") {
            setStep(8);
        } else {
            setStep((prev) => prev + 1); 
        }
    };
    const confirmfood = () => {
        if (step === 6 && sessionDetails.paymentMethod === "food") {
            const { receiver, foodBrand, foodItem, foodBill } = sessionDetails;
            if (!receiver || !foodBrand || !foodItem || !foodBill) {
                setMessage('Please provide all food details');
                return;
            }
            setMessage('');
            setStep(9); 
        } else { setStep((prev) => prev + 1); }
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
                console.log('Sender Title:', holder); 
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


    const [students, setStudents] = useState([]);

    const fetchStudents = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/repo-verifiedStudents', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };
    useEffect(() => {
        fetchStudents();
    }, []);

    const studentOptions = students.map((student) => ({
        value: student.email,
        label: `${student.name} (${student.email})`,
    }));
    return (
        <div className="simple-session-scheduler">
            <h3>Schedule a New Session</h3>
            {message && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '16px' }}
            >{message}</p>}

            {step === 1 && (
                <>
                    <div className="form-group1">
                        <label>Topic</label>
                        <div className="input-with-icon">
                            <FaPen className="input-icon" />
                            <input
                                type="text"
                                name="topic"
                                value={sessionDetails.topic}
                                onChange={handleInputChange}
                                placeholder="Enter session topic"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-groupd">
                        <label>Date</label>
                        <div className="datepicker-with-icon">
                            <DatePicker
                                selected={sessionDetails.date}
                                onChange={handleDateChange}
                                dateFormat="yyyy-MM-dd"
                                className="custom-datepicker"
                                required
                            />
                            <FaCalendarAlt className="calendar-icon" />
                        </div>
                    </div>

                    <div className="form-group1">
                        <label >Start Time</label>
                        <input
                            type="time"
                            name="startTime"
                            value={sessionDetails.startTime}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group1">
                        <label>End Time</label>
                        <input
                            type="time"
                            name="endTime"
                            value={sessionDetails.endTime}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-actionss">

                        <button type="button" className="schedule-btn"

                            onClick={handleNext}>
                            Next
                        </button>
                    </div>

                </>
            )}

            {step === 2 && (
                <>
                    <div className="form-group1">
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

                    <div className="button-container">
                        <button type="button" className="schedule-btn" onClick={handleBack}
                            style={{ marginLeft: '25px' }}
                        >
                            Back
                        </button>
                        <button className="schedule-btn" onClick={handleNext} style={{ marginRight: '25px' }}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {step === 3 && sessionDetails.paymentMethod === "cash" && (
                <>
                    <div className="form-group1">
                        <label>Instructor Name</label>
                        <input
                            type="text"
                            name="instructorName"
                            value={sessionDetails.instructorName}
                            onChange={(e) => {
                                const value = e.target.value;
                                const regex = /^[a-zA-Z\s]*$/;
                                if (regex.test(value)) {
                                    setSessionDetails(prev => ({
                                        ...prev,
                                        [e.target.name]: value
                                    }));
                                }
                            }}
                            placeholder="Enter instructor name"
                            required
                        />
                    </div>

                    <div className="form-group1">
                        <label>Instructor Title</label>
                        <input
                            type="text"
                            name="instructorHolder"
                            value={sessionDetails.instructorHolder}
                            onChange={(e) => {
                                const value = e.target.value;
                                const regex = /^[a-zA-Z\s]*$/;
                                if (regex.test(value)) {
                                    setSessionDetails(prev => ({
                                        ...prev,
                                        [e.target.name]: value
                                    }));
                                }
                            }}
                            placeholder="e.g., Assistant Professor"
                            required
                        />

                    </div>

                    <div className="form-group1">
                        <label>Instructor Contact Number</label>
                        <input
                            type="text"
                            name="instructorNumber"
                            value={sessionDetails.instructorNumber}
                            onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
                                if (value.length > 11) value = value.slice(0, 11); // Limit to 11 digits
                                if (value.length > 4) {
                                    value = value.slice(0, 4) + '-' + value.slice(4);
                                }

                                setSessionDetails({ ...sessionDetails, instructorNumber: value });
                            }}
                            placeholder="03XX-XXXXXXX"
                            required
                        />

                    </div>
                    <div className="button-container ">
                        <button type="button" className="schedule-btn" onClick={handleBack}
                        >
                            Back
                        </button>
                        <button className="schedule-btn" onClick={handleNext}
                        >
                            Next
                        </button>
                    </div>

                </>
            )}
            {step === 4 && sessionDetails.paymentMethod === 'cash' && (
                <>
                    <div className="form-group1">
                        <label>Receiver's Account Title</label>
                        <input
                            type="text"
                            name="senderTitle"
                            value={sessionDetails.senderTitle}
                            onChange={handleInputChange}
                            readOnly
                        />
                    </div>



                    <div className="form-actionss">
                        <button type="button" className="schedule-btn" onClick={handleBack}>
                            Back
                        </button>
                        <button className="schedule-btn" onClick={handleNextStep} disabled={loadingAccount}>
                            {loadingAccount ? 'Loading...' : 'Next'}
                        </button>
                    </div>
                </>
            )}


            {step === 5 && sessionDetails.paymentMethod === "cash" && (
                <div className="step-container">
                    <div className="amount-box">
                        <label className="amount-label" >Rs.</label>
                        <input
                            type="text"
                            className="amount-input"
                            placeholder="Enter Amount"
                            value={sessionDetails.amount}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow only digits
                                if (/^\d*$/.test(value)) {
                                    setSessionDetails({ ...sessionDetails, amount: value });
                                }
                            }}
                            inputMode="numeric"
                            pattern="\d*"
                            required
                        />

                    </div>
                    <div className='form-actionss'>
                        <button type="button" className="schedule-btn" onClick={handleBack}>
                            Back
                        </button>
                        <button className="schedule-btn" onClick={confirmpayment}>
                            Send Payment
                        </button></div>
                </div>
            )}
            {step === 7 && sessionDetails.paymentMethod === "cash" && (
                <div className="receipt">
                    <h2 style={{ color: 'green', fontWeight: 'bold' }}>Transaction Successful ✅</h2>
                    <p className="field-row">
                        <span className="label">Receiver Title:</span>
                        <span className="value">{sessionDetails.senderTitle}</span>
                    </p>

                    <p className="field-row">
                        <span className="label">Amount:</span>
                        <span className="value">Rs. {sessionDetails.amount}</span>
                    </p>
                    <div className="form-actionss">

                        <button className="schedule-btn" onClick={confirmsession}>
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 6 && sessionDetails.paymentMethod === "food" && (
                <div className="step-container">
                    <div className="select-student-for-food">
                        <label
                            className="select-stuselect-stu"
                            style={{ marginBottom: '10px', display: 'block' }}
                        >
                            Select Instructor Peer:
                        </label>
                        <Select
                            options={studentOptions}
                            value={
                                studentOptions.find(option => option.label === sessionDetails.receiver) || null
                            }
                            onChange={(selectedOption) => {
                                setSessionDetails((prev) => ({
                                    ...prev,
                                    receiver: selectedOption ? selectedOption.label : null,
                                }));
                            }}
                            placeholder="Search and select a student..."
                            isClearable
                        />

                    </div>

                    <div className="form-group1">
                        <label>Food Brand Name</label>
                        <input
                            type="text"
                            name="foodBrand"
                            value={sessionDetails.foodBrand}
                            onChange={handleInputChange}
                            placeholder="e.g., McDonald's, KFC"
                            required
                        />
                    </div>

                    <div className="form-group1">
                        <label>Food Item</label>
                        <input
                            type="text"
                            name="foodItem"
                            value={sessionDetails.foodItem}
                            onChange={handleInputChange}
                            placeholder="e.g., Zinger Burger, Pizza"
                            required
                        />
                    </div>

                    <div className="form-group1">
                        <label>Upload Bill </label>
                        <input
                            type="file"
                            name="file"
                            accept=".jpg, .jpeg, .png, .svg"
                            onChange={(e) =>
                                setSessionDetails({ ...sessionDetails, foodBill: e.target.files[0] })
                            }
                            required
                        />
                    </div>


                    <div className="form-actionss">
                        <button type="button" className="schedule-btn" onClick={handleBackup}>
                            Back
                        </button>
                        <button className="schedule-btn" onClick={confirmfood}>
                            Submit
                        </button>
                    </div>

                </div>
            )}

            {step === 8 && (
                <div className="receipt">
                    <h2 style={{ color: 'green', fontWeight: 'bold', fontSize: '24px' }}>Transaction Successful ✅</h2>

                    <p className="field-row">
                        <span className="label">Topic:</span>
                        <span className="value">{sessionDetails.topic}</span>
                    </p>
                    <p className="field-row">
                        <span className="label">Date:</span>
                        <span className="value">
                            {sessionDetails.date ? new Date(sessionDetails.date).toLocaleDateString() : 'No date available'}
                        </span>
                    </p>
                    <p className="field-row">
                        <span className="label">Start Time:</span>
                        <span className="value">{sessionDetails.startTime}</span>
                    </p>
                    <p className="field-row">
                        <span className="label">End Time:</span>
                        <span className="value">{sessionDetails.endTime}</span>
                    </p>
                    <p className="field-row">
                        <span className="label">Instructor Name:</span>
                        <span className="value">{sessionDetails.instructorName}</span>
                    </p>
                    <p className="field-row">
                        <span className="label">Instructor Account Title:</span>
                        <span className="value">{sessionDetails.instructorHolder}</span>
                    </p>
                    <p className="field-row">
                        <span className="label">Instructor Account Number:</span>
                        <span className="value">{sessionDetails.instructorNumber}</span>
                    </p>
                    <p className="field-row">
                        <span className="label">Receiver Title:</span>
                        <span className="value">{sessionDetails.senderTitle}</span>
                    </p>

                    <p className="field-row">
                        <span className="label">Amount:</span>
                        <span className="value">Rs. {sessionDetails.amount}</span>
                    </p>

                    <div className="form-actionss">
                        <button type="button" className="schedule-btn" onClick={handleBack}>
                            Back
                        </button>
                        <button className="schedule-btn" onClick={handleAddSession}>
                            Finish & Add Session
                        </button>
                    </div>
                </div>
            )}

            {step === 9 && sessionDetails.paymentMethod === "food" && (
                <div className="receipt">
                    <h4>Session Details</h4>
                    <p className="field-row"><span className="label">Topic:</span> <span className="value">{sessionDetails.topic}</span></p>
                    <p className="field-row"><span className="label">Date:</span> <span className="value">{sessionDetails.date ? new Date(sessionDetails.date).toLocaleDateString() : 'No date available'}</span></p>
                    <p className="field-row"><span className="label">Start Time:</span> <span className="value">{sessionDetails.startTime}</span></p>
                    <p className="field-row"><span className="label">End Time:</span> <span className="value">{sessionDetails.endTime}</span></p>

                    <h4>Food Details</h4>
                    <p className="field-row">
                        <span className="label">Receiver:</span>
                        <span className="value">{sessionDetails.receiver || 'N/A'}</span>
                    </p>

                    <p className="field-row"><span className="label">Food Brand:</span> <span className="value">{sessionDetails.foodBrand}</span></p>
                    <p className="field-row"><span className="label">Food Items:</span> <span className="value">{sessionDetails.foodItem}</span></p>
                    <p className="field-row"><span className="label">Food Bill:</span> <span className="value">{sessionDetails.foodBill?.name}</span></p>

                    <div className="form-actionss">
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
