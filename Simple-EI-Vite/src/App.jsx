import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'



const App = () => {
    const [postalCode, setPostalCode] = useState('');
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);

    const submitForm = () => {
        fetch('https://simple-ei.onrender.com/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postal_code: postalCode }),
        })
            .then(response => response.json())
            .then(data => {
                setResponseData(data.data);
                setError(null);
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Error: ' + error);
                setResponseData(null);
            });
    };

    const createTableFromData = (data) => {
        if (!data || data.length === 0) {
            return 'No data available';
        }

        const keys = Object.keys(data[0]);
        return (
            <table className="table table-bordered mt-4">
                <thead>
                    <tr>
                        {keys.map(key => (
                            <th key={key}>{key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {keys.map(key => (
                                <td key={key}>{row[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div>
            <div>
                <input
                    type="text"
                    id="postal_code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                />
                <button onClick={submitForm}>Submit</button>
            </div>
            <div id="response">
                {error && <p>{error}</p>}
                {responseData && createTableFromData(responseData)}
            </div>
        </div>
    );
};

export default App;
