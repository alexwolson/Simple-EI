import { useState } from 'react'
import './App.css'
import { Form, useForm } from 'react-hook-form';



const Employment= () => {



    return (

        <form action="">

<h3>Employment Details</h3>

<input type="text" name='employerName' placeholder='Employer Name' />
<input type="date" name='startDate' placeholder='Start Date' />




</form>
    
    );
}

export default Employment;