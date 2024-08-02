import React, { useState } from 'react';
import Employment from './Employment';

const App = () => {
    const [postalCode, setPostalCode] = useState('');
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);

    const handlePostalCodeChange = (e) => {
        setPostalCode(e.target.value);
    };

    const fetchData = () => {
        fetch('https://simple-ei.onrender.com/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postal_code: postalCode }),
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status}, message: ${text}`) });
                }
                return response.json();
            })
            .then(data => {
                if (data && data.data && data.data.data) {
                    setResponseData(data.data.data);
                    setError(null);
                } else {
                    throw new Error('Invalid data format received from server.');
                }
            })
            .catch(error => {
                setError('Error: ' + error.message);
                setResponseData(null);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div>
            <h1>EI Eligibility Calculator</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Postal Code:
                    <input
                        type="text"
                        value={postalCode}
                        onChange={handlePostalCodeChange}
                        required
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
            {error && <p>{error}</p>}
            {responseData && (
                <Employment responseData={responseData} />
            )}
        </div>
    );
};

export default App;
