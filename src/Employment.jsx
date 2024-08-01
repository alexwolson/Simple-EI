import { useState } from 'react'
import './App.css'
import { Form, useForm } from 'react-hook-form';



const Employment= () => {


    const {register}= useForm();


        return (

        <form action="">

<h3>Employment Details</h3>

<input type="text" {...register('employerName')} placeholder='Employer Name' />
<input type="radio" {...register('currentEmployer')} />
<p>Start Date</p>
<input type="date" {...register('startDate',{required:true})} placeholder='Start Date' />
<p>End Date</p>
<input type="date" {...register('endDate')} placeholder='End Date' />
<p>Weekly Hours</p>
<input type="number" {...register("weeklyHours", {required:true})}/>



</form>
    
    );
}

export default Employment;