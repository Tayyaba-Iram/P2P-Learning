import React from 'react';
import { Link } from 'react-router-dom'
function Home() {
  return (
    <>
    <div className='home'>
      <img src="Peer-Learning.jpg" alt="Peers" className="Peers" />
      <div className="text-container">
        <h1>Welcome to Peer to Peer Learning!</h1>
        <p>Welcome to our Peer-to-Peer Learning App! Join a vibrant community of learners
         who are eager to share knowledge and collaborate. Whether you’re looking for help
          with your studies, seeking guidance from peers, or wanting to contribute your 
          expertise, you’re in the right place! Our platform connects students, fostering
           an environment of mutual support and growth. Let’s embark on this journey of 
           discovery and learning together!</p>
           <div className="start">
                <Link to="/register"> <button className="start-btn">Get Started</button> </Link>
            </div>
      </div>
    </div>
    <h1 className="services-title">Our Services</h1>
    <div class="services">
    <div class="service-card">
        <img src="Community.png" alt="Peer Community"></img>
        <h3>Peer Community</h3>
        <p>Join a community of like-minded peers to share knowledge and support each other in learning.</p>
    </div>
    <div class="service-card">
        <img src="Earn.png" alt="Fun and Earn"></img>
        <h3>Fun and Earn</h3>
        <p>Engage in activities that allow you to learn, have fun by sending meal to close friends.</p>
    </div>
    <div class="service-card">
        <img src="Broadcast.png" alt="Broadcast Learning Request"></img>
        <h3>Broadcast Learning Request</h3>
        <p>Request help from the community on specific topics or challenges you're facing.</p>
    </div>
    <div class="service-card">
        <img src="Content.jpg" alt="Content Sharing"></img>
        <h3>Content Sharing</h3>
        <p>Share resources, notes, and other learning materials with your peers.</p>
    </div>
    <div class="service-card">
        <img src="Schedule.png" alt="Schedule Sessions"></img>
        <h3>Schedule Sessions</h3>
        <p>Organize and schedule study sessions with your peers for collaborative learning.</p>
    </div>
    <div class="service-card">
        <img src="Repository.png" alt="Create Own Repository"></img>
        <h3>Create Own Repository</h3>
        <p>Build and maintain your own repository of knowledge, accessible to your peers.</p>
    </div>
</div>
 
    </>
  );
}

export default Home;
