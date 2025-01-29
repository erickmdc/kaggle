export function isDev(): boolean {
  console.log(process.env.NODE_ENV);
  return process.env.NODE_ENV === 'development';
}

//Google Form url
export const FORM_URL = (yearOfBirth: number, name: string, sex: string, number: number) => `https://docs.google.com/forms/d/e/1FAIpQLScgU3nOl5T92pvKQi6ATl-Rz83CgFiMMAEyRTBFcLOSu62j4A/formResponse?usp=pp_url&entry.785709935=${yearOfBirth}&entry.1978853702=${name}&entry.663394750=${sex}&entry.119008361=${number}&submit=Submit`;

//Kaggle credentials
export const KAGGLE = {
  url: "https://www.kaggle.com/api/v1/datasets/download/thedevastator/us-baby-names-by-year-of-birth/babyNamesUSYOB-full.csv?datasetVersionNumber=7",
  auth: "erickmdc:be777843b45eb15d6a889548b74064aa"
}