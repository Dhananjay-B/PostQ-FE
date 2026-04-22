# PostQ-FE

`PostQ-FE` is a simple React frontend for the PostQ platform.

This project only provides the user interface for scan input and result visualization.
All scan execution, probing logic, protocol analysis, and quantum risk assessment are handled by the backend project: **PostQ**.

## Backend Project (PostQ)

- PostQ repository: [https://github.com/Dhananjay-B/PostQ]([https://github.com/Dhananjay-B/PostQ)

## What This Frontend Does

- Provides a scan UI for target selection and input (`TLS` / `SSH`)
- Sends scan requests to PostQ backend APIs (currently TLS API integrated)
- Displays nested scan output, including protocol and cipher-suite quantum assessment details

## What This Frontend Does Not Do

- Does not perform network probing directly
- Does not calculate quantum risk locally
- Does not host scan logic or security analysis engines

## Tech Stack

- React (Create React App / `react-scripts`)

## Run Locally

```bash
npm install
npm start
```

App runs by default at:

- [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```
