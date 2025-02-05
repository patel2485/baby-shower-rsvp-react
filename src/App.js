import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [timeLeft, setTimeLeft] = useState({});
  const [step, setStep] = useState(1);
  const [isAttending, setIsAttending] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState(['']);
  const [email, setEmail] = useState('');
  const [wishes, setWishes] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestResponse, setGuestResponse] = useState('');
  const [nonAttendingName, setNonAttendingName] = useState('');

  // Countdown Timer Logic
  useEffect(() => {
    const eventDate = new Date('2025-03-02T10:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({});
      } else {
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRsvpSubmit = async () => {
    if (isAttending === null) {
      alert('Please select if you are attending or not.');
      return;
    }
  
    const rsvpData = {
      isAttending,
      guestCount,
      guestNames,
      email,
      wishes,
      nonAttendingName
    };
  
    // 🌍 Dynamically set the API URL for both local and Vercel environments
    const API_URL = process.env.NODE_ENV === 'production' 
      ? '/api/submit-rsvp'   // On Vercel
      : 'http://localhost:5000/submit-rsvp';  // Locally
  
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpData),
      });
  
      if (response.ok) {
        setRsvpSubmitted(true);
        setGuestResponse(isAttending ? 'Thanks for your RSVP. See you there!' : "We will miss you.");
      } else {
        throw new Error('RSVP submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an issue submitting your RSVP. Please try again later.');
    }
  };
  
  
  

  const handleGuestCountChange = (count) => {
    setGuestCount(count);
    setGuestNames(Array(count).fill(''));
  };

  const handleGuestNameChange = (index, value) => {
    const newGuestNames = [...guestNames];
    newGuestNames[index] = value;
    setGuestNames(newGuestNames);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-blue-100 flex flex-col items-center justify-center p-4 space-y-6 font-quicksand">

      {/* Home Section */}
      <header className="bg-gradient-to-r from-pink-400 to-yellow-300 w-full text-center py-8 shadow-lg rounded-xl">
        <h1 className="text-4xl sm:text-6xl font-lobster text-white mb-4">Avani & Darshan's Baby Shower</h1>
        <p className="text-xl sm:text-2xl text-yellow-800 mb-4">Join us for a day full of joy and love!</p>
        <div className="mt-4 bg-white p-4 sm:p-6 rounded-2xl shadow-xl inline-block">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-800 mb-3">Countdown to the Big Day!</h2>
          {timeLeft.days !== undefined ? (
            <div className="flex justify-center space-x-4 sm:space-x-6">
              {['Days', 'Hours', 'Minutes', 'Seconds'].map((unit, index) => (
                <div key={unit} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-blue-400 text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    {timeLeft[['days', 'hours', 'minutes', 'seconds'][index]]}
                  </div>
                  <p className="text-sm mt-2 text-gray-700">{unit}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg sm:text-xl text-red-600">The event has started!</p>
          )}
        </div>
        <button onClick={() => document.getElementById('rsvp-form').scrollIntoView({ behavior: 'smooth' })} className="mt-4 sm:mt-6 bg-blue-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105">RSVP Now</button>
      </header>

      {/* Event Details Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h2 className="text-3xl sm:text-4xl font-lobster text-pink-700 text-center mb-4 sm:mb-6">Event Details</h2>
        <div className="space-y-6">
          {[{
            icon: '📅',
            title: 'Date & Time',
            content: 'March 2, 2025 | 10:00 AM'
          }, {
            icon: '📍',
            title: 'Venue',
            content: 'India Palace, 4030 Albert St, Regina, SK',
            map: 'https://maps.google.com/maps?q=India%20Palace%2C%204030%20Albert%20St%2C%20Regina&t=&z=13&ie=UTF8&iwloc=&output=embed'
          }, {
            icon: '👗',
            title: 'Dress Code',
            content: "Indian Traditional (or any attire you're comfortable in)"
          }, {
            icon: '🎉',
            title: 'Hosts',
            content: 'Avani & Darshan'
          }].map(({ icon, title, content, map }, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="bg-pink-400 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl">{icon}</div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-pink-800">{title}</h3>
                <p className="text-lg">{content}</p>
                {map && <iframe className="w-full h-28 sm:h-32 rounded-lg mt-2" src={map}></iframe>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RSVP Form Section */}
<section id="rsvp-form" className="bg-gradient-to-r from-pink-50 to-blue-50 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
  <h2 className="text-3xl sm:text-4xl font-lobster text-pink-700 text-center mb-4 sm:mb-6">RSVP Form</h2>

  {!rsvpSubmitted ? (
    <div>
      {step === 1 && (
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 mb-2">Will you be attending?</label>
          <div className="flex space-x-4">
            <button onClick={() => { setIsAttending(true); setStep(2); }} className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105">Yes</button>
            <button onClick={() => { setIsAttending(false); setStep(2); }} className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105">No</button>
          </div>
        </div>
      )}

      {step === 2 && isAttending && (
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 mb-2">Number of Guests</label>
          <input type="number" min="1" value={guestCount} onChange={(e) => handleGuestCountChange(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none mb-4" required />
          <button onClick={() => {
            if (guestCount < 1) {
              alert('Please select at least one guest.');
            } else {
              setStep(3);
            }
          }} className="w-full py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105">Continue</button>
        </div>
      )}

      {step === 3 && isAttending && (
        <div>
          {guestNames.map((name, index) => (
            <div key={index} className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">Guest {index + 1} Full Name</label>
              <input type="text" value={name} onChange={(e) => handleGuestNameChange(index, e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none" required />
            </div>
          ))}
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700 mb-2">Primary Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none" required />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700 mb-2">Wishes to Parents-to-Be</label>
            <textarea value={wishes} onChange={(e) => setWishes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none" rows="4" required></textarea>
          </div>
          <button onClick={handleRsvpSubmit} className="w-full py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105">Submit RSVP</button>
        </div>
      )}

      {step === 2 && !isAttending && (
        <div>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700 mb-2">Your Full Name</label>
            <input type="text" value={nonAttendingName} onChange={(e) => setNonAttendingName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none" required />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700 mb-2">Wishes to Parents-to-Be</label>
            <textarea value={wishes} onChange={(e) => setWishes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none" rows="4" required></textarea>
          </div>
          <button onClick={handleRsvpSubmit} className="w-full py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105">Submit RSVP</button>
        </div>
      )}
    </div>
  ) : (
    <div className="mt-6 bg-green-100 p-4 rounded-lg text-center text-lg text-green-700">
      Thanks for your RSVP. See you there!
    </div>
  )}
</section>

    </div>
  );
}

export default App;
