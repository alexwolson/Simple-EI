import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {


  return (
    <>
    <div class="container mt-6">
        <form id="postalCodeForm">
            <div class="mb-4 mt-3">
                <label for="postal_code" class="form-label">Postal Code:</label>
                <input type="text" class="form-control" id="postal_code" placeholder="Enter Postal Code" name="postal_code"/>
            </div>
            <button type="button" class="btn btn-primary" onclick="submitForm()">Submit</button>
        </form>
        <div id="response" class="table-responsive"></div>
    </div>
   
    </>
  )
}

export default App
