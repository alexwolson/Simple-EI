import { useState } from 'react'
import './App.css'
import { useForm } from 'react-hook-form';
import Employment from './Employment';


const App = () => {
    const [postalCode, setPostalCode] = useState('');
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()



    const submitForm = () => {
        console.log(postalCode)
        fetch('https://simple-ei.onrender.com/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postal_code: postalCode }),
        })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status}, message: ${text}`) });
                }
                return response.json();
            }).then(data => {
                console.log('Response data:', data);
                // Check if data.data exists and is in the expected format
                if (data && Array.isArray(data.data.data)) {
                    setResponseData(data.data.data);
                    setError(null);
                } else {
                    throw new Error('Invalid data format received from server.');
                }
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

            <Employment></Employment>

            
        </div>
        

        
    );
};

export default App;
