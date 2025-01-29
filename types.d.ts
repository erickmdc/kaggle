type BabyData = {
    YearOfBirth: number;
    Name: string;
    Sex: string;
    Number: number;
}

type ProcessingEvent = {
    step: number;
    message?: string;
}

interface Window {
    electron: {
        fetchData: () => Promise<void>;
        subscribeRequestStatus: (callback: (eventData: ProcessingEvent) => void) => void;
        subscribeSubmitFormStatus: (callback: (eventData: number) => void) => void;
    }
}