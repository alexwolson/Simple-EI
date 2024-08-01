import React from 'react';
import { useForm } from 'react-hook-form';

const Employment = ({ responseData }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const calculateTotalHours = (startDate, endDate, weeklyHours) => {
        if (!startDate || !endDate || !weeklyHours) {
            return 0;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const weeks = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));
        return weeks * weeklyHours;
    };

    const checkEligibility = () => {
        const startDate = watch('startDate');
        const endDate = watch('endDate');
        const weeklyHours = watch('weeklyHours');

        if (responseData && responseData.length > 0) {
            const requiredHours = responseData[0].insured_hours_required;
            const totalHoursWorked = calculateTotalHours(startDate, endDate, weeklyHours);
            if (totalHoursWorked >= requiredHours) {
                return 'Eligible for EI';
            } else if (totalHoursWorked > 0) {
                return `Not eligible for EI. You need ${requiredHours - totalHoursWorked} more hours.`;
            } else {
                return 'Not eligible for EI';
            }
        }
        return '';
    };

    const createTableFromData = (data) => {
        if (!data || data.length === 0) {
            return 'No data available';
        }

        const keys = Object.keys(data[0]);
        return (
            <table className="table table-bordered mt-3">
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
            <form onSubmit={handleSubmit(checkEligibility)}>
                <label>
                    Start Date:
                    <input
                        type="date"
                        name="startDate"
                        {...register("startDate", { required: 'Start date is required.' })}
                    />
                    {errors.startDate && <p>{errors.startDate.message}</p>}
                </label>
                <label>
                    End Date:
                    <input
                        type="date"
                        name="endDate"
                        {...register("endDate", { required: 'End date is required.' })}
                    />
                    {errors.endDate && <p>{errors.endDate.message}</p>}
                </label>
                <label>
                    Weekly Hours Worked:
                    <input
                        type="number"
                        name="weeklyHours"
                        {...register("weeklyHours", {
                            required: 'Weekly hours worked is required.',
                            min: { value: 1, message: 'Weekly hours must be at least 1.' },
                            max: { value: 168, message: 'Weekly hours cannot exceed 168.' }
                        })}
                    />
                    {errors.weeklyHours && <p>{errors.weeklyHours.message}</p>}
                </label>
                <button type="submit">Check Eligibility</button>
            </form>
            <div>{checkEligibility()}</div>
            <div>{createTableFromData(responseData)}</div>
        </div>
    );
};

export default Employment;

