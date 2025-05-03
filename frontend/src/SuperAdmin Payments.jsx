import React, { useEffect, useState } from 'react';
import './SuperAdmin Payments.css';
import axios from 'axios';

const SuperAdminPayments = () => {
    const [accountData, setAccountData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const filteredSessions = sessions.filter((session) => {
        const query = searchQuery.toLowerCase();
        return (
            session.studentName?.toLowerCase().includes(query) ||
            session.userEmail?.toLowerCase().includes(query) ||
            session.university?.toLowerCase().includes(query) ||
            session.program?.toLowerCase().includes(query) ||
            session.phoneNumber?.toLowerCase().includes(query) ||
            session.instructorName?.toLowerCase().includes(query) ||
            session.instructorHolder?.toLowerCase().includes(query) ||
            session.instructorNumber?.toLowerCase().includes(query) ||
            session.topic?.toLowerCase().includes(query)
        );
    });

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const initializeAccount = async () => {
            try {
                // Step 1: Save initial account with 0 (just to ensure it exists)
                await axios.post('http://localhost:3001/api/save-account', {
                    holder: 'P2P Learning',
                    number: '0331-6384756',
                    balance: 0
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Step 2: Fetch payment sessions
                const sessionRes = await axios.get('http://localhost:3001/api/get-payment-details', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const fetchedSessions = sessionRes.data.sessions || [];

                // Reverse the array to show latest sessions first (based on insertion order)
                fetchedSessions.reverse();

                setSessions(fetchedSessions);


                // Step 3: Calculate 10% from all payments
                const total10PercentAmount = fetchedSessions.reduce((acc, session) => {
                    const deductedAmount = session.amount * 0.10;
                    return acc + deductedAmount;
                }, 0);

                // Step 4: Use base balance and update it
                const initialBalance = 0;
                const updatedBalance = initialBalance + total10PercentAmount;

                const account = {
                    holder: 'P2P Learning',
                    number: '0331-6384756',
                    balance: updatedBalance
                };

                // Step 5: Save the updated balance
                await axios.post('http://localhost:3001/api/save-account', account, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setAccountData(account);
            } catch (err) {
                console.error("Error initializing account:", err.message);
            } finally {
                setLoading(false);
            }
        };

        initializeAccount();

    }, [token]);
    function toggleSearchIcon() {
        const inputField = document.querySelector('.search-input');
        const searchIcon = document.querySelector('.search-icon');
        if (inputField.value.trim() !== "") {
            searchIcon.style.opacity = '0'; // hide the search icon
        } else {
            searchIcon.style.opacity = '1'; // show the search icon
        }
    }

    return (
        <>
            <div className="simple-dashboard">
                <header className="simple-header">
                    <div className="account-header-flex">
                        <img src="Easypaisa Logo.png" alt="Profile" className="profile-image" />
                        <div className="account-name">Easypaisa Account</div>
                    </div>
                </header>

                <div className="account-section">
                    <div className="profile-circle">PL</div>
                    <div className="account-info">
                        {accountData ? (
                            <>
                                <p className="account-holder">{accountData.holder}</p>
                                <p className="account-number">{accountData.number}</p>
                                <p className="account-balance">Current Balance: Rs. {Math.round(accountData.balance || 0)}</p>
                            </>
                        ) : (
                            <p>Loading account data...</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder=" 🔍︎ Search history by Sender Name, Email, University, Program, Phone Number, Instructor Name, Instructor Account Title, Instructor Account Number, Session Topic..."
                />
            </div>


            <div className="session-table-container">
                <h2>Session Payments History</h2>
                {loading ? (
                    <p>Loading sessions...</p>
                ) : sessions.length > 0 ? (
                    <table className="session-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Sender Name</th>
                                <th>Email</th>
                                <th>University</th>
                                <th>Program</th>
                                <th>Phone Number</th>
                                <th>Instructor Name</th>
                                <th>Instructor Account Title</th>
                                <th>Instructor Account Number</th>
                                <th>Session Topic</th>
                                <th>Payment</th>
                                <th>10% Subtracted Payment</th>
                                <th>Amount After 10% Deduction</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.map((session, index) => {

                                const payment = session.amount;
                                const deductedAmount = payment * 0.10;
                                const amountAfterDeduction = payment - deductedAmount;
                                return (
                                    <tr key={session._id}>
                                        <td>{index + 1}</td>
                                        <td>{session.studentName}</td>
                                        <td>{session.userEmail}</td>
                                        <td>{session.university}</td>
                                        <td>{session.program}</td>
                                        <td>{session.phoneNumber}</td>
                                        <td>{session.instructorName}</td>
                                        <td>{session.instructorHolder}</td>
                                        <td>{session.instructorNumber}</td>
                                        <td>{session.topic}</td>
                                        <td>Rs. {Math.round(payment)}</td>
                                        <td>Rs. {Math.round(deductedAmount)}</td>
                                        <td>Rs. {Math.round(amountAfterDeduction)}</td>
                                        <td>{new Date(session.date).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p>No session data available.</p>
                )}
            </div>
        </>
    );
};

export default SuperAdminPayments;
