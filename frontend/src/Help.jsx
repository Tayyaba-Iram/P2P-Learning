import React from 'react';
import './Help.css';

function Help() {
  return (
    <div className="help-main-div">
      <h1 className="guide">Guidelines to Schedule a Session</h1>
      <p>
        To schedule a session, first click the <strong>"Schedule Session"</strong> button on the dashboard.
        Then provide the topic, date, start time, and end time.
      </p>
      <p>
        After that, choose a payment method:
        <ul>
          <li>
            <strong>Cash:</strong> Provide the instructor’s details and enter the payment amount.
            This amount will be transferred to the system's account but will only be forwarded
            to the instructor after the session is successfully conducted. Without making this payment, your session will not be scheduled.
          </li>
          <li>
            <strong>Food:</strong> Enter the food brand name, the ordered item, and upload a receipt picture as proof.
            Once all information is provided, your session will be scheduled with food as the payment.
          </li>
        </ul>
      </p>
      <p>
        Once the session is scheduled, it will appear on your calendar on the selected date.
        You will also have the option to delete the session from the calendar if needed.
      </p>
      <p>
        After scheduling, send the session link to your instructor peer via the "Chat" button on the dashboard.
      </p>
      <p>
        At the session time, both of you should click the <strong>"Conduct Session"</strong> button and join the session using the shared link.
        You can copy and use this link to enter the session.
      </p>
      <p>
        After the session ends, you will be asked to provide feedback about the session.
      </p>

      <h2 className="guide">Navbar Dropdown Options</h2>
      <ol className="ordered-list">
        <li>
          <strong>Dashboard:</strong> Takes you back to your main dashboard from any page of the site.
        </li>
        <li>
          <strong>Profile:</strong> View and edit your profile information here.
        </li>
        <li>
          <strong>Reset Password:</strong> Change your password by entering a new one.
        </li>
        <li>
          <strong>Repository:</strong> Upload study content to help other users.
        </li>
        <li>
          <strong>Directory:</strong> Browse and learn from study materials uploaded by others.
        </li>
        <li>
          <strong>Complain:</strong> Report any issues to the admin via a complaint form.
        </li>
        <li>
          <strong>Broadcast Request:</strong> Send a request to relevant users specifying what you want to learn and its urgency.
        </li>
      </ol>
    </div>
  );
}

export default Help;
