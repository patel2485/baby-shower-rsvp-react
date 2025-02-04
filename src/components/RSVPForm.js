import React, { useState } from 'react';

const RSVPForm = () => {
  const [attendance, setAttendance] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestNames, setGuestNames] = useState(['']);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleAttendanceChange = (event) => {
    setAttendance(event.target.value);
  };

  const handleGuestChange = (index, value) => {
    const newGuestNames = [...guestNames];
    newGuestNames[index] = value;
    setGuestNames(newGuestNames);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    // Placeholder for future backend integration
    console.log({
      attendance,
      email,
      guests,
      guestNames,
      message
    });
  };

  return (
    <div className="rsvp-form">
      <h2>RSVP to Our Baby Shower</h2>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Will you be attending?</label>
            <div className="radio-group">
              <input type="radio" id="yes" name="attendance" value="Yes" onChange={handleAttendanceChange} required />
              <label htmlFor="yes">Yes, I'll be there!</label>

              <input type="radio" id="no" name="attendance" value="No" onChange={handleAttendanceChange} required />
              <label htmlFor="no">Sorry, I can't make it.</label>
            </div>
          </div>

          {attendance === 'Yes' && (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                />
              </div>

              <div className="form-group">
                <label>How many guests will join you?</label>
                <input
                  type="number"
                  value={guests}
                  min="1"
                  onChange={(e) => {
                    setGuests(e.target.value);
                    setGuestNames(Array.from({ length: e.target.value }, () => ''));
                  }}
                  required
                />
              </div>

              {guestNames.map((name, index) => (
                <div key={index} className="form-group">
                  <label>Guest {index + 1} Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleGuestChange(index, e.target.value)}
                    placeholder={`Guest ${index + 1} Full Name`}
                    required
                  />
                </div>
              ))}
            </>
          )}

          <div className="form-group">
            <label>Wishes to Parents-to-Be</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your wishes here..."
            />
          </div>

          <button type="submit" className="submit-btn">Submit RSVP</button>
        </form>
      ) : (
        <div className="thank-you-message">
          <h3>Thank you for your RSVP!</h3>
          <p>{attendance === 'Yes' ? "We can't wait to see you there!" : "We'll miss you at the celebration!"}</p>
        </div>
      )}
    </div>
  );
};

export default RSVPForm;
