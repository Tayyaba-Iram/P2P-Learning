import express from 'express';
import SessionRating from '../models/SessionRating.js';
import verifyUser from '../middleware/verifyUser.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import UniAdminModel from '../models/UniAdmin.js';

const router = express.Router();

router.post("/submits", verifyUser, async (req, res) => {
  const { sessionId, rating } = req.body;

  if (!sessionId || rating === undefined) {
    return res.status(400).json({ message: "Session ID and rating are required." });
  }

  try {
    // Fetch user details
    const user = await VerifiedStudentModel.findById(req.user._id);
    console.log("Fetched user:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
   

    const newRating = new SessionRating({
      sessionId,
      rating,
      user: req.user._id,
      university: user.university, // assuming field name is `university`
      program: user.program,       // assuming field name is `program`
    });
    console.log("New Rating to be saved:", newRating); // ✅ Log the rating object
    await newRating.save();

    res.status(201).json({ message: "Rating submitted successfully." });
  } catch (err) {
    console.error("Error submitting rating:", err);
    res.status(500).json({ message: "Server error while submitting rating." });
  }
});

router.get('/ratings-by-strenth', verifyUser, async (req, res) => {
  try {
    // Fetch ratings from the database and count them based on rating value (1 to 5)
    const ratingsData = await SessionRating.aggregate([
      {
        $group: {
          _id: "$rating",  // Group by the rating value
          count: { $sum: 1 } // Count the number of occurrences for each rating
        }
      },
      {
        $match: {
          _id: { $in: [1, 2, 3, 4, 5] }  // Include ratings 1, 2, 3, 4, and 5
        }
      },
      {
        $sort: { _id: 1 } // Sort by rating value (1, 2, 3, 4, 5)
      }
    ]);

    // Prepare the data for the frontend
    const ratings = [1, 2, 3, 4, 5];  // All possible ratings
    const ratingCounts = ratings.map(rating => {
      const ratingData = ratingsData.find(item => item._id === rating);
      return ratingData ? ratingData.count : 0;
    });

    // Send the data to frontend
    res.json({
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],  // Labels for each rating section
      datasets: [
        {
          data: ratingCounts,  // The counts of ratings 1 to 5
          backgroundColor: ['#FF5733', '#FF8D1A', '#FFD700', '#32CD32', '#4CAF50'],  // Color for each section
        }
      ]
    });
  } catch (err) {
    console.error("Error fetching ratings by strength:", err);
    res.status(500).json({ message: "Server error fetching ratings" });
  }
});

router.get('/ratings-per-university-program', verifyUser, async (req, res) => {
  try {
    const ratingsData = await SessionRating.aggregate([
      {
        $match: {
          program: { $ne: null, $ne: '' },  // 🚫 Skip if program is null or empty
          university: { $ne: null, $ne: '' } // 🚫 Skip if university is null or empty
        }
      },
      {
        $group: {
          _id: { university: "$university", program: "$program" },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { "sessionCount": -1 }
      }
    ]);
    
    // Filter out entries with undefined/null university or program
    const filteredRatings = ratingsData.filter(item =>
      item._id &&
      item._id.university &&
      item._id.program &&
      typeof item._id.university === 'string' &&
      typeof item._id.program === 'string'
    );

    if (filteredRatings.length === 0) {
      return res.json({ labels: [], datasets: [] });
    }

    // If no data is returned
    if (ratingsData.length === 0) {
      return res.json({ labels: [], datasets: [] });
    }

    // Get all unique programs and universities
    const allPrograms = [...new Set(ratingsData.map(item => item._id.program))];
    const allUniversities = [...new Set(ratingsData.map(item => item._id.university))];

    // Prepare datasets per university
    const datasets = allUniversities.map(university => {
      const universityData = ratingsData.filter(item => item._id.university === university);

      const data = allPrograms.map(program => {
        const found = universityData.find(item => item._id.program === program);
        return found ? found.sessionCount : 0;
      });

      return {
        label: university,
        data,
        backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
        borderRadius: 6,
      };
    });

    res.json({
      labels: allPrograms, // Programs on x-axis
      datasets
    });

  } catch (err) {
    console.error("Error fetching ratings per university and program:", err);
    res.status(500).json({ message: "Server error fetching ratings per university and program" });
  }
});


router.get('/ratings-university-program', verifyUser, async (req, res) => {
  try {
    // Step 1: Get logged-in user's email or ID
    const userEmail = req.user.email;

    // Step 2: Find the university name from UniAdminModel
    const uniAdmin = await UniAdminModel.findOne({ email: userEmail });
    if (!uniAdmin || !uniAdmin.university) {
      return res.status(404).json({ message: "University not found for this user" });
    }

    const userUniversity = uniAdmin.university;

    // Step 3: Aggregate data only for the user's university
    const ratingsData = await SessionRating.aggregate([
      {
        $match: {
          university: userUniversity,
          program: { $ne: null, $ne: '' },
        }
      },
      {
        $group: {
          _id: { program: "$program" },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { sessionCount: -1 }
      }
    ]);

    if (ratingsData.length === 0) {
      return res.json({ labels: [], datasets: [] });
    }

    const labels = ratingsData.map(item => item._id.program);
    const data = ratingsData.map(item => item.sessionCount);

    const datasets = [
      {
        label: userUniversity,
        data,
        backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
        borderRadius: 6,
      }
    ];

    res.json({
      labels,
      datasets
    });

  } catch (err) {
    console.error("Error fetching university-specific ratings:", err);
    res.status(500).json({ message: "Server error fetching university-specific ratings" });
  }
});

export default router;
