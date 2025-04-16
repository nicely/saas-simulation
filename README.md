# SaaS Growth Simulation

A comprehensive SaaS growth simulation tool built with Vue 3 and Composition API for modeling revenue growth, customer acquisition, and churn predictions for software-as-a-service businesses.

## Online Demo

Try the live demo: [https://nicely.github.io/saas-simulation/](https://nicely.github.io/saas-simulation/)

## Features

- Tab-based interface for different dashboard views
- Breakdown view for MRR goals and plan details
- Prediction view for subscriber growth forecasting
- Dynamic addition of new plans and dashboards
- Reactive calculations based on user inputs

## Project Setup

### Prerequisites

- Node.js (v14 or newer recommended)
- npm or yarn

### Installation

1. Clone the repository or download the files

2. Install dependencies:
```
npm install
```
or
```
yarn
```

3. Start the development server:
```
npm run dev
```
or
```
yarn dev
```

## How to Use

The Excel-like interface consists of:

1. **Breakdown Tab**: 
   - Edit general settings like MRR goals and growth rates
   - Add/remove pricing plans
   - Set customer numbers and see calculated MRR

2. **Prediction Tab**:
   - View forecasted visitor numbers based on growth rates
   - See predicted subscriber acquisition and churn
   - Track net customer growth over time

3. **Custom Dashboards**:
   - Create additional dashboard tabs with the "+ New Dashboard" button
   - Customize these dashboards as needed

## Customization

- Modify the styling in the `<style>` sections of the components
- Adjust calculation formulas in the component methods
- Add additional fields or data points to the tables as needed
- Implement more sophisticated prediction models by modifying the calculation functions

## Vue 3 Composition API

This project uses Vue 3's Composition API. The main benefits include:
- Better code organization with composable functions
- Improved type inference
- More flexible code reuse
- Smaller bundle size with tree-shaking

## License

MIT
