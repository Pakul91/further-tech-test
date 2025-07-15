# Refund Validation System

A TypeScript application for validating refund requests based on time zones, business hours, and Terms of Service rules.

## Requirements

- Node.js 18+
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone git@github.com:Pakul91/further-tech-test.git
cd further-tech-test
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Run test (currently only for services):

```bash
npm run test
```

5. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Project Structure

- `/data`: Contains JSON configuration files

  - `refundRequests.json`: Sample refund requests
  - `timeLimits.json`: Time limits for refund windows
  - `timeZoneMapping.json`: Mappings of locations to time zones
  - `dayOfWeekMapping.json`: Day of week mappings for DayJS

- `/src`: Source code
  - `/components`: React components
  - `/dataTransformingService`: Service for transforming dates and time zones
  - `/refundValidationService`: Service for validating refund requests
  - `/types`: TypeScript type definitions

## Core Features

- Time zone conversion based on customer location
- Business hours validation (9am-5pm, weekdays only)
- Terms of Service type determination (old vs new)
- Refund window validation based on investment date and request time
- Detailed validation data display with tooltips

## Technologies

- TypeScript
- React
- Vite
- DayJS (for date/time handling)
- React-Tooltip
- Vitest (testing)
