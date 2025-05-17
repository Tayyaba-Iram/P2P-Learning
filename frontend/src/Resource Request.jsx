import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Resource Request.css'
function ResourceRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
         const interval = setInterval(() => {
        const fetchRequests = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/api/my-received-requests', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const requestsWithLocalState = response.data.map((req) => ({
                    ...req,
                    localStatus: (req.status?.charAt(0).toUpperCase() + req.status?.slice(1).toLowerCase()) || 'Pending',
                }));
                setRequests(requestsWithLocalState);
            } catch (error) {
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, 1000);

    return () => clearInterval(interval);
      
    }, []);
 
    const handleAccept = async (index) => {
        const updated = [...requests];
        updated[index].localStatus = 'Accepted';
        setRequests(updated);

        try {
            const token = sessionStorage.getItem('token');
            const requestId = updated[index]._id;
            await axios.put(
                `http://localhost:3001/api/requests/${requestId}/accept`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    };

    const handleReject = async (index) => {
        const updated = [...requests];
        updated[index].localStatus = 'Rejected';
        setRequests(updated);

        try {
            const token = sessionStorage.getItem('token');
            const requestId = updated[index]._id;
            await axios.put(
                `http://localhost:3001/api/requests/${requestId}/reject`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    };

    if (loading) return <div>Loading requests...</div>;

    return (
        <div className="resource-request-container">
            <h2>Resource Access Requests</h2>

            {requests.length === 0 ? (
                <p className='no-request'>No resource requests found.</p>
            ) : (
                <table className='resource-request-table'>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{width:'40px'}}>#</th>
                            <th>Requestor Name</th>
                            <th>Requestor Email</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{request.senderName || 'N/A'}</td>
                                <td>{request.senderEmail || 'N/A'}</td>
                                <td>{request.repoTitle}</td>
                                <td>{request.repoDescription}</td>
                                <td>
                                    {request.localStatus === 'Pending' ? (
                                        <div className='accp-rej-btn'>
                                            <button className='accp-btn' onClick={() => handleAccept(index)}>Accept</button>{' '}
                                            <button style={{
                                                backgroundColor: 'crimson',
                                            }}
                                                className='rej-btn' onClick={() => handleReject(index)}>Reject</button>
                                        </div>
                                    ) : request.localStatus === 'Accepted' ? (
                                        <span style={{ color: 'green', fontWeight: 'bold' }}>Accepted</span>
                                    ) : (
                                        <span style={{ color: 'crimson' }}>Rejected</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ResourceRequest;
