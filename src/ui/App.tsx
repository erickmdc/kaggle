import { useEffect, useState } from 'react';
import { Button, Box, Stepper, Step, StepLabel, Typography } from '@mui/material';
import reactLogo from './assets/react.svg';
import './App.css';

const steps = [
  'Requesting data from kaggle',
  'Processing chunk',
  'Submitting entries to Google Form'
];

function App() {
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentForm, setCurrentForm] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const getData = async () => {
    setIsFetchingData(true);
    await window.electron.fetchData();
  }

  const reset = () => {
    setIsFetchingData(false);
    setCurrentStep(0);
    setCurrentForm(0);
    setErrorMessage('');
  }

  useEffect(() => {
    window.electron.subscribeRequestStatus((eventData) => {
      if (eventData.step != 99)
        setCurrentStep(eventData.step)
      else {
        setErrorMessage(eventData.message ?? '');
      }
    });
    window.electron.subscribeSubmitFormStatus((eventData) => setCurrentForm(eventData));
  }, []);

  return (
    <>
      <div>
        <a>
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Kaggle Assignment</h1>
      <div className="card">
        {isFetchingData ? (
          <>
            <Box sx={{ width: '100%' }}>
              <Stepper activeStep={currentStep} orientation='vertical'>
                {steps.map((label, index) => {

                  const labelProps: {
                    optional?: React.ReactNode;
                    error?: boolean;
                  } = {};
                  if (errorMessage && currentStep === index) {
                    labelProps.optional = (
                      <Typography variant="caption" color="error">
                        {errorMessage}
                      </Typography>
                    );
                    labelProps.error = true;
                  }

                  return (
                    <Step key={label}>
                      <StepLabel {...labelProps}>
                        {label}{(index === 2 && currentStep === 2) && `(${currentForm} forms submitted)`}
                      </StepLabel>
                    </Step>
                  )
                })}
              </Stepper>
              {(currentStep >= 3 || errorMessage) && <Button variant='contained' onClick={reset}>
                {"Go Back"}
              </Button>}
            </Box>
          </>) : (
          <Button variant='contained' onClick={getData}>
            {"Fetch Data"}
          </Button>
        )}
      </div>
    </>
  )
}

export default App;
