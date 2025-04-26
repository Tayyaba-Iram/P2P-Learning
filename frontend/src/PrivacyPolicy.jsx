import React from 'react';
import './PrivacyPolicy.css'; // Make sure to create this CSS file in the same folder

function PrivacyPolicy() {
  return (
    <div className="privacy-main-div">
      <h1 className="privacy-heading">Privacy Policy for P2P Learning</h1>

      <p>
        P2P Learning is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you use our platform. Please read this policy carefully to
        understand our views and practices regarding your personal data.
      </p>

      <h2>Information We Collect</h2>
      <p>We may collect and process the following information about you:</p>
      <ul>
        <li>Personal Information: Name, email address, contact number, university name, student ID, and other profile-related details.</li>
        <li>Login Credentials: Encrypted passwords.</li>
        <li>Academic Information: Campus, program, subjects of interest.</li>
        <li>Interaction Data: Messages, session details, complaints, and feedback.</li>
        <li>Payment Information: Only relevant data necessary to process and track transactions (we do not store your bank/credit card details).</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect for purposes including:</p>
      <ul>
        <li>Creating and managing your user account.</li>
        <li>Facilitating peer-to-peer learning and session scheduling.</li>
        <li>Processing payments and maintaining transaction history.</li>
        <li>Improving the functionality and performance of our platform.</li>
        <li>Communicating updates, support messages, or relevant notifications.</li>
        <li>Ensuring platform safety and preventing abuse or misuse.</li>
      </ul>

      <h2>Sharing Your Information</h2>
      <p>We do not sell or trade your personal data. However, we may share it:</p>
      <ul>
        <li>With your consent.</li>
        <li>With instructors/peers for scheduling sessions.</li>
        <li>With administrators for complaint management or misuse reports.</li>
        <li>If required by law or in response to a valid legal request.</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to safeguard your data from unauthorized access,
        disclosure, alteration, or destruction. Sensitive data (e.g., passwords) is encrypted and securely stored.
      </p>

      <h2>Your Rights</h2>
      <ul>
        <li>Access the personal information we hold about you.</li>
        <li>Request correction or deletion of your data.</li>
        <li>Withdraw consent at any time (note: this may affect your ability to use certain features).</li>
      </ul>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify users of any significant changes through the
        platform or by email.
      </p>

      <h2>Contact Us</h2>
      <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
      <p>📧 pplearning03@gmail.com</p>
    </div>
  );
}

export default PrivacyPolicy;
