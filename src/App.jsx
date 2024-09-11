import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [postalCode, setPostalCode] = useState('');
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);
    const [hoursOption, setHoursOption] = useState('direct'); // Options: 'direct', 'weekly'
    const [totalHours, setTotalHours] = useState('');
    const [hoursPerWeek, setHoursPerWeek] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAssumptions, setShowAssumptions] = useState(false);
    const inputRef = useRef(null);
    const [isPostalCodeValid, setIsPostalCodeValid] = useState(false); // Track postal code validity
    const [fontSize, setFontSize] = useState(16); // Start with default font size
    const [assumptions, setAssumptions] = useState({
        insurableEmployment: true,
        noFaultJobLoss: true,
        noWork7Days: true,
        requiredHoursWorked: true,
        readyWillingCapable: true,
        activelyLookingForWork: true
    });

    const fiftyTwoWeeksAgo = new Date(Date.now() - 52 * 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

    // Handle checkbox toggling for assumptions
    const handleAssumptionChange = (e) => {
        const {name, checked} = e.target;
        setAssumptions(prev => ({
            ...prev,
            [name]: checked
        }));
    };
    const validateHours = () => {
        if (hoursOption === 'direct') {
            return totalHours && parseInt(totalHours) > 0;
        } else if (hoursOption === 'weekly') {
            return hoursPerWeek && parseInt(hoursPerWeek) > 0 && startDate && endDate;
        }
        return false;
    };

    // Trigger recalculation of button disabled state on input changes
    useEffect(() => {
        // Validate the postal code and hours to enable/disable the button
        setIsPostalCodeValid(validatePostalCode()); // Set state based on postal code validity
        const areHoursValid = validateHours();
        setIsButtonDisabled(!isPostalCodeValid || !areHoursValid);

        // Set button style to button-disabled if the button is disabled
        if (isButtonDisabled) {
            document.querySelector('button').classList.add('button-disabled');
        } else {
            document.querySelector('button').classList.remove('button-disabled');
        }

        // Dynamic font resizing for postal code input
        const resizeFont = () => {
            if (inputRef.current) {
                const inputWidth = inputRef.current.offsetWidth;
                const characterCount = 7; // Max of 6 characters + 1 space
                const newFontSize = inputWidth / characterCount;
                setFontSize(newFontSize);
            }
        };

        // Resize font initially and whenever the window is resized
        window.addEventListener('resize', resizeFont);
        resizeFont(); // Trigger on first render

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', resizeFont);
        };
    }, [postalCode, totalHours, hoursPerWeek, startDate, endDate, hoursOption]); // Add all necessary dependencies here

    const handlePostalCodeChange = (e) => {
        let value = e.target.value.toUpperCase(); // Convert input to uppercase automatically
        value = value.replace(/\s/g, ''); // Remove any existing spaces

        // Limit the input to 6 alphanumeric characters
        if (value.length > 6) {
            value = value.slice(0, 6);
        }

        // Automatically insert a space after the third character
        if (value.length > 3) {
            value = value.slice(0, 3) + ' ' + value.slice(3);
        }

        setPostalCode(value);
    };


    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const validatePostalCode = () => {
        const postalCodeRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
        if (!postalCodeRegex.test(postalCode)) {
            setError('Invalid postal code format. Please enter a valid Canadian postal code.');
            return false;
        }
        setError(null);
        return true;
    };

    const fetchData = async () => {
        if (!validatePostalCode()) return;

        try {
            const backendURL = `https://ei-eligibility-backend.fly.dev/scrape?postalCode=${postalCode.replace(" ", "")}`;
            const response = await axios.get(backendURL);

            if (response.data && response.data.data) {
                setResponseData(response.data.data);
                setError(null);
            } else {
                throw new Error('No data returned from the backend');
            }
        } catch (error) {
            setError('Error: ' + error.message);
            setResponseData(null);
        }
    };

    const calculateTotalHours = () => {
        if (hoursOption === 'direct') {
            return parseInt(totalHours);
        } else if (hoursOption === 'weekly' && startDate && endDate) {
            const weeksWorked = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 7)); // Calculate weeks
            return weeksWorked * hoursPerWeek;
        }
        return 0;
    };

    // Check if all assumptions are true
    const areAllAssumptionsMet = Object.values(assumptions).every(assumption => assumption);

    const handleEligibilityCheck = (insuredHoursRequired) => {
        const totalHoursWorked = calculateTotalHours();
        return totalHoursWorked >= insuredHoursRequired && areAllAssumptionsMet;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);  // Set loading to true when submitting the form
        try {
            await fetchData(); // Submit form data (you already have this logic)
        } finally {
            setLoading(false); // Set loading to false when request is done
        }
    };

    return (
        <div className="App">
            <h1>Am I eligible for EI?</h1>
            <p style={{textAlign: 'center'}}>Enter your postal code and hours worked to find out.</p>
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={postalCode}
                        onChange={handlePostalCodeChange}
                        placeholder="A1A 1A1"
                        style={{
                            fontSize: `${fontSize}px`,
                            fontFamily: 'monospace',
                            textTransform: 'uppercase', // Automatically capitalize
                            width: '100%', // Ensure it takes up the full width
                            padding: '10px', // Add padding for better UI
                            boxSizing: 'border-box',
                            textAlign: 'center' // Center the text
                        }}
                        maxLength={7} // Limit input to 7 characters (6 + space)
                        required
                    />
                </label>
                {/* Conditionally render the hours worked section and buttons */}
                {isPostalCodeValid && (
                    <div>
                        <label>
                            <input
                                type="radio"
                                value="direct"
                                checked={hoursOption === 'direct'}
                                onChange={() => setHoursOption('direct')}
                            />
                            Total hours worked
                        </label>
                        {hoursOption === 'direct' && (
                            <input
                                type="number"
                                value={totalHours}
                                onChange={(e) => setTotalHours(e.target.value)}
                                placeholder="e.g. 1200"
                                required
                            />
                        )}

                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="weekly"
                                    checked={hoursOption === 'weekly'}
                                    onChange={() => setHoursOption('weekly')}
                                />
                                Hours per week + date range
                            </label>
                            {hoursOption === 'weekly' && (
                                <div>
                                    <input
                                        type="number"
                                        value={hoursPerWeek}
                                        onChange={(e) => setHoursPerWeek(e.target.value)}
                                        placeholder="e.g. 37.5"
                                        required
                                    />
                                    <input
                                        type="date"
                                        value={startDate ? startDate.toISOString().slice(0, 10) : ''}
                                        onChange={(e) => setStartDate(new Date(e.target.value))}
                                        placeholder="Start Date"
                                        required
                                    />
                                    <input
                                        type="date"
                                        value={endDate ? endDate.toISOString().slice(0, 10) : ''}
                                        onChange={(e) => setEndDate(new Date(e.target.value))}
                                        placeholder="End Date"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                )}

                <button type="submit" disabled={isButtonDisabled || loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>


            {responseData && (
                <div>
                    <h2>Results:</h2>
                    {handleEligibilityCheck(responseData[0].EconomicRegionDetails?.insured_hours_required) ? (
                        <div>
                            <div style={{color: 'green', fontSize: '48px', textAlign: 'center'}}>
                                YES
                            </div>
                            <div style={{textAlign: 'center'}}
                            > Ready to apply? <a
                                href="https://www.canada.ca/en/services/benefits/ei/ei-regular-benefit/apply.html"
                                target="_blank" rel="noopener noreferrer">Apply for EI</a></div>
                        </div>
                    ) : (
                        <div style={{color: 'orange', fontSize: '48px', textAlign: 'center'}}>
                            NO
                        </div>
                    )}
                    <div>
                        {!assumptions.insurableEmployment && <p>You did not have a job that paid into EI.</p>}
                        {!assumptions.noFaultJobLoss &&
                            <p>You lost your job due to reasons that are considered your fault.</p>}
                        {!assumptions.noWork7Days &&
                            <p>You haven't been without work or pay for at least 7 consecutive days in the last
                                year.</p>}
                        {!assumptions.requiredHoursWorked &&
                            <p>You haven’t worked the required number of hours in the last 52 weeks.</p>}
                        {!assumptions.readyWillingCapable &&
                            <p>You are not ready, willing, and capable of working each day.</p>}
                        {!assumptions.activelyLookingForWork && <p>You are not actively looking for work.</p>}
                        {calculateTotalHours() < responseData[0].EconomicRegionDetails?.insured_hours_required && (
                            <p>You haven't worked the required number of insured hours. You
                                worked {calculateTotalHours()} hours,
                                but {responseData[0].EconomicRegionDetails?.insured_hours_required} hours are
                                required.</p>
                        )}
                        {calculateTotalHours() >= responseData[0].EconomicRegionDetails?.insured_hours_required && handleEligibilityCheck(responseData[0].EconomicRegionDetails?.insured_hours_required) && (
                            <p>You've worked the required number of insured hours. You
                                worked {calculateTotalHours()} hours,
                                and {responseData[0].EconomicRegionDetails?.insured_hours_required} hours are
                                required.</p>
                        )}
                    </div>
                    <hr/>
                    {/* Collapsible section for assumptions */}
                    <div>
                        <h6>
                            <button type="button" onClick={() => setShowAssumptions(!showAssumptions)}>
                                We're making some assumptions...
                            </button>
                        </h6>
                        {showAssumptions && (
                            <div className="assumptions">
                                <div>
                                    <p>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="insurableEmployment"
                                                checked={assumptions.insurableEmployment}
                                                onChange={handleAssumptionChange}
                                            />
                                            You had a job that <a
                                            href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/ei-cpp/ei-insurable-employment.html"
                                            target="_blank" rel="noopener noreferrer">paid into EI</a>. Examples of jobs
                                            that might not pay into EI include self-employment or certain contract
                                            positions.
                                        </label>
                                    </p>
                                    <p>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="noFaultJobLoss"
                                                checked={assumptions.noFaultJobLoss}
                                                onChange={handleAssumptionChange}
                                            />
                                            You lost your job through <a
                                            href="https://www.canada.ca/en/services/benefits/ei/ei-regular-benefit.html"
                                            target="_blank" rel="noopener noreferrer">no fault of your own</a> (e.g.
                                            layoffs, company closure, natural disaster).
                                        </label>
                                    </p>
                                    <p>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="noWork7Days"
                                                checked={assumptions.noWork7Days}
                                                onChange={handleAssumptionChange}
                                            />
                                            You've had no work or pay for at least 7 days in the last year
                                            (specifically, since {fiftyTwoWeeksAgo}).
                                        </label>
                                    </p>
                                    <p>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="readyWillingCapable"
                                                checked={assumptions.readyWillingCapable}
                                                onChange={handleAssumptionChange}
                                            />
                                            You could start working tomorrow if you had a job to go to.
                                        </label>
                                    </p>
                                    <p>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="activelyLookingForWork"
                                                checked={assumptions.activelyLookingForWork}
                                                onChange={handleAssumptionChange}
                                            />
                                            You are actively looking for a job.
                                        </label>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <hr/>
                    <div>
                        <p>Your postal code tells us you're
                            in {responseData[0].ei_economic_region_name || 'N/A'}.</p>
                        <p>Currently, the unemployment rate there
                            is {responseData[0].EconomicRegionDetails?.unemployment_rate || 'N/A'}%.</p>
                        <p>This means if you're eligible, you would get at
                            least {responseData[0].EconomicRegionDetails?.min_weeks_payable || 'N/A'} and at
                            most {responseData[0].EconomicRegionDetails?.max_weeks_payable || 'N/A'} weeks of
                            EI.</p>
                        <p>You need to have
                            worked {responseData[0].EconomicRegionDetails?.insured_hours_required || 'N/A'} hours
                            in the last 52 weeks to qualify.</p>
                    </div>
                </div>
            )}


        </div>
    );
};

export default App;
