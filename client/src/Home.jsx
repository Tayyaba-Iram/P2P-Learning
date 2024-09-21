import axios from 'axios'
import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { userContext } from './App'


function Home() {
  const user = useContext(userContext)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3001/getposts')
      .then(posts => {
        setPosts(posts.data)
      })
      .catch(err => console.log(err))
  }, [])

  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3001/getprofiles')
      .then(profiles => { setProfiles(profiles.data) })
      .catch(err => console.log(err)
      )
  }, [])



  return (
    <div className='posts_container'>

      <h1>I'm always reinventing my blog for the better.</h1>
      <img src="blog colorful.jpg" alt="Logo" className="logo" />
      {
        posts.map(post => (
          <Link to={`/post/${post._id}`} className='post'>
            <img src={`http://localhost:3001/Images/${post.file}`} alt="" />
            <div className='post_text'>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
            </div>
            <div>
              {
                user.email === post.email ?
                  <div className='change'>
                    <Link to={`/editpost/${post._id}`}>Edit  </Link>
                    <Link to={`/deletepost/${post._id}`}>Delete</Link>
                  </div> : <></>
              }

            </div>


          </Link>
        ))
      }
      {
        profiles.map(profile => (
          <Link to={`/profile/${profile._id}`} className='post'>
            <h3>{profile.username}<br></br>
              {profile.email}
              {
                user.email === profile.email ?
                  <div className='change'>
                    <Link to={`/editprofile/${profile._id}`}>Edit</Link>
                  </div> : <></>
              }
            </h3>

          </Link>

        ))
      }

    </div>

  )
}

export default Home