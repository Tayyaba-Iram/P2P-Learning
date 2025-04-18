const RequestTable = ({ myRequests }) => {
  if (!myRequests || myRequests.length === 0) {
    return <p>No requests available.</p>;
  }

  return (
    <div className="requests-table">
      <h3>Your Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Subtopic</th>
            <th>Urgency</th>
            <th>Programs</th>
          </tr>
        </thead>
        <tbody>
          {myRequests.map((request, index) => (
            <tr key={index}>
              <td>{request.topic}</td>
              <td>{request.subtopic}</td>
              <td>{request.urgency}</td>
              <td>{request.programs.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
