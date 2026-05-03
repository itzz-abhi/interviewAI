import { useState } from "react";
import Step1Setup from "./Interview/Step1SetUp";
import Step2Interview from "./Interview/Step2Interview";
import Step3InterviewReport from "./Interview/Step3InterviewReport";

function InterviewPage(){
    const [step, setStep] = useState(1);
    const [interviewData, setInterviewData] = useState(null);

    return(
        <div className="min-h-screen bg-gray-950">
           {step === 1 && (
            <Step1Setup onStart={(data) => {
                setInterviewData(data);
                setStep(2);
            }} />
           )}
           {step === 2 && (
            <Step2Interview
                interviewData={interviewData}
                onFinish={(report) => {
                    setInterviewData(report);
                    setStep(3);
                }}
            />
           )}
           {step === 3 && (
            <Step3InterviewReport report={interviewData} />
           )}
        </div>
    )
}

export default InterviewPage;